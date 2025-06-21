import { eq, desc, and, gt, lt, asc, sql, isNull, not, inArray, count, lte } from 'drizzle-orm';
import { getAuth } from '@clerk/express';
import * as schema from '../db/schema.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { tavily } from '@tavily/core';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

// ====================================================================
// HELPER: API KEY DETERMINATION
// ====================================================================
const determineApiDetails = (modelId, userKeys, serverKeys) => {
    const freeOpenRouterModels = [
        'mistralai/mistral-7b-instruct:free', 
        'mistralai/devstral-small:free',
        'deepseek/deepseek-r1:free',
        'moonshotai/kimi-dev-72b:free',
        'openai/gpt-4.1-nano'
    ];

    // --- Google Models ---
    const isGoogleModel = modelId.startsWith('google/');
    if (isGoogleModel) {
        // Free tier Google model paid by the server
        if (modelId === 'google/gemini-1.5-flash-latest') {
            if (!serverKeys.google) throw new Error("The free Google model is not configured on the server.");
            return { apiKey: serverKeys.google, apiProvider: 'google', usedServerKey: true };
        }
        // User-paid Google model
        if (userKeys.google) {
            return { apiKey: userKeys.google, apiProvider: 'google', usedServerKey: false };
        }
        throw new Error("A Google API key is required to use this model.");
    }

    // --- OpenRouter Models ---
    const isFreeOpenRouterModel = freeOpenRouterModels.includes(modelId);

    // If a user has provided their own key, it always takes priority for non-Google models.
    if (userKeys.openrouter) {
        return { apiKey: userKeys.openrouter, apiProvider: 'openrouter', usedServerKey: false };
    }

    // If no user key, check if it's a "free" model that the server can pay for.
    if (isFreeOpenRouterModel) {
        if (!serverKeys.openrouter) throw new Error("The free model is not configured on the server.");
        return { apiKey: serverKeys.openrouter, apiProvider: 'openrouter', usedServerKey: true };
    }

    // If it's a paid model and the user hasn't provided a key, it's an error.
    throw new Error("An API key is required to use this model.");
};

// ====================================================================
// DYNAMIC TOKEN MANAGEMENT
// ====================================================================
const calculateMaxTokens = (options = {}) => {
    const {
        isGuest = false,
        modelId = '',
        hasUserKey = false,
        messageLength = 0,
        isStreaming = false,
        useWebSearch = false,
        maximizeTokens = false
    } = options;

    // Base token limits
    let baseLimit = 2000;

    // Adjust for guest vs logged-in users
    if (isGuest) {
        baseLimit = 1500; // More conservative for guests
    } else if (hasUserKey) {
        baseLimit = maximizeTokens ? 8000 : 4000; // Much higher if maximize is enabled
    }

    // Special handling for DeepSeek models with reasoning
    if (modelId.includes('deepseek')) {
        // DeepSeek models need more tokens because they generate reasoning + content
        baseLimit = Math.max(baseLimit, maximizeTokens ? 20000 : 6000); // Much higher if maximize is enabled
    }

    // Adjust for model type
    if (modelId.includes('gpt-4') || modelId.includes('claude-3-opus')) {
        baseLimit = Math.min(baseLimit, maximizeTokens ? 6000 : 3000); // Higher if maximize is enabled
    } else if (modelId.includes('gpt-3.5') || modelId.includes('claude-3-sonnet')) {
        baseLimit = Math.min(baseLimit, maximizeTokens ? 7000 : 3500); // Higher if maximize is enabled
    } else if (modelId.includes('free')) {
        // Don't apply the 2500 limit to DeepSeek models
        if (!modelId.includes('deepseek')) {
            baseLimit = Math.min(baseLimit, maximizeTokens ? 5000 : 2500); // Higher if maximize is enabled
        }
    }

    // Adjust for message length (shorter responses for longer inputs)
    if (messageLength > 1000) {
        baseLimit = Math.floor(baseLimit * 0.7);
    } else if (messageLength > 500) {
        baseLimit = Math.floor(baseLimit * 0.85);
    }

    // Adjust for web search (shorter responses since we have search results)
    if (useWebSearch) {
        baseLimit = Math.floor(baseLimit * 0.8);
    }

    // Adjust for streaming (slightly lower to prevent timeouts)
    if (isStreaming) {
        baseLimit = Math.floor(baseLimit * 0.9);
    }

    // Ensure minimum and maximum bounds
    const minTokens = 500;
    const maxTokens = modelId.includes('deepseek') 
        ? (maximizeTokens ? 25000 : 12000) // Much higher max for DeepSeek when maximized
        : (maximizeTokens ? 15000 : 8000); // Higher max for other models when maximized
    
    const finalTokens = Math.max(minTokens, Math.min(maxTokens, baseLimit));
    console.log("[calculateMaxTokens] modelId:", modelId, "maximizeTokens:", maximizeTokens, "baseLimit:", baseLimit, "maxTokens:", maxTokens, "finalTokens:", finalTokens);
    
    return finalTokens;
};

// ====================================================================
// HELPER FUNCTION FOR GOOGLE MESSAGES FORMATTING
// ====================================================================
const formatGoogleMessages = (messages) => messages.map(msg => ({
    role: msg.sender === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }],
}));

// ====================================================================
// HELPER FUNCTION FOR IMAGE UPLOAD
// ====================================================================
async function uploadImage(base64Image) {
    if (!process.env.IMGBB_API_KEY) {
        throw new Error("IMGBB_API_KEY is not set. Cannot upload image.");
    }
    console.log('Starting image upload to IMGBB...');
    const form = new FormData();
    // The 'image' field is what IMGBB expects
    form.append('image', base64Image);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: form,
        });

        const result = await response.json();
        
        console.log('IMGBB response:', result.success, result.data?.url);

        if (!result.success) {
            // Provide a more detailed error from the API if available
            throw new Error(result.error?.message || 'Failed to upload image to IMGBB.');
        }
        return result.data.url;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        // Re-throw the original error to be caught by the calling function
        throw new Error('Failed to upload image');
    }
}

export const getAllChats = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    try {
        // Fetch all chats for the user with their relationships
        const allChats = await db.query.chats.findMany({
            where: eq(schema.chats.userId, userId),
            orderBy: [
                // First order by sourceChatId (null first, then by ID)
                asc(schema.chats.sourceChatId),
                // Then by branchedFromMessageId for branches
                asc(schema.chats.branchedFromMessageId),
                // Finally by creation date
                desc(schema.chats.createdAt)
            ],
            with: {
                // Include the source chat relationship if it exists
                sourceChat: {
                    columns: {
                        id: true,
                        title: true,
                        modelId: true
                    }
                }
            }
        });

        // Group chats by their root chat (chat with no sourceChatId)
        const chatGroups = new Map();
        allChats.forEach(chat => {
            let rootChatId = chat.id;
            let currentChat = chat;
            
            // Find the root chat by traversing up the sourceChatId chain
            while (currentChat.sourceChatId) {
                const parentChat = allChats.find(c => c.id === currentChat.sourceChatId);
                if (!parentChat) break;
                rootChatId = parentChat.id;
                currentChat = parentChat;
            }
            
            if (!chatGroups.has(rootChatId)) {
                chatGroups.set(rootChatId, []);
            }
            chatGroups.get(rootChatId).push(chat);
        });

        // Sort each group's branches by their branchedFromMessageId
        chatGroups.forEach(group => {
            group.sort((a, b) => {
                if (!a.sourceChatId && !b.sourceChatId) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                if (!a.sourceChatId) return -1;
                if (!b.sourceChatId) return 1;
                return (a.branchedFromMessageId || 0) - (b.branchedFromMessageId || 0);
            });
        });

        // Flatten the groups into a single array, maintaining the order
        const sortedChats = Array.from(chatGroups.values()).flat();

        res.json(sortedChats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Failed to fetch chats." });
    }
};

export const getChatMessages = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const chatIdParam = req.params.chatId;
    const chatId = parseInt(chatIdParam, 10);

    if (isNaN(chatId)) {
        return res.status(400).json({ error: `Invalid Chat ID provided: ${chatIdParam}` });
    }

    try {
        const chat = await db.query.chats.findFirst({
            where: and(eq(schema.chats.id, chatId), eq(schema.chats.userId, userId))
        });
        if (!chat) return res.status(404).json({ error: "Chat not found or you don't have permission to view it." });

        const messages = await db.query.messages.findMany({
            where: eq(schema.messages.chatId, chatId),
            orderBy: [asc(schema.messages.createdAt)],
        });

        // Parse search results from JSON string if present
        const parsedMessages = messages.map(msg => ({
            ...msg,
            searchResults: msg.searchResults ? JSON.parse(msg.searchResults) : null
        }));

        res.json(parsedMessages);
    } catch (e) {
        console.error('Failed to fetch messages:', e);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const deleteChat = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const chatIdParam = req.params.chatId;
    const chatIdToDelete = parseInt(chatIdParam, 10);

    if (isNaN(chatIdToDelete)) {
        return res.status(400).json({ error: `Invalid Chat ID provided: ${chatIdParam}` });
    }
    if (!chatIdToDelete) return res.status(400).json({ error: "Chat ID is required." });

    try {
        // First, ensure the chat belongs to the user
        const chatToDelete = await db.query.chats.findFirst({
            where: and(
                eq(schema.chats.id, chatIdToDelete),
                eq(schema.chats.userId, userId)
            )
        });
        if (!chatToDelete) {
             return res.status(404).json({ error: "Chat not found or permission denied." });
        }

        // Find all direct children (branches) of the chat we are deleting
        const childChats = await db.query.chats.findMany({
            where: eq(schema.chats.sourceChatId, chatIdToDelete),
        });

        // If there are branches, "promote" them to become root chats
        if (childChats.length > 0) {
            await db.update(schema.chats)
                .set({
                    sourceChatId: null,
                    branchedFromMessageId: null,
                })
                .where(inArray(schema.chats.id, childChats.map(c => c.id)));
        }

        // Now that children are independent, we can safely delete messages of the parent chat
        await db.delete(schema.messages)
            .where(eq(schema.messages.chatId, chatIdToDelete));
        
        // Finally, delete the parent chat itself. This will now succeed.
        await db.delete(schema.chats)
            .where(eq(schema.chats.id, chatIdToDelete));

        res.json({ 
            deletedChatId: chatIdToDelete,
            // Let the frontend know which chats were promoted
            promotedChats: childChats.map(c => c.id) 
        });
    } catch (error) {
        console.error("Error deleting chat:", error);
        if (error.cause?.code === '23503') { // Foreign key violation
            return res.status(409).json({ 
                error: "Cannot delete this chat because it is referenced by another chat. Please try again." 
            });
        }
        res.status(500).json({ error: "Failed to delete chat." });
    }
};

export const updateChatTitle = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const chatIdParam = req.params.chatId;
    const chatId = parseInt(chatIdParam, 10);
    if (isNaN(chatId)) {
        return res.status(400).json({ error: `Invalid Chat ID provided: ${chatIdParam}` });
    }

    const { newTitle } = req.body;

    if (!newTitle || newTitle.trim().length === 0) {
        return res.status(400).json({ error: "New title cannot be empty." });
    }

    try {
        const [updatedChat] = await db.update(schema.chats)
            .set({ title: newTitle.substring(0, 255) }) // Enforce max length
            .where(and(
                eq(schema.chats.id, chatId),
                eq(schema.chats.userId, userId)
            ))
            .returning({ id: schema.chats.id, title: schema.chats.title });

        if (!updatedChat) {
            return res.status(404).json({ error: "Chat not found or you don't have permission." });
        }

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error("Error updating chat title:", error);
        res.status(500).json({ error: "Failed to update chat title." });
    }
};

// NEW: Function to update the model for a specific chat
export const updateChatModel = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const chatIdParam = req.params.chatId;
    const chatId = parseInt(chatIdParam, 10);
    if (isNaN(chatId)) {
        return res.status(400).json({ error: `Invalid Chat ID provided: ${chatIdParam}` });
    }

    const { newModelId } = req.body;

    if (!newModelId || typeof newModelId !== 'string') {
        return res.status(400).json({ error: "A valid newModelId is required." });
    }

    try {
        const [updatedChat] = await db.update(schema.chats)
            .set({ modelId: newModelId })
            .where(and(
                eq(schema.chats.id, chatId),
                eq(schema.chats.userId, userId)
            ))
            .returning({ id: schema.chats.id, modelId: schema.chats.modelId });

        if (!updatedChat) {
            return res.status(404).json({ error: "Chat not found or you don't have permission." });
        }

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error("Error updating chat model:", error);
        res.status(500).json({ error: "Failed to update chat model." });
    }
};

export const deleteMessage = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const messageIdParam = req.params.messageId;
    const messageIdToDelete = parseInt(messageIdParam, 10);

    if (isNaN(messageIdToDelete)) {
        return res.status(400).json({ error: `Invalid Message ID provided: ${messageIdParam}` });
    }

    try {
        const message = await db.query.messages.findFirst({
            where: eq(schema.messages.id, messageIdToDelete),
            with: { chat: true }
        });

        if (!message) {
            return res.status(404).json({ error: "Message not found." });
        }
        if (message.chat.userId !== userId) {
            return res.status(403).json({ error: "You don't have permission to delete this message." });
        }
        
        const idsToDelete = [messageIdToDelete];
        
        if (message.sender === 'user') {
            const nextAiMessage = await db.query.messages.findFirst({
                where: and(
                    eq(schema.messages.chatId, message.chatId),
                    gt(schema.messages.id, messageIdToDelete),
                    eq(schema.messages.sender, 'ai')
                ),
                orderBy: [asc(schema.messages.id)]
            });
            
            if (nextAiMessage) {
                idsToDelete.push(nextAiMessage.id);
            }
        }
        
        if (idsToDelete.length > 0) {
            await db.delete(schema.messages).where(inArray(schema.messages.id, idsToDelete));
        }

        const [remaining] = await db.select({ value: count() })
            .from(schema.messages)
            .where(eq(schema.messages.chatId, message.chatId));

        let chatDeleted = false;
        let promotedChats = []; // Keep track of promoted chats

        if (remaining.value === 0) {
            const chatIdToDelete = message.chatId;

            // Find all direct children (branches) of the chat we are about to delete
            const childChats = await db.query.chats.findMany({
                where: eq(schema.chats.sourceChatId, chatIdToDelete),
            });

            // If there are branches, "promote" them to become root chats
            if (childChats.length > 0) {
                await db.update(schema.chats)
                    .set({
                        sourceChatId: null,
                        branchedFromMessageId: null,
                    })
                    .where(inArray(schema.chats.id, childChats.map(c => c.id)));
                promotedChats = childChats.map(c => c.id);
            }

            // Now we can safely delete the empty chat.
            await db.delete(schema.chats).where(eq(schema.chats.id, chatIdToDelete));
            chatDeleted = true;
        }

        res.status(200).json({ 
            success: true, 
            message: "Message(s) deleted.", 
            deletedIds: idsToDelete,
            chatDeleted: chatDeleted,
            deletedChatId: chatDeleted ? message.chatId : null,
            promotedChats: promotedChats // Send promoted chat IDs to the frontend
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message.' });
    }
};

export const branchChat = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const { sourceChatId, fromAiMessageId, newModelId } = req.body;
    if (!sourceChatId || !fromAiMessageId || !newModelId) return res.status(400).json({ error: "All IDs are required." });

    try {
        // Get the source chat and verify ownership
        const sourceChat = await db.query.chats.findFirst({
            where: and(eq(schema.chats.id, sourceChatId), eq(schema.chats.userId, userId))
        });
        if (!sourceChat) return res.status(404).json({ error: "Source chat not found." });

        // Get all messages up to and including the branch point
        const messagesToCopy = await db.query.messages.findMany({
            where: and(
                eq(schema.messages.chatId, sourceChatId),
                lte(schema.messages.id, fromAiMessageId)  // Changed from lt to lte to include the branch point
            ),
            orderBy: [asc(schema.messages.id)]
        });
        
        if (messagesToCopy.length === 0) throw new Error("No messages found to branch.");

        // Create the new chat with proper relationship
        const newChatTitle = `[Branch] ${sourceChat.title}`.substring(0, 255);
        const [newChat] = await db.insert(schema.chats).values({
            userId,
            title: newChatTitle,
            modelId: newModelId,
            sourceChatId: parseInt(sourceChatId),
            branchedFromMessageId: parseInt(fromAiMessageId),
            createdAt: new Date()  // Explicitly set creation time
        }).returning();

        // Copy messages to the new chat
        const newMessages = messagesToCopy.map(msg => ({
            ...msg,
            id: undefined,
            chatId: newChat.id,
            createdAt: new Date()  // Ensure proper message ordering
        }));
        await db.insert(schema.messages).values(newMessages);
        
        res.status(201).json(newChat);
    } catch (error) {
        console.error("Error branching chat:", error);
        res.status(500).json({ error: "Failed to branch the chat." });
    }
};

export const handleChat = (db, genAI, tavily) => async (req, res) => {
    const { userId } = getAuth(req);
    const { messages, chatId, modelId, useWebSearch, fileData, fileMimeType, fileName, userApiKey, userTavilyKey } = req.body;

    if (!messages) return res.status(400).json({ error: 'Invalid request: Messages are missing.' });

    try {
        let lastUserMessage = { ...messages[messages.length - 1] };
        const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
        
        let searchResults = null;
        let imageUrl = null;
        let fileInfo = { name: null, type: null };
        let imageDataForAI = null;
        let finalPrompt = lastUserMessage.content;

        if (fileData && fileMimeType && fileName) {
            fileInfo = { name: fileName, type: fileMimeType };
            if (fileMimeType.startsWith('image/')) {
                imageDataForAI = fileData;
                imageUrl = await uploadImage(fileData);
            } else if (fileMimeType === 'application/pdf') {
                try {
                    const pdfBuffer = Buffer.from(fileData, 'base64');
                    // Use the globally required pdf function
                    const data = await pdf(pdfBuffer);
                    const pdfText = data.text.substring(0, 20000); // Limit PDF text to avoid large prompts
                    finalPrompt = `Based on the content of the attached PDF "${fileName}":\n---\n${pdfText}\n---\n\nAnswer the user's query: "${finalPrompt}"`;
                } catch (error) {
                    console.error('PDF parsing error:', error);
                    finalPrompt = `I see you've uploaded a PDF file named "${fileName}", but I encountered an issue while trying to extract its text content. Please copy and paste the relevant text from the PDF if you'd like me to help you with it.\n\nYour original question: "${finalPrompt}"`;
                }
            }
        }

        if (useWebSearch) {
            const activeTavily = userTavilyKey ? new tavily(userTavilyKey) : tavily;
            
            // Truncate the search query if it's too long
            const maxQueryLength = 380; // Leave some buffer for safety
            const searchQuery = finalPrompt.length > maxQueryLength 
                ? finalPrompt.substring(0, maxQueryLength - 3) + '...'
                : finalPrompt;
            
            const searchResponse = await activeTavily.search(searchQuery, { maxResults: 5 });
            
            searchResults = searchResponse.results;
            const contextText = searchResults.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n');
            finalPrompt = `Based on these search results:\n---\n${contextText}\n---\n\nAnswer the user's query: "${finalPrompt}"`;
        }

        let aiResponseContent = '';
        let reasoningData = null;
        const isGoogleModel = modelId.startsWith('google/');

        if (isGoogleModel) {
            const googleThinkingModels = ['google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite-preview-06-17'];
            const isThinkingModel = googleThinkingModels.includes(modelId);
            
            // Use the modelId from the request, removing the 'google/' prefix for the SDK
            const model = genAI.getGenerativeModel({ model: modelId.replace('google/', '') });

            const formattedHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            const generationConfig = {};
            if (isThinkingModel) {
                generationConfig.thinkingConfig = {
                    includeThoughts: true,
                    thinkingBudget: -1, // Use dynamic thinking
                };
            }

            const promptParts = [{ text: finalPrompt }];
            if (imageDataForAI && fileMimeType.startsWith('image/')) {
                promptParts.push({ inlineData: { data: imageDataForAI, mimeType: fileMimeType } });
            }

            const chat = model.startChat({ history: formattedHistory, generationConfig });
            const result = await chat.sendMessageStream(promptParts);
            
            for await (const chunk of result.stream) {
                for (const part of (chunk.candidates?.[0]?.content?.parts || [])) {
                    if (part.thought) {
                        // This is a thought part. The content is in part.text.
                        reasoningData += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'google_thought_word', content: part.text })}\n\n`);
                    } else if (part.text) {
                        // This is a regular content part.
                        aiResponseContent += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'content_word', content: part.text })}\n\n`);
                    }
                }
            }

        } else { 
            const { apiKey: apiKeyToUse } = determineApiDetails(modelId, userApiKey, process.env.OPENROUTER_API_KEY);

            let openRouterMessageContent = [{ type: 'text', text: finalPrompt }];
            if (imageDataForAI && fileMimeType.startsWith('image/')) {
                openRouterMessageContent.push({ type: 'image_url', image_url: { url: `data:${fileMimeType};base64,${imageDataForAI}` } });
            }
            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKeyToUse}` },
                body: JSON.stringify({ 
                    model: modelId, 
                    messages: [...history, { role: 'user', content: openRouterMessageContent }],
                    include_reasoning: modelId === 'deepseek/deepseek-r1:free',
                    max_tokens: calculateMaxTokens({
                        isGuest: !userId, // Guest if no userId
                        modelId,
                        hasUserKey: !!userApiKey,
                        messageLength: finalPrompt.length,
                        isStreaming: true,
                        useWebSearch,
                        maximizeTokens: req.body.maximizeTokens || false
                    })
                }),
            });
            if (!openRouterResponse.ok) {
                const errorData = await openRouterResponse.json();
                if (openRouterResponse.status === 402) throw new Error("OpenRouter API key has insufficient funds for this model.");
                throw new Error(`OpenRouter Error: ${errorData.error?.message || 'An unknown error occurred'}`);
            }
            const data = await openRouterResponse.json();
            aiResponseContent = data.choices[0].message.content;
            reasoningData = data.choices[0].message.reasoning || null;
        }

        let currentChatId = chatId;
        let newChat = null;
        
        if (!chatId) {
            const title = messages[messages.length - 1].content.substring(0, 30) || "New Chat";
            [newChat] = await db.insert(schema.chats).values({ userId, title, modelId }).returning();
            currentChatId = newChat.id;
        }

        const [userMessage] = await db.insert(schema.messages).values({ 
            chatId: currentChatId, 
            sender: 'user', 
            content: messages[messages.length - 1].content,
            imageUrl: imageUrl,
            fileName: fileInfo.name,
            fileType: fileInfo.type,
            usedWebSearch: useWebSearch
        }).returning();

        const [newAiMessage] = await db.insert(schema.messages).values({ 
            chatId: currentChatId, 
            sender: 'ai', 
            content: aiResponseContent,
            modelId: modelId,
            searchResults: searchResults ? JSON.stringify(searchResults) : null,
            reasoning: reasoningData
        }).returning();
        
        res.json({ 
            userMessage, 
            aiMessage: {
                ...newAiMessage,
                searchResults: searchResults,
                reasoning: reasoningData
            }, 
            newChat, 
            chatId: currentChatId
        });
    } catch (error) {
        console.error('Error in chat handler:', error);
        res.status(500).json({ error: `API Error: ${error.message}` });
    }
};

// NEW Controller Function
export const getSharedChat = (db) => async (req, res) => {
    const { shareId } = req.params;
    const chatId = parseInt(shareId, 10);

    if (isNaN(chatId)) {
        return res.status(400).json({ error: 'Invalid share ID format.' });
    }

    try {
        const chat = await db.query.chats.findFirst({
            where: eq(schema.chats.id, chatId),
            columns: {
                title: true,
                modelId: true,
                createdAt: true,
            },
            with: {
                messages: {
                    columns: {
                        id: true,
                        sender: true,
                        content: true,
                        imageUrl: true,
                        fileName: true,
                        fileType: true,
                        usedWebSearch: true,
                        modelId: true,
                        createdAt: true,
                    },
                    orderBy: [asc(schema.messages.id)],
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Shared chat not found.' });
        }
        
        // Return a simplified, public-safe version of the chat
        res.json({
            title: chat.title,
            messages: chat.messages,
        });

    } catch (error) {
        console.error(`Error fetching shared chat ${chatId}:`, error);
        res.status(500).json({ error: 'Could not retrieve shared chat.' });
    }
};

export default function(db, genAI, tavily) {
    const guestRouter = Router();
    const protectedRouter = Router();

    // Guest and Public Routes
    guestRouter.post('/chat/guest/stream', handleGuestChatStreaming(genAI));
    guestRouter.get('/share/:shareId', getSharedChat(db)); // ADDED: New public share route

    // ... (rest of the routes are unchanged)

    return { guestRouter, protectedRouter };
}

export const regenerateResponse = (db, genAI, tavily) => async (req, res) => {
    const { userId } = getAuth(req);
    const { messageId, newContent, chatId, modelId, userApiKey, useWebSearch, userTavilyKey } = req.body;
    if (!messageId || !newContent || !chatId || !modelId) {
        return res.status(400).json({ error: 'Missing required fields for regeneration.' });
    }

    try {
        // Step 1: Update the user's message in the database with the new content
        const [updatedUserMessage] = await db.update(schema.messages)
            .set({
                content: newContent,
                editCount: sql`${schema.messages.editCount} + 1`,
                usedWebSearch: useWebSearch || false
            })
            .where(and(
                eq(schema.messages.id, messageId),
                eq(schema.messages.sender, 'user')
            ))
            .returning();
        
        if (!updatedUserMessage) {
            return res.status(404).json({ error: "Message to edit not found or you don't have permission." });
        }

        // Step 2: Delete all messages that came AFTER the user's prompt
        await db.delete(schema.messages).where(and(
            eq(schema.messages.chatId, chatId),
            gt(schema.messages.id, updatedUserMessage.id)
        ));
        
        // Step 3: Fetch the history of messages *before* the edited message for context
        const historyForAI = await db.query.messages.findMany({
            where: and(
                eq(schema.messages.chatId, chatId), 
                lt(schema.messages.id, updatedUserMessage.id)
            ),
            orderBy: [asc(schema.messages.id)],
        });

        // Step 4: Perform web search if enabled
        let searchResults = null;
        let searchQueries = null;
        let finalPromptContent = newContent || ''; // Handle empty content
        
        // If content is empty or just a placeholder, provide a default prompt for image analysis
        if (!finalPromptContent || finalPromptContent === '[Image uploaded]') {
            finalPromptContent = 'Please analyze this image and provide a detailed description of what you see.';
        }
        
        if (useWebSearch) {
            const tavilyKeyToUse = userTavilyKey || process.env.TAVILY_API_KEY;
            if (!tavilyKeyToUse) throw new Error("No Tavily API key available.");
            
            // Truncate the search query if it's too long
            const maxQueryLength = 380; // Leave some buffer for safety
            const searchQuery = finalPromptContent.length > maxQueryLength 
                ? finalPromptContent.substring(0, maxQueryLength - 3) + '...'
                : finalPromptContent;
            
            const searchResponse = await tavily.search(searchQuery, { maxResults: 5 });
            searchResults = searchResponse.results;
            searchQueries = searchResponse.query_suggestions;
            finalPromptContent = `Based on these search results:\n---\n${searchResults.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n')}\n---\n\nAnswer the user's query: "${finalPromptContent}"`;
        }

        // Step 5: Call the AI with the updated content, history, and search results
        let aiResponseContent = '';
        let reasoningData = '';
        const isGoogleModel = modelId.startsWith('google/');

        if (isGoogleModel) {
            const googleThinkingModels = ['google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite-preview-06-17'];
            const isThinkingModel = googleThinkingModels.includes(modelId);

            // Use the modelId from the request, removing the 'google/' prefix for the SDK
            const model = genAI.getGenerativeModel({ model: modelId.replace('google/', '') });

            const generationConfig = {};
            if (isThinkingModel) {
                generationConfig.thinkingConfig = {
                    includeThoughts: true,
                    thinkingBudget: -1, // Use dynamic thinking
                };
            }

            const formattedHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            const promptParts = [{ text: finalPrompt }];
            if (imageDataForAI && fileMimeType.startsWith('image/')) {
                promptParts.push({ inlineData: { data: imageDataForAI, mimeType: fileMimeType } });
            }
            
            const chat = model.startChat({ history: formatGoogleMessages(historyForAI), generationConfig });
            const result = await chat.sendMessageStream(promptParts);
            
            for await (const chunk of result.stream) {
                for (const part of (chunk.candidates?.[0]?.content?.parts || [])) {
                    if (part.thought) {
                        // This is a thought part. The content is in part.text.
                        reasoningData += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'google_thought_word', content: part.text })}\n\n`);
                    } else if (part.text) {
                        // This is a regular content part.
                        aiResponseContent += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'content_word', content: part.text })}\n\n`);
                    }
                }
            }

        } else {
            // Modified logic to select the correct API key
            const { apiKey: apiKeyToUse, usedServerKey } = determineApiDetails(modelId, userApiKey, process.env.OPENROUTER_API_KEY);

            // Include search results in the system message if available
            const systemMessage = searchResults 
                ? { role: 'system', content: `Here are some relevant search results to help answer the query:\n\n${JSON.stringify(searchResults, null, 2)}` }
                : null;

            const apiMessages = [
                ...(systemMessage ? [systemMessage] : []),
                ...historyForAI.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.content })),
                { role: 'user', content: finalPromptContent }
            ];

            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKeyToUse}`, "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    model: modelId, 
                    messages: apiMessages,
                    include_reasoning: modelId === 'deepseek/deepseek-r1:free',
                    max_tokens: calculateMaxTokens({
                        isGuest: !userId, // Guest if no userId
                        modelId,
                        hasUserKey: !!userApiKey,
                        messageLength: finalPrompt.length,
                        isStreaming: true,
                        useWebSearch,
                        maximizeTokens: req.body.maximizeTokens || false
                    })
                }),
            });
            if (!openRouterResponse.ok) throw new Error(await openRouterResponse.text());
            const data = await openRouterResponse.json();
            aiResponseContent = data.choices[0].message.content;
            reasoningData = data.choices[0].message.reasoning || null;
        }

        // Step 6: Insert the new AI response into the database
        const [newAiMessage] = await db.insert(schema.messages).values({
            chatId: chatId, 
            sender: 'ai', 
            content: aiResponseContent,
            modelId: modelId,
            searchResults: searchResults ? JSON.stringify(searchResults) : null,
            reasoning: reasoningData
        }).returning();

        // Step 7: Send back the new AI message and search results
        res.status(200).json({ 
            newAiMessage: {
                ...newAiMessage,
                reasoning: reasoningData
            },
            searchResults: searchResults || null
        });

    } catch (error) {
        console.error('Error regenerating response:', error);
        res.status(500).json({ error: `Failed to regenerate response: ${error.message}` });
    }
};

export const handleGuestChat = (genAI) => async (req, res) => {
    // Note: No getAuth(req) because this is a public endpoint.
    const { messages, modelId = 'google/gemini-1.5-flash-latest' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Invalid request: Messages are missing or invalid.' });
    }
    
    // Only check for OpenRouter API key if using non-Google models
    const isGoogleModel = (req.body.modelId || 'google/gemini-1.5-flash-latest').startsWith('google/');
    if (!isGoogleModel && !process.env.OPENROUTER_API_KEY) {
        return res.status(503).json({ error: 'Guest service is temporarily unavailable.' });
    }

    // Validate that the requested model is a free model
    const freeModels = [
        'google/gemini-1.5-flash-latest',
        'google/gemini-pro-1.5',
        'mistralai/mistral-7b-instruct:free',
        'mistralai/devstral-small:free',
        'nousresearch/hermes-3-llama-3.1-70b'
    ];
    
    if (!freeModels.includes(modelId)) {
        return res.status(400).json({ error: 'Invalid model for guest usage. Only free models are allowed.' });
    }

    try {
        const lastUserMessage = messages[messages.length - 1];
        // For guests, we only consider the last message for simplicity, but you could include history.
        const historyForAI = messages.slice(0, -1).map(m => ({ 
            role: m.sender === 'ai' ? 'assistant' : 'user', 
            content: m.content 
        }));

        // Check if it's a Google model
        const isGoogleModel = modelId.startsWith('google/');
        
        if (isGoogleModel) {
            // Use Google's genAI for Google models
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            
            // Format history for Google's API
            const formattedHistory = historyForAI.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            // Use startChat to include conversation history
            const chat = model.startChat({ history: formatGoogleMessages(historyForAI) });
            const result = await chat.sendMessage(lastUserMessage.content);
            
            const aiResponseContent = result.response.text();

            res.json({ 
                content: aiResponseContent,
                reasoning: null
            });
            return;
        }

        // Use OpenRouter for non-Google models (Mistral, etc.)
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: modelId,
                messages: [...historyForAI, { role: 'user', content: lastUserMessage.content }],
                include_reasoning: false,
                stream: true,
                max_tokens: calculateMaxTokens({
                    isGuest: true, // This is a guest function
                    modelId,
                    hasUserKey: false, // No user key for guests
                    messageLength: messages[messages.length - 1].content.length,
                    isStreaming: true,
                    useWebSearch: false,
                    maximizeTokens: false // Guests can't maximize tokens
                })
            }),
        });

        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.json();
            console.error('Guest API Error from OpenRouter:', errorData);
            throw new Error(errorData.error?.message || 'Failed to get a response from the AI model.');
        }

        const data = await openRouterResponse.json();
        const aiResponseContent = data.choices[0].message.content;

        // We just return the content, as we are not saving anything.
        res.json({ 
            content: aiResponseContent,
            reasoning: data.choices[0].message.reasoning || null
        });

    } catch (error) {
        console.error('Error in guest chat handler:', error);
        res.status(500).json({ error: `API Error: ${error.message}` });
    }
};

export const handleGuestChatStreaming = (genAI) => async (req, res) => {
    const { messages, modelId = 'google/gemini-1.5-flash-latest' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Invalid request: Messages are missing or invalid.' });
    }
    
    // Only check for OpenRouter API key if using non-Google models
    const isGoogleModel = (req.body.modelId || 'google/gemini-1.5-flash-latest').startsWith('google/');
    if (!isGoogleModel && !process.env.OPENROUTER_API_KEY) {
        return res.status(503).json({ error: 'Guest service is temporarily unavailable.' });
    }

    const freeModels = [
        'google/gemini-1.5-flash-latest',
        'google/gemini-pro-1.5',
        'mistralai/mistral-7b-instruct:free',
        'mistralai/devstral-small:free',
        'nousresearch/hermes-3-llama-3.1-70b'
    ];
    
    if (!freeModels.includes(modelId)) {
        return res.status(400).json({ error: 'Invalid model for guest usage. Only free models are allowed.' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    try {
        const historyForAI = messages.slice(0, -1).map(m => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.content
        }));
        const lastUserMessage = messages[messages.length - 1];

        // Check if it's a Google model
        const isGoogleModel = modelId.startsWith('google/');
        
        if (isGoogleModel) {
            // Use Google's genAI for Google models
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            
            // Format history for Google's API
            const formattedHistory = historyForAI.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            // Use startChat to include conversation history
            const chat = model.startChat({ history: formatGoogleMessages(historyForAI) });
            const result = await chat.sendMessageStream(lastUserMessage.content);
            
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    res.write(`data: ${JSON.stringify({ type: 'content_word', content: chunkText })}\n\n`);
                }
            }
            
            res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
            res.end();
            return;
        }

        // Use OpenRouter for non-Google models (Mistral, etc.)
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: modelId,
                messages: [...historyForAI, { role: 'user', content: lastUserMessage.content }],
                include_reasoning: false,
                stream: true,
                max_tokens: calculateMaxTokens({
                    isGuest: true, // This is a guest function
                    modelId,
                    hasUserKey: false, // No user key for guests
                    messageLength: messages[messages.length - 1].content.length,
                    isStreaming: true,
                    useWebSearch: false,
                    maximizeTokens: false // Guests can't maximize tokens
                })
            }),
        });

        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.json();
            throw new Error(errorData.error?.message || 'Failed to get a response from the AI model.');
        }

        const stream = openRouterResponse.body;
        let buffer = '';

        stream.on('data', (chunk) => {
            buffer += chunk.toString();
            let boundary;
            while ((boundary = buffer.indexOf('\n')) !== -1) {
                const line = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1);
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data.trim() === '[DONE]') {
                        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
                        res.end();
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0]) {
                            const choice = parsed.choices[0];
                            if (choice.delta?.content) {
                                res.write(`data: ${JSON.stringify({ type: 'content_word', content: choice.delta.content })}\n\n`);
                            }
                            if (choice.delta?.reasoning) {
                                res.write(`data: ${JSON.stringify({ type: 'reasoning_word', content: choice.delta.reasoning })}\n\n`);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing streaming data line:', line, e);
                    }
                }
            }
        });

        stream.on('end', async () => {
            // Guest chats are not saved, so just end the stream.
            // The frontend will assemble the final message.
            res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
            res.end();
        });

        stream.on('error', (error) => {
            console.error('Stream error from OpenRouter:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream error occurred.' })}\n\n`);
            res.end();
        });

    } catch (error) {
        console.error('Error in guest streaming handler:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: `API Error: ${error.message}` })}\n\n`);
        res.end();
    }
};

export const migrateGuestChats = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const { guestChats } = req.body;

    if (!guestChats || !Array.isArray(guestChats) || guestChats.length === 0) {
        return res.status(400).json({ error: 'Guest chats data is missing or invalid.' });
    }

    try {
        for (const guestChat of guestChats) {
            if (!guestChat.title || !guestChat.modelId || !guestChat.createdAt) {
                console.warn('Skipping invalid guest chat object during migration:', guestChat);
                continue;
            }

            const [newChat] = await db.insert(schema.chats).values({
                userId: userId,
                title: guestChat.title,
                modelId: guestChat.modelId,
                createdAt: new Date(guestChat.createdAt),
            }).returning();
            
            if (guestChat.messages && guestChat.messages.length > 0) {
                // FIX: Filter out messages that have no content to prevent DB errors.
                const validMessagesToInsert = guestChat.messages
                    .filter(msg => msg.content !== null && msg.content !== undefined && msg.content.trim() !== '')
                    .map(msg => ({
                        chatId: newChat.id,
                        sender: msg.sender,
                        content: msg.content,
                        editCount: msg.editCount || 0,
                        modelId: msg.modelId || guestChat.modelId,
                        createdAt: new Date(msg.createdAt || guestChat.createdAt),
                    }));

                if (validMessagesToInsert.length > 0) {
                    await db.insert(schema.messages).values(validMessagesToInsert);
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            message: 'Guest history migrated successfully.',
            migratedCount: guestChats.length
        });

    } catch (error) {
        console.error("Error migrating guest chats:", error);
        res.status(500).json({ 
            error: "Failed to migrate guest history.",
            details: error.message 
        });
    }
};

// ====================================================================
// SMART SEARCH SUGGESTIONS (AI-ASSISTED)
// ====================================================================
// Gemini-based search suggestion generator
const generateSearchSuggestions = async (tavilyClient, query, genAI) => {
    try {
        const context = await tavilyClient.search(query, { searchDepth: "basic", maxResults: 3 });
        const contextString = JSON.stringify(context.results.map(r => ({ title: r.title, content: r.content.substring(0, 150) })));
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const prompt = `You are an expert research assistant. Based on the user's initial query and the provided search context, generate 3-5 concise, insightful, and actionable search queries that anticipate the user's next steps. Focus on follow-up questions, comparing concepts, or exploring related topics.
        
        Initial Query: "${query}"
        Search Context: ${contextString}

        Return ONLY a valid JSON array of strings. Example: ["How does X compare to Y?", "What are the applications of Z?"]`;
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const suggestionsText = response.text().replace(/```json\n?/, '').replace(/```$/, '');
        const suggestions = JSON.parse(suggestionsText);
        
        return Array.isArray(suggestions) ? suggestions.filter(s => typeof s === 'string') : [];

    } catch (error) {
        console.error("Error generating search suggestions with Gemini:", error);
        return []; // Return empty array on failure
    }
};

export const handleStreamingChat = (db, genAI, tavily) => async (req, res) => {
    const { userId } = getAuth(req);
    const { messages, chatId, modelId, useWebSearch, fileData, fileMimeType, fileName, userApiKey, userTavilyKey, maximizeTokens } = req.body;

    console.log("[handleStreamingChat] maximizeTokens received:", maximizeTokens);

    if (!messages) return res.status(400).json({ error: 'Invalid request: Messages are missing.' });

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    try {
        let lastUserMessage = { ...messages[messages.length - 1] };
        const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
        
        let searchResults = null;
        let searchQueries = null;
        let imageUrl = null;
        let fileInfo = { name: null, type: null };
        let imageDataForAI = null;
        let finalPrompt = lastUserMessage.content;

        // --- Step 1: Handle File Uploads (Image or PDF) ---
        if (fileData && fileMimeType && fileName) {
            fileInfo = { name: fileName, type: fileMimeType };
            if (fileMimeType.startsWith('image/')) {
                // We need the image data for the AI and a URL for the database
                imageDataForAI = fileData;
                imageUrl = await uploadImage(fileData);
            } else if (fileMimeType === 'application/pdf') {
                try {
                    const pdfBuffer = Buffer.from(fileData, 'base64');
                    // Use the globally required pdf function
                    const data = await pdf(pdfBuffer);
                    const pdfText = data.text.substring(0, 20000);
                    finalPrompt = `Based on the content of the attached PDF "${fileName}":\n---\n${pdfText}\n---\n\nAnswer the user's query: "${lastUserMessage.content}"`;
                } catch (error) {
                    console.error('PDF parsing error:', error);
                    finalPrompt = `I see you've uploaded a PDF file named "${fileName}", but I encountered an issue while trying to extract its text content. Please copy and paste the relevant text from the PDF if you'd like me to help you with it.\n\nYour original question: "${lastUserMessage.content}"`;
                }
            }
        }

        // --- Step 2: Perform Web Search if Enabled ---
        if (useWebSearch) {
            let searchQuery = lastUserMessage.content;

            // If there's an image, get a description first to use as the search query.
            if (imageDataForAI) {
                const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
                const imageDescriptionPrompt = "Describe this image in a way that can be used as a web search query. Focus on key objects, text, and concepts. Be concise and use only essential keywords. Keep it under 100 characters.";
                
                const visionResult = await visionModel.generateContent([
                    imageDescriptionPrompt,
                    { inlineData: { data: imageDataForAI, mimeType: fileMimeType } }
                ]);
                
                const description = visionResult.response.text().trim();
                
                // Smart query construction with length management
                const maxQueryLength = 380; // Leave some buffer for safety
                const userQueryLength = lastUserMessage.content.length;
                
                if (userQueryLength >= maxQueryLength) {
                    // If user query is already too long, truncate it
                    searchQuery = lastUserMessage.content.substring(0, maxQueryLength - 3) + '...';
                } else {
                    // Combine user query with image description, but respect the limit
                    const availableSpace = maxQueryLength - userQueryLength - 1; // -1 for space
                    const truncatedDescription = description.length > availableSpace 
                        ? description.substring(0, availableSpace - 3) + '...'
                        : description;
                    
                    searchQuery = `${lastUserMessage.content} ${truncatedDescription}`.trim();
                }
                
                console.log('Performing vision-based web search with query:', searchQuery);
                console.log('Query length:', searchQuery.length);
            }

            const activeTavily = userTavilyKey ? new tavily(userTavilyKey) : tavily;
            // --- SMART SUGGESTIONS: Use Promise.all to get both search results and suggestions ---
            const [searchResponse, suggestions] = await Promise.all([
                activeTavily.search(searchQuery, { maxResults: 5, searchDepth: "advanced" }),
                generateSearchSuggestions(activeTavily, searchQuery, genAI)
            ]);
            
            searchResults = searchResponse.results;
            searchQueries = suggestions; // Use the new smart suggestions

            const contextText = searchResults.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n');
            finalPrompt = `Based on these search results:\n---\n${contextText}\n---\n\nAnswer the user's query: "${lastUserMessage.content}"`;
        }

        // --- Step 3: Save the User's Message to the Database ---
        let currentChatId = chatId;
        let newChat = null;
        if (!chatId) {
            const title = messages[messages.length - 1].content.substring(0, 30) || "New Chat";
            [newChat] = await db.insert(schema.chats).values({ userId, title, modelId }).returning();
            currentChatId = newChat.id;
        }

        const [userMessage] = await db.insert(schema.messages).values({ 
            chatId: currentChatId, 
            sender: 'user', 
            content: messages[messages.length - 1].content,
            imageUrl: imageUrl,
            fileName: fileInfo.name,
            fileType: fileInfo.type,
            usedWebSearch: useWebSearch
        }).returning();

        res.write(`data: ${JSON.stringify({ type: 'chat_info', chatId: currentChatId, newChat, userMessage })}\n\n`);

        // --- Step 4: Stream the Final AI Response ---
        const isGoogleModel = modelId.startsWith('google/');
        let reasoningData = '';
        let aiResponseContent = '';

        if (isGoogleModel) {
            const googleThinkingModels = ['google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite-preview-06-17'];
            const isThinkingModel = googleThinkingModels.includes(modelId);

            // Use the modelId from the request, removing the 'google/' prefix for the SDK
            const model = genAI.getGenerativeModel({ model: modelId.replace('google/', '') });

            const generationConfig = {};
            if (isThinkingModel) {
                generationConfig.thinkingConfig = {
                    includeThoughts: true,
                    thinkingBudget: -1, // Use dynamic thinking
                };
            }
            
            const formattedHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));
            
            const promptParts = [{ text: finalPrompt }];
            if (imageDataForAI && fileMimeType.startsWith('image/')) {
                promptParts.push({ inlineData: { data: imageDataForAI, mimeType: fileMimeType } });
            }
            
            const chat = model.startChat({ history: formatGoogleMessages(history), generationConfig });
            const result = await chat.sendMessageStream(promptParts);
            
            for await (const chunk of result.stream) {
                for (const part of (chunk.candidates?.[0]?.content?.parts || [])) {
                    if (part.thought) {
                        // This is a thought part. The content is in part.text.
                        reasoningData += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'google_thought_word', content: part.text })}\n\n`);
                    } else if (part.text) {
                        // This is a regular content part.
                        aiResponseContent += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'content_word', content: part.text })}\n\n`);
                    }
                }
            }

        } else {
            return new Promise(async (resolve, reject) => {
                try {
                    const userApiKeys = { openrouter: userApiKey, google: req.body.userGoogleKey };
                    const serverApiKeys = { openrouter: process.env.OPENROUTER_API_KEY, google: process.env.GOOGLE_API_KEY };
                    const { apiKey: apiKeyToUse, usedServerKey } = determineApiDetails(modelId, userApiKeys, serverApiKeys);

                    if (usedServerKey) res.write(`data: ${JSON.stringify({ type: 'key_usage', source: 'server_default' })}\n\n`);

                    const openRouterMessageContent = [{ type: 'text', text: finalPrompt }];
                    if (imageDataForAI && fileMimeType.startsWith('image/')) {
                        openRouterMessageContent.push({ type: 'image_url', image_url: { url: `data:${fileMimeType};base64,${imageDataForAI}` } });
                    }

                    const apiMessages = [
                        ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
                        { role: 'user', content: openRouterMessageContent }
                    ];

                    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKeyToUse}` },
                        body: JSON.stringify({ 
                            model: modelId, messages: apiMessages,
                            include_reasoning: modelId === 'deepseek/deepseek-r1:free', stream: true,
                            max_tokens: calculateMaxTokens({
                                isGuest: !userId, modelId, hasUserKey: !!userApiKey,
                                messageLength: finalPrompt.length, isStreaming: true,
                                useWebSearch, maximizeTokens: req.body.maximizeTokens || false
                            })
                        }),
                    });

                    if (!openRouterResponse.ok) {
                        const errorData = await openRouterResponse.json();
                        return reject(new Error(`OpenRouter Error: ${errorData.error?.message || 'An unknown error occurred'}`));
                    }

                    const stream = openRouterResponse.body;
                    let buffer = '';

                    stream.on('data', (chunk) => {
                        buffer += chunk.toString();
                        let boundary;
                        while ((boundary = buffer.indexOf('\n')) !== -1) {
                            const line = buffer.substring(0, boundary);
                            buffer = buffer.substring(boundary + 1);
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data.trim() === '[DONE]') return;
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed.choices?.[0]) {
                                        const choice = parsed.choices[0];
                                        if (choice.delta?.content) {
                                            aiResponseContent += choice.delta.content;
                                            res.write(`data: ${JSON.stringify({ type: 'content_word', content: choice.delta.content })}\n\n`);
                                        }
                                        if (choice.delta?.reasoning) {
                                            reasoningData += choice.delta.reasoning;
                                            res.write(`data: ${JSON.stringify({ type: 'reasoning_word', content: choice.delta.reasoning })}\n\n`);
                                        }
                                    }
                                } catch (e) { console.error('Error parsing streaming data line:', line, e); }
                            }
                        }
                    });

                    stream.on('end', async () => {
                        try {
                            const finalSearchResults = searchResults ? { results: searchResults, queries: searchQueries } : null;
                            const [aiMessage] = await db.insert(schema.messages).values({ 
                                chatId: currentChatId, 
                                sender: 'ai', 
                                content: aiResponseContent, 
                                modelId,
                                searchResults: finalSearchResults ? JSON.stringify(finalSearchResults) : null,
                                reasoning: reasoningData || null
                            }).returning();
                            res.write(`data: ${JSON.stringify({ type: 'complete', aiMessage: { ...aiMessage, searchResults, reasoning: reasoningData || null } })}\n\n`);
                            res.end();
                            resolve();
                        } catch (dbError) { reject(dbError); }
                    });

                    stream.on('error', (error) => reject(error));
                } catch (e) {
                    reject(e);
                }
            });
        }
        
        // --- Step 5: Save the Final AI Message to the Database ---
        if (isGoogleModel) {
            const finalSearchResults = searchResults ? { results: searchResults, queries: searchQueries } : null;
            const [aiMessage] = await db.insert(schema.messages).values({ 
                chatId: currentChatId, 
                sender: 'ai', 
                content: aiResponseContent, 
                modelId,
                searchResults: finalSearchResults ? JSON.stringify(finalSearchResults) : null,
                reasoning: reasoningData || null
            }).returning();

            res.write(`data: ${JSON.stringify({ type: 'complete', aiMessage: { ...aiMessage, searchResults, reasoning: reasoningData || null } })}\n\n`);
            res.end();
            return;
        }

    } catch (error) {
        console.error('Error in streaming chat handler:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
    }
};

export const regenerateResponseStreaming = (db, genAI, tavily) => async (req, res) => {
    const { userId } = getAuth(req);
    const { messageId, newContent, chatId, modelId, userApiKey, userTavilyKey, userGoogleKey } = req.body;
    
    if (!messageId || !chatId || !modelId) {
        return res.status(400).json({ error: 'Missing required fields for regeneration.' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    try {
        const [updatedUserMessage] = await db.update(schema.messages)
            .set({
                content: newContent,
                editCount: sql`${schema.messages.editCount} + 1`,
                usedWebSearch: req.body.useWebSearch || false
            })
            .where(and(
                eq(schema.messages.id, messageId),
                eq(schema.messages.sender, 'user')
            ))
            .returning();
        
        if (!updatedUserMessage) {
            throw new Error("Message to edit not found or you don't have permission.");
        }

        await db.delete(schema.messages).where(and(
            eq(schema.messages.chatId, chatId),
            gt(schema.messages.id, updatedUserMessage.id)
        ));
        
        // The history is fetched and stored in `historyForAI`.
        const historyForAI = await db.query.messages.findMany({
            where: and(eq(schema.messages.chatId, chatId), lt(schema.messages.id, updatedUserMessage.id)),
            orderBy: [asc(schema.messages.id)],
        });

        let searchResults = null;
        let searchQueries = null;
        // The prompt content is stored in `finalPromptContent`.
        let finalPromptContent = newContent || 'Please analyze this image and provide a detailed description.';
        
        if (req.body.useWebSearch) {
            const tavilyKeyToUse = userTavilyKey || process.env.TAVILY_API_KEY;
            if (!tavilyKeyToUse) throw new Error("No Tavily API key available.");
            
            const maxQueryLength = 380;
            const searchQuery = finalPromptContent.length > maxQueryLength 
                ? finalPromptContent.substring(0, maxQueryLength - 3) + '...'
                : finalPromptContent;
            
            const searchResponse = await tavily.search(searchQuery, { maxResults: 5 });
            searchResults = searchResponse.results;
            searchQueries = searchResponse.query_suggestions;
            const contextText = searchResults.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n');
            finalPromptContent = `Based on these search results:\n---\n${contextText}\n---\n\nAnswer the user's query: "${finalPromptContent}"`;
        }

        let imageDataForAI = null;
        if (updatedUserMessage.imageUrl) {
            try {
                const imageResponse = await fetch(updatedUserMessage.imageUrl);
                const imageBuffer = await imageResponse.arrayBuffer();
                imageDataForAI = Buffer.from(imageBuffer).toString('base64');
            } catch (e) {
                console.error("Failed to fetch image for regeneration:", e);
            }
        }

        let aiResponseContent = '';
        let reasoningData = '';
        const isGoogleModel = modelId.startsWith('google/');

        if (isGoogleModel) {
            const googleThinkingModels = ['google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite-preview-06-17'];
            const isThinkingModel = googleThinkingModels.includes(modelId);
            const model = genAI.getGenerativeModel({ model: modelId.replace('google/', '') });

            const generationConfig = {};
            if (isThinkingModel) {
                generationConfig.thinkingConfig = {
                    includeThoughts: true,
                    thinkingBudget: -1, 
                };
            }
            
            // FIX #1: Using the correct `historyForAI` variable here, not `history`.
            const chat = model.startChat({ history: formatGoogleMessages(historyForAI), generationConfig });
            let streamInput;
            if (imageDataForAI && updatedUserMessage.fileType) {
                streamInput = [ { text: finalPromptContent }, { inlineData: { data: imageDataForAI, mimeType: updatedUserMessage.fileType } } ];
            } else {
                streamInput = finalPromptContent;
            }
            const result = await chat.sendMessageStream(streamInput);
            for await (const chunk of result.stream) {
                for (const part of (chunk.candidates?.[0]?.content?.parts || [])) {
                    if (part.thought) {
                        reasoningData += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'google_thought_word', content: part.text })}\n\n`);
                    } else if (part.text) {
                        aiResponseContent += part.text;
                        res.write(`data: ${JSON.stringify({ type: 'content_word', content: part.text })}\n\n`);
                    }
                }
            }
            
            const finalSearchResults = searchResults ? { results: searchResults, queries: searchQueries } : null;
            const [newAiMessage] = await db.insert(schema.messages).values({ chatId, sender: 'ai', content: aiResponseContent, modelId, searchResults: finalSearchResults ? JSON.stringify(finalSearchResults) : null, reasoning: reasoningData || null }).returning();

            res.write(`data: ${JSON.stringify({ type: 'complete', aiMessage: { ...newAiMessage, searchResults, reasoning: reasoningData || null } })}\n\n`);
            res.end();
            return;
        } else {
            return new Promise(async (resolve, reject) => {
                try {
                    const userApiKeys = { openrouter: userApiKey, google: userGoogleKey };
                    const serverApiKeys = { openrouter: process.env.OPENROUTER_API_KEY, google: process.env.GOOGLE_API_KEY };
                    const { apiKey: apiKeyToUse, usedServerKey } = determineApiDetails(modelId, userApiKeys, serverApiKeys);
                    if (usedServerKey) res.write(`data: ${JSON.stringify({ type: 'key_usage', source: 'server_default' })}\n\n`);
                    const openRouterMessageContent = [{ type: 'text', text: finalPromptContent }];
                    if (imageDataForAI && updatedUserMessage.fileType) {
                        openRouterMessageContent.push({ type: 'image_url', image_url: { url: `data:${updatedUserMessage.fileType};base64,${imageDataForAI}` } });
                    }
                    const apiMessages = [
                        ...historyForAI.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.content })),
                        { role: 'user', content: openRouterMessageContent }
                    ];
                    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKeyToUse}` },
                        body: JSON.stringify({ 
                            model: modelId, messages: apiMessages,
                            include_reasoning: modelId === 'deepseek/deepseek-r1:free', stream: true,
                            max_tokens: calculateMaxTokens({
                                isGuest: !userId, modelId, hasUserKey: !!userApiKey,
                                // FIX #2: Using the correct `finalPromptContent` variable here, not `finalPrompt`.
                                messageLength: finalPromptContent.length, isStreaming: true,
                                useWebSearch: req.body.useWebSearch || false,
                                maximizeTokens: req.body.maximizeTokens || false
                            })
                        }),
                    });
                    if (!openRouterResponse.ok) {
                        const errorData = await openRouterResponse.json();
                        return reject(new Error(`OpenRouter Error: ${errorData.error?.message || 'An unknown error occurred'}`));
                    }
                    const stream = openRouterResponse.body;
                    let buffer = '';
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString();
                        let boundary;
                        while ((boundary = buffer.indexOf('\n')) !== -1) {
                            const line = buffer.substring(0, boundary);
                            buffer = buffer.substring(boundary + 1);
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data.trim() === '[DONE]') return;
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed.choices?.[0]) {
                                        const choice = parsed.choices[0];
                                        if (choice.delta?.content) {
                                            aiResponseContent += choice.delta.content;
                                            res.write(`data: ${JSON.stringify({ type: 'content_word', content: choice.delta.content })}\n\n`);
                                        }
                                        if (choice.delta?.reasoning) {
                                            reasoningData += choice.delta.reasoning;
                                            res.write(`data: ${JSON.stringify({ type: 'reasoning_word', content: choice.delta.reasoning })}\n\n`);
                                        }
                                    }
                                } catch (e) { console.error('Error parsing streaming data line:', line, e); }
                            }
                        }
                    });
                    stream.on('end', async () => {
                        try {
                            const finalSearchResults = searchResults ? { results: searchResults, queries: searchQueries } : null;
                            const [aiMessage] = await db.insert(schema.messages).values({ 
                                chatId, sender: 'ai', content: aiResponseContent, modelId,
                                searchResults: finalSearchResults ? JSON.stringify(finalSearchResults) : null,
                                reasoning: reasoningData || null
                            }).returning();
                            res.write(`data: ${JSON.stringify({ type: 'complete', aiMessage: { ...aiMessage, searchResults, reasoning: reasoningData || null } })}\n\n`);
                            res.end();
                            resolve();
                        } catch (dbError) { reject(dbError); }
                    });
                    stream.on('error', (error) => reject(error));
                } catch (e) {
                    reject(e);
                }
            });
        }
    } catch (error) {
        console.error('Error in streaming regeneration:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
        res.end();
    }
};

export const getUserStats = (db) => async (req, res) => {
    const { userId } = getAuth(req);

    try {
        // 1. Get total chat count
        const [chatCountResult] = await db
            .select({ value: count() })
            .from(schema.chats)
            .where(eq(schema.chats.userId, userId));

        // 2. Get model usage breakdown
        const modelUsageResult = await db
            .select({
                modelId: schema.chats.modelId,
                count: count(),
            })
            .from(schema.chats)
            .where(eq(schema.chats.userId, userId))
            .groupBy(schema.chats.modelId)
            .orderBy(desc(count()));

        // 3. Get total message count
        // First get all chat IDs for the user
        const userChats = await db
            .select({ id: schema.chats.id })
            .from(schema.chats)
            .where(eq(schema.chats.userId, userId));

        const userChatIds = userChats.map(c => c.id);
        let messageCountResult = { value: 0 };

        if (userChatIds.length > 0) {
            [messageCountResult] = await db
                .select({ value: count() })
                .from(schema.messages)
                .where(and(
                    inArray(schema.messages.chatId, userChatIds),
                    eq(schema.messages.sender, 'user') // Only count user messages
                ));
        }

        res.status(200).json({
            success: true,
            stats: {
                chatCount: chatCountResult.value,
                modelUsage: modelUsageResult,
                messageCount: messageCountResult.value,
            },
        });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ success: false, error: "Failed to fetch user statistics." });
    }
};