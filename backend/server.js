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

// Middleware
app.use(express.json({ limit: '10mb' }));

// Configure CORS with proper origin
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://allchat-topaz.vercel.app'
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Service Initializations
const sqlConnection = neon(process.env.DATABASE_URL);
const db = drizzle(sqlConnection, { schema });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const client = new tavily(process.env.TAVILY_API_KEY);

// API Routing
const chatRoutes = createChatRoutes(db, genAI, client);

// Mount guest routes BEFORE authentication middleware
app.use('/api', chatRoutes.guestRouter);

// Mount protected routes AFTER authentication middleware
app.use('/api', clerkMiddleware({ 
    secretKey: process.env.CLERK_SECRET_KEY,
    // Add error handling for auth failures
    onError: (err, req, res) => {
        console.error('Auth middleware error:', err);
        res.status(401).json({ error: 'Authentication failed' });
    }
}), chatRoutes.protectedRouter);

app.use('/api', clerkMiddleware({ 
    secretKey: process.env.CLERK_SECRET_KEY,
    onError: (err, req, res) => {
        console.error('Auth middleware error:', err);
        res.status(401).json({ error: 'Authentication failed' });
    }
}), keyRoutes);

// Development server
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

// Export for Vercel
export default app;