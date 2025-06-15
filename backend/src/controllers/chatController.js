import { eq, desc, and, gt, lt, asc, sql, isNull, not, inArray, count } from 'drizzle-orm';
import { getAuth } from '@clerk/express';
import * as schema from '../db/schema.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { tavily } from '@tavily/core';

const formatGoogleMessages = (messages) => messages.map(msg => ({
    role: msg.sender === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }],
}));

async function uploadImage(base64Image) {
    if (!process.env.IMGBB_API_KEY) {
        throw new Error("IMGBB_API_KEY is not set. Cannot upload image.");
    }
    const form = new FormData();
    form.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
        method: 'POST',
        body: form,
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error?.message || 'Failed to upload image.');
    }
    return result.data.url;
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

        // Check if chat is now empty
        const [remaining] = await db.select({ value: count() })
            .from(schema.messages)
            .where(eq(schema.messages.chatId, message.chatId));

        let chatDeleted = false;
        if (remaining.value === 0) {
            await db.delete(schema.chats).where(eq(schema.chats.id, message.chatId));
            chatDeleted = true;
            console.log(`Chat ${message.chatId} was empty and has been deleted.`);
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

export const handleChat = (db, genAI, serverTavily) => async (req, res) => {
    const { userId } = getAuth(req);
    const { 
        messages, chatId, modelId, useWebSearch, imageData, 
        imageMimeType, userApiKey, userTavilyKey 
    } = req.body;

    if (!messages) return res.status(400).json({ error: 'Invalid request: Messages are missing.' });

    try {
        let lastUserMessage = { ...messages[messages.length - 1] };
        const history = messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
        
        if (useWebSearch) {
            const activeTavily = userTavilyKey ? tavily(userTavilyKey) : serverTavily;
            
            console.log(`Performing web search for: "${lastUserMessage.content}" using ${userTavilyKey ? 'user' : 'server'} key.`);
            const searchContext = await activeTavily.search(lastUserMessage.content, { maxResults: 5 });
            const contextText = searchContext.results.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n');
            const augmentedPrompt = `Based on these search results:\n---\n${contextText}\n---\n\nAnswer the user's query: "${lastUserMessage.content}"`;
            lastUserMessage.content = augmentedPrompt;
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
            if (!userApiKey) throw new Error("OpenRouter API key is required.");
            
            let openRouterMessageContent = [{ type: 'text', text: lastUserMessage.content }];
            if (imageData && imageMimeType) {
                openRouterMessageContent.push({ type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageData}` } });
            }
            
            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${userApiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelId, messages: [...history, { role: 'user', content: openRouterMessageContent }] }),
            });

            if (!openRouterResponse.ok) {
                const errorData = await openRouterResponse.json();
                if (openRouterResponse.status === 402) {
                    throw new Error("OpenRouter API key has insufficient funds. Please add credits to your OpenRouter account.");
                }
                throw new Error(`OpenRouter Error: ${errorData.error?.message || 'An unknown error occurred'}`);
            }
            const data = await openRouterResponse.json();
            aiResponseContent = data.choices[0].message.content;
        }

        let currentChatId = chatId;
        let newChat = null;
        const userMessageContentToSave = messages[messages.length - 1].content;
        
        if (!chatId) {
            const title = userMessageContentToSave.substring(0, 30) || "New Chat";
            [newChat] = await db.insert(schema.chats).values({ userId, title, modelId }).returning();
            currentChatId = newChat.id;
        }

        const [userMessage] = await db.insert(schema.messages).values({ 
            chatId: currentChatId, 
            sender: 'user', 
            content: userMessageContentToSave,
            imageUrl: imageUrl,
            usedWebSearch: useWebSearch
        }).returning();

        const [aiMessage] = await db.insert(schema.messages).values({ 
            chatId: currentChatId, 
            sender: 'ai', 
            content: aiResponseContent 
        }).returning();
        
        res.json({ userMessage, aiMessage, newChat, chatId: currentChatId });
    } catch (error) {
        console.error('Error in chat handler:', error);
        if (error.message.includes("TAVILY_API_KEY")) {
            return res.status(400).json({ error: "The provided Tavily API key is invalid or has insufficient credits." });
        }
        if (error.message.includes("OpenRouter API key has insufficient funds")) {
            return res.status(402).json({ error: error.message });
        }
        if (error.message.includes("OpenRouter API key is required")) {
            return res.status(400).json({ error: error.message });
        }
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
        
        const [originalMessage] = await db.select().from(schema.messages)
            .where(eq(schema.messages.id, messageId));

        if (!originalMessage) {
            return res.status(404).json({ error: "Message to edit not found." });
        }

        
        const [updatedUserMessage] = await db.update(schema.messages).set({
            content: newContent,
            editCount: sql`${schema.messages.editCount} + 1`,
          
        }).where(eq(schema.messages.id, messageId)).returning();

        await db.delete(schema.messages).where(and(
            eq(schema.messages.chatId, chatId),
            gt(schema.messages.id, updatedUserMessage.id)
        ));
        
        const historyForAI = await db.query.messages.findMany({
            where: and(eq(schema.messages.chatId, chatId), lt(schema.messages.id, updatedUserMessage.id)),
            orderBy: [asc(schema.messages.id)]
        });

        let lastMessageContent = updatedUserMessage.content;
        if (useWebSearch) {
             const searchContext = await tavily.search(lastMessageContent, { maxResults: 5 });
             const contextText = searchContext.results.map(r => `URL: ${r.url}, Content: ${r.content}`).join('\n\n');
             lastMessageContent = `Based on these search results:\n---\n${contextText}\n---\n\nAnswer the user's query: "${updatedUserMessage.content}"`;
        }

        let aiResponseContent;
        const isGoogleModel = modelId.startsWith('google/');

        if (isGoogleModel) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const chat = model.startChat({ history: formatGoogleMessages(historyForAI) });
            const result = await chat.sendMessage(lastMessageContent);
            aiResponseContent = result.response.text();
        } else {
            if (!userApiKey) throw new Error("OpenRouter API key is required.");
            const apiMessages = [
                ...historyForAI.map(m => ({ role: m.sender, content: m.content })),
                { role: 'user', content: lastMessageContent }
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

        const [newAiMessage] = await db.insert(schema.messages).values({
            chatId: chatId, 
            sender: 'ai', 
            content: aiResponseContent
        }).returning();

        res.status(200).json({ updatedUserMessage, newAiMessage });

    } catch (error) {
        console.error('Error regenerating response:', error);
        res.status(500).json({ error: `Failed to regenerate response: ${error.message}` });
    }
};