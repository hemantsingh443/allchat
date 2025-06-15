import { eq, desc, and, gt, lt, asc, sql, isNull, not, inArray, count, lte } from 'drizzle-orm';
import { getAuth } from '@clerk/express';
import * as schema from '../db/schema.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { tavily } from '@tavily/core';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

const formatGoogleMessages = (messages) => messages.map(msg => ({
    role: msg.sender === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }],
}));

async function uploadImage(base64Image) {
    if (!process.env.IMGBB_API_KEY) {
        throw new Error("IMGBB_API_KEY is not set. Cannot upload image.");
    }
    console.log('Starting image upload to IMGBB...');
    const form = new FormData();
    form.append('image', base64Image);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: form,
        });
        const result = await response.json();
        console.log('IMGBB response:', result.success, result.data?.url);
        if (!result.success) {
            throw new Error(result.error?.message || 'Failed to upload image.');
        }
        return result.data.url;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        throw error;
    }
}

export const getAllChats = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    try {
        const userChats = await db.query.chats.findMany({
            where: eq(schema.chats.userId, userId),
            orderBy: [desc(schema.chats.createdAt)],
        });
        res.json(userChats);
    } catch (e) {
        console.error('Failed to fetch chats:', e);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
};

export const getChatMessages = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    try {
        const chatId = parseInt(req.params.chatId);
        const chat = await db.query.chats.findFirst({
            where: and(eq(schema.chats.id, chatId), eq(schema.chats.userId, userId))
        });
        if (!chat) return res.status(404).json({ error: "Chat not found or you don't have permission to view it." });

        const messages = await db.query.messages.findMany({
            where: eq(schema.messages.chatId, chatId),
            orderBy: [asc(schema.messages.createdAt)],
        });
        res.json(messages);
    } catch (e) {
        console.error('Failed to fetch messages:', e);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const deleteChat = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const chatId = parseInt(req.params.chatId);

    try {
        const [deletedChat] = await db.delete(schema.chats)
            .where(and(eq(schema.chats.id, chatId), eq(schema.chats.userId, userId)))
            .returning();
        
        if (!deletedChat) {
             return res.status(404).json({ error: "Chat not found or you don't have permission to delete it." });
        }
        res.status(200).json({ message: 'Chat deleted', deletedChatId: deletedChat.id });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
};

export const deleteMessage = (db) => async (req, res) => {
    const { userId } = getAuth(req);
    const messageIdToDelete = parseInt(req.params.messageId);

    try {
        const message = await db.query.messages.findFirst({
            where: eq(schema.messages.id, messageIdToDelete),
            with: { 
                chat: true 
            }
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
        if (remaining.value === 0) {
            await db.delete(schema.chats).where(eq(schema.chats.id, message.chatId));
            chatDeleted = true;
        }

        res.status(200).json({ 
            success: true, 
            message: "Message(s) deleted.", 
            deletedIds: idsToDelete,
            chatDeleted: chatDeleted,
            deletedChatId: chatDeleted ? message.chatId : null
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
        const sourceChat = await db.query.chats.findFirst({
            where: and(eq(schema.chats.id, sourceChatId), eq(schema.chats.userId, userId))
        });
        if (!sourceChat) return res.status(404).json({ error: "Source chat not found." });

        const messagesToCopy = await db.query.messages.findMany({
            where: and(
                eq(schema.messages.chatId, sourceChatId),
                lt(schema.messages.id, fromAiMessageId + 1)
            ),
            orderBy: [asc(schema.messages.id)]
        });
        
        if (messagesToCopy.length === 0) throw new Error("No messages found to branch.");

        const newChatTitle = `[Branch] ${sourceChat.title}`.substring(0, 255);
        const [newChat] = await db.insert(schema.chats).values({
            userId,
            title: newChatTitle,
            modelId: newModelId,
            sourceChatId: parseInt(sourceChatId),
            branchedFromMessageId: parseInt(fromAiMessageId)
        }).returning();

        const newMessages = messagesToCopy.map(msg => ({
            ...msg,
            id: undefined,
            chatId: newChat.id
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
    const { messages, chatId, modelId, useWebSearch, imageData, imageMimeType, userApiKey, userTavilyKey } = req.body;

    if (!messages) return res.status(400).json({ error: 'Invalid request: Messages are missing.' });

    try {
        let lastUserMessage = { ...messages[messages.length - 1] };
        const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
        
        if (useWebSearch) {
            const activeTavily = userTavilyKey ? tavily(userTavilyKey) : tavily;
            const searchContext = await activeTavily.search(lastUserMessage.content, { maxResults: 5 });
            const contextText = searchContext.results.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n');
            lastUserMessage.content = `Based on these search results:\n---\n${contextText}\n---\n\nAnswer the user's query: "${lastUserMessage.content}"`;
        }

        let aiResponseContent = '';
        const isGoogleModel = modelId.startsWith('google/');
        let imageUrl = null;

        if (imageData && imageMimeType) {
            imageUrl = await uploadImage(imageData);
        }

        if (isGoogleModel) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const promptParts = [{ text: lastUserMessage.content }];
            if (imageData && imageMimeType) {
                promptParts.push({ inlineData: { data: imageData, mimeType: imageMimeType } });
            }
            const result = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
            aiResponseContent = result.response.text();
        } else { 
            if (!userApiKey) {
                throw new Error("An OpenRouter API key is required to use this model.");
            }
            let openRouterMessageContent = [{ type: 'text', text: lastUserMessage.content }];
            if (imageData && imageMimeType) {
                openRouterMessageContent.push({ type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageData}` } });
            }
            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userApiKey}` },
                body: JSON.stringify({ model: modelId, messages: [...history, { role: 'user', content: openRouterMessageContent }] }),
            });
            if (!openRouterResponse.ok) {
                const errorData = await openRouterResponse.json();
                if (openRouterResponse.status === 402) throw new Error("OpenRouter API key has insufficient funds for this model.");
                throw new Error(`OpenRouter Error: ${errorData.error?.message || 'An unknown error occurred'}`);
            }
            const data = await openRouterResponse.json();
            aiResponseContent = data.choices[0].message.content;
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
            imageUrl: imageUrl, // Save the public URL of the image
            usedWebSearch: useWebSearch // Save whether web search was used
        }).returning();

        const [aiMessage] = await db.insert(schema.messages).values({
            chatId: currentChatId,
            sender: 'ai',
            content: aiResponseContent,
            modelId: modelId
        }).returning();
        
        // The `userMessage` object now contains the `imageUrl` from the database,
        // which will be sent back to the frontend.
        res.json({ userMessage, aiMessage, newChat, chatId: currentChatId });
    } catch (error) {
        console.error('Error in chat handler:', error);
        res.status(500).json({ error: `API Error: ${error.message}` });
    }
};

export const regenerateResponse = (db, genAI, tavily) => async (req, res) => {
    const { userId } = getAuth(req);
    const { messageId, newContent, chatId, modelId, userApiKey, useWebSearch } = req.body;
    if (!messageId || !newContent || !chatId || !modelId) {
        return res.status(400).json({ error: 'Missing required fields for regeneration.' });
    }

    try {
        // Step 1: Update the user's message in the database with the new content
        const [updatedUserMessage] = await db.update(schema.messages)
            .set({
                content: newContent,
                editCount: sql`${schema.messages.editCount} + 1`,
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

        // Step 4: Call the AI with the updated content and history
        let aiResponseContent;
        if (modelId.startsWith('google/')) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const chat = model.startChat({ history: formatGoogleMessages(historyForAI) });
            const result = await chat.sendMessage(newContent);
            aiResponseContent = result.response.text();
        } else {
            if (!userApiKey) throw new Error("An OpenRouter API key is required.");
            const apiMessages = [
                ...historyForAI.map(m => ({ role: m.sender, content: m.content })),
                { role: 'user', content: newContent }
            ];
            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${userApiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelId, messages: apiMessages }),
            });
            if (!openRouterResponse.ok) throw new Error(await openRouterResponse.text());
            const data = await openRouterResponse.json();
            aiResponseContent = data.choices[0].message.content;
        }

        // Step 5: Insert the new AI response into the database
        const [newAiMessage] = await db.insert(schema.messages).values({
            chatId: chatId, 
            sender: 'ai', 
            content: aiResponseContent,
            modelId: modelId
        }).returning();

        // Step 6: Send back the new AI message
        res.status(200).json({ newAiMessage });

    } catch (error) {
        console.error('Error regenerating response:', error);
        res.status(500).json({ error: `Failed to regenerate response: ${error.message}` });
    }
};