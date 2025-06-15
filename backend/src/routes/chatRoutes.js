// backend/src/routes/chatRoutes.js
import { Router } from 'express';
import { getAllChats, getChatMessages, deleteChat, handleChat, regenerateResponse, deleteMessage } from '../controllers/chatController.js';

export default function(db, genAI, tavily) {
    const router = Router();

    router.get('/chats', getAllChats(db));
    router.get('/chats/:chatId', getChatMessages(db));
    router.delete('/chats/:chatId', deleteChat(db));
    
    // This single endpoint now handles Google, OpenRouter, web search, and images
    router.post('/chat', handleChat(db, genAI, tavily));
    
    router.post('/chat/regenerate', regenerateResponse(db, genAI, tavily));
    
    // --- NEW Route for deleting a single message ---
    router.delete('/messages/:messageId', deleteMessage(db));
    
    return router;
}