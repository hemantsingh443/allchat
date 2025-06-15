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

// Configure CORS with robust error handling
const corsOptions = {
    origin: function (origin, callback) {
        console.log('Incoming request from origin:', origin);
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('Request with no origin - allowing');
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            console.log('CORS error:', msg, 'Origin:', origin);
            return callback(new Error(msg), false);
        }
        console.log('Origin allowed:', origin);
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Add error handling for CORS
app.use((err, req, res, next) => {
    if (err.message.includes('CORS')) {
        console.error('CORS Error:', err.message);
        return res.status(403).json({
            error: 'CORS Error',
            message: err.message
        });
    }
    next(err);
});

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