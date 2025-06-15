import { Router } from 'express';
import { verifyOpenRouterKey, verifyTavilyKey } from '../controllers/keyController.js';

const router = Router();

router.post('/verify-openrouter-key', verifyOpenRouterKey);
router.post('/verify-tavily-key', verifyTavilyKey);

export default router;