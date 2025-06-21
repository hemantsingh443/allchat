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

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://allchat-topaz.vercel.app'
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const sqlConnection = neon(process.env.DATABASE_URL);
const db = drizzle(sqlConnection, { schema });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const client = new tavily(process.env.TAVILY_API_KEY);

const { guestRouter, protectedRouter, publicRouter } = createChatRoutes(db, genAI, client);

// FIX: Mount public routes first, completely separate from authenticated routes.
app.use('/api', publicRouter); 
app.use('/api', guestRouter);

// Mount protected routes AFTER the Clerk authentication middleware.
app.use('/api', clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY }), protectedRouter);
app.use('/api', clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY }), keyRoutes);

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

export default app;