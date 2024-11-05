import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';
import emailRouter from './emailRoutes.js'; // Імпортуємо як значення за замовчуванням

const router = Router();

router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);
router.use('/email', emailRouter);

export default router;
