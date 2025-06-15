import { Router } from 'express';
import { getAllChats, getChatMessages, deleteChat, handleChat, regenerateResponse, deleteMessage, branchChat } from '../controllers/chatController.js';

export default function(db, genAI, tavily) {
    const router = Router();

    router.get('/chats', getAllChats(db));
    router.get('/chats/:chatId', getChatMessages(db));
    router.delete('/chats/:chatId', deleteChat(db));
    router.post('/chats/branch', branchChat(db));
    
    router.post('/chat', handleChat(db, genAI, tavily));
    router.post('/chat/regenerate', regenerateResponse(db, genAI, tavily));
    router.delete('/messages/:messageId', deleteMessage(db));
    
    return router;
}