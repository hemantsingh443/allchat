import { Router } from 'express';
import { verifyOpenRouterKey, verifyTavilyKey, verifyGoogleKey } from '../controllers/keyController.js';

const router = Router();

router.post('/verify-openrouter-key', verifyOpenRouterKey);
router.post('/verify-tavily-key', verifyTavilyKey);
router.post('/verify-google-key', verifyGoogleKey);

export default router;