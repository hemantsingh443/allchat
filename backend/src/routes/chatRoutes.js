import { Router } from 'express';
import { getAllChats, getChatMessages, deleteChat, updateChatTitle, handleChat, handleStreamingChat, regenerateResponse, regenerateResponseStreaming, deleteMessage, branchChat, handleGuestChat, handleGuestChatStreaming, migrateGuestChats } from '../controllers/chatController.js';

export default function(db, genAI, tavily) {
    const guestRouter = Router();
    const protectedRouter = Router();

    // Guest Routes (Public)
    guestRouter.post('/chat/guest', handleGuestChat(genAI));
    guestRouter.post('/chat/guest/stream', handleGuestChatStreaming(genAI));

    // Protected Routes (Authenticated)
    protectedRouter.get('/chats', getAllChats(db));
    protectedRouter.get('/chats/:chatId', getChatMessages(db));
    protectedRouter.delete('/chats/:chatId', deleteChat(db));
    protectedRouter.patch('/chats/:chatId/title', updateChatTitle(db));
    protectedRouter.post('/chats/branch', branchChat(db));
    protectedRouter.post('/chat', handleChat(db, genAI, tavily));
    protectedRouter.post('/chat/stream', handleStreamingChat(db, genAI, tavily));
    protectedRouter.post('/chat/regenerate', regenerateResponse(db, genAI, tavily));
    protectedRouter.post('/chat/regenerate/stream', regenerateResponseStreaming(db, genAI, tavily));
    protectedRouter.delete('/messages/:messageId', deleteMessage(db));
    protectedRouter.post('/chats/migrate-guest', migrateGuestChats(db));
    
    // Token configuration route
    protectedRouter.get('/token-config', (req, res) => {
        res.json({
            tokenLimits: {
                guest: {
                    base: 1500,
                    min: 500,
                    max: 3000
                },
                loggedIn: {
                    base: 2000,
                    min: 500,
                    max: 8000
                },
                userWithKey: {
                    base: 4000,
                    min: 500,
                    max: 8000
                },
                userWithKeyMaximized: {
                    base: 8000,
                    min: 500,
                    max: 15000
                }
            },
            modelAdjustments: {
                premium: { factor: 0.75, max: 3000 }, // GPT-4, Claude-3-Opus
                midTier: { factor: 1.0, max: 3500 },  // GPT-3.5, Claude-3-Sonnet
                free: { factor: 1.25, max: 2500 },    // Free models
                reasoning: { factor: 3.0, max: 12000 } // DeepSeek models with reasoning
            },
            messageLengthAdjustments: {
                short: { threshold: 500, factor: 0.85 },
                long: { threshold: 1000, factor: 0.7 }
            },
            featureAdjustments: {
                webSearch: { factor: 0.8 },
                streaming: { factor: 0.9 }
            },
            specialModels: {
                deepseek: {
                    description: "DeepSeek models include reasoning tokens which require higher limits",
                    baseLimit: 6000,
                    maxLimit: 12000,
                    reasoningEnabled: true,
                    maximizedLimit: 20000
                }
            },
            maximizeTokens: {
                description: "Toggle to use maximum token limits for longer, more detailed responses",
                requiresApiKey: true,
                baseMultiplier: 2.0,
                maxMultiplier: 1.875
            }
        });
    });

    return { guestRouter, protectedRouter };
}