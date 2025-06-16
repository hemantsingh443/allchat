import { Router } from 'express';
import { getAllChats, getChatMessages, deleteChat, handleChat, regenerateResponse, deleteMessage, branchChat, handleGuestChat, migrateGuestChats } from '../controllers/chatController.js';

export default function(db, genAI, tavily) {
    const guestRouter = Router();
    const protectedRouter = Router();

    // Guest Routes (Public)
    guestRouter.post('/chat/guest', handleGuestChat(genAI));

    // Protected Routes (Authenticated)
    protectedRouter.get('/chats', getAllChats(db));
    protectedRouter.get('/chats/:chatId', getChatMessages(db));
    protectedRouter.delete('/chats/:chatId', deleteChat(db));
    protectedRouter.post('/chats/branch', branchChat(db));
    protectedRouter.post('/chat', handleChat(db, genAI, tavily));
    protectedRouter.post('/chat/regenerate', regenerateResponse(db, genAI, tavily));
    protectedRouter.delete('/messages/:messageId', deleteMessage(db));
    protectedRouter.post('/chats/migrate-guest', migrateGuestChats(db));
    
    return { guestRouter, protectedRouter };
}