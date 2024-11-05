import { Router } from 'express';
import { sendtResetEmailController } from '../controllers/auth.js';

const router = Router();

router.post('/send-reset-email', sendtResetEmailController);

export default router;
