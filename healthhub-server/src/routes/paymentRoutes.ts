import express from 'express';
import { createPaymentIntent, handleWebhook, cancelPaymentIntent } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/cancel-payment-intent', protect, cancelPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;