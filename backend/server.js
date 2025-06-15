import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { tavily } from '@tavily/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as schema from './src/db/schema.js';
import keyRoutes from './src/routes/keyRoutes.js';
import createChatRoutes from './src/routes/chatRoutes.js';

const app = express();
const port = process.env.PORT || 5001;

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));

const allowedOrigins = [
    'http://localhost:3000',
    'https://allchat-topaz.vercel.app'
];

// Configure CORS
app.use(cors({
    origin: function(origin, callback) {
        console.log('Request origin:', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

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