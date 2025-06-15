import express from 'express';
import cors from 'cors';
import { createClient } from '@clerk/clerk-sdk-node';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema.js';
import { handleChat, getAllChats, getChatMessages, deleteChat, deleteMessage, regenerateResponse } from './controllers/chatController.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { tavily } from '@tavily/core';

const app = express();
const port = process.env.PORT || 5001;


const allowedOrigins = [
    'http://localhost:3000',
    'https://allchat-topaz.vercel.app',
    'https://allchat-hemantsingh443.vercel.app'  // Add your Vercel URL here
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY }));

// --- Service Initializations ---
const sqlConnection = neon(process.env.DATABASE_URL);
const db = drizzle(sqlConnection, { schema }); // Pass schema here
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const client = new tavily(process.env.TAVILY_API_KEY);

// --- API Routing ---
const chatRoutes = createChatRoutes(db, genAI, client);
app.use('/api', keyRoutes);
app.use('/api', chatRoutes);

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
