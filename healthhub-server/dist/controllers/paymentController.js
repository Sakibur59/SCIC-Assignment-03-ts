"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPaymentIntent = exports.handleWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const database_1 = require("../config/database");
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey || stripeSecretKey === 'dummy_key_for_testing') {
    console.warn('⚠️ Stripe is not configured. Payment will not work.');
    console.warn('⚠️ Please add STRIPE_SECRET_KEY to .env file');
}
// ✅ Fix: Use correct API version
const stripe = new stripe_1.default(stripeSecretKey || 'dummy_key_for_testing', {
    apiVersion: '2026-06-24.dahlia', // ✅ Match this with your Stripe dashboard
});
const createPaymentIntent = async (req, res) => {
    try {
        const { doctorId, amount, appointmentData } = req.body;
        const patientId = req.userId;
        if (!stripeSecretKey || stripeSecretKey === 'dummy_key_for_testing') {
            res.status(400).json({
                success: false,
                message: 'Payment system is not configured. Please contact support.',
                configError: true,
            });
            return;
        }
        const usersCollection = database_1.db.getCollection('users');
        const patient = await usersCollection.findOne({ _id: new mongodb_1.ObjectId(patientId) });
        if (!patient) {
            res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
            return;
        }
        const doctorsCollection = database_1.db.getCollection('doctors');
        const doctor = await doctorsCollection.findOne({ _id: new mongodb_1.ObjectId(doctorId) });
        const consultationFee = doctor?.consultationFee || 100;
        const appointmentsCollection = database_1.db.getCollection('appointments');
        const existingAppointment = await appointmentsCollection.findOne({
            patientId: new mongodb_1.ObjectId(patientId),
            doctorId: new mongodb_1.ObjectId(doctorId),
            date: new Date(appointmentData.date),
            time: appointmentData.time,
            status: { $in: ['pending', 'confirmed'] },
        });
        if (existingAppointment) {
            res.status(400).json({
                success: false,
                message: 'You already have an appointment with this doctor at this time',
                duplicate: true,
            });
            return;
        }
        const appointmentDoc = {
            patientId: new mongodb_1.ObjectId(patientId),
            doctorId: new mongodb_1.ObjectId(doctorId),
            date: new Date(appointmentData.date),
            time: appointmentData.time,
            symptoms: appointmentData.symptoms || '',
            notes: appointmentData.notes || '',
            status: 'pending',
            paymentStatus: 'pending',
            consultationFee: consultationFee,
            amount: amount,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await appointmentsCollection.insertOne(appointmentDoc);
        const appointmentId = result.insertedId;
        console.log('✅ Appointment created:', appointmentId);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            metadata: {
                doctorId: doctorId,
                patientId: patientId,
                appointmentId: appointmentId.toString(),
            },
            receipt_email: patient?.email,
        });
        await appointmentsCollection.updateOne({ _id: appointmentId }, {
            $set: {
                paymentIntentId: paymentIntent.id,
            },
        });
        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            appointmentId: appointmentId,
        });
    }
    catch (error) {
        console.error('❌ Payment intent error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create payment',
        });
    }
};
exports.createPaymentIntent = createPaymentIntent;
const handleWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        console.log('📥 Webhook received');
        if (!stripeSecretKey || stripeSecretKey === 'dummy_key_for_testing') {
            res.json({ received: true, mock: true });
            return;
        }
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        }
        catch (err) {
            console.error('❌ Webhook error:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        console.log('✅ Webhook event type:', event.type);
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                await handlePaymentSuccess(paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                await handlePaymentFailed(failedPayment);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
};
exports.handleWebhook = handleWebhook;
const handlePaymentSuccess = async (paymentIntent) => {
    try {
        const appointmentsCollection = database_1.db.getCollection('appointments');
        const metadata = paymentIntent.metadata;
        console.log('📥 Payment success for:', paymentIntent.id);
        console.log('📦 Metadata:', metadata);
        const existingAppointment = await appointmentsCollection.findOne({
            paymentIntentId: paymentIntent.id,
        });
        if (existingAppointment) {
            console.log('⚠️ Appointment already exists, updating status:', existingAppointment._id);
            await appointmentsCollection.updateOne({ paymentIntentId: paymentIntent.id }, {
                $set: {
                    status: 'confirmed',
                    paymentStatus: 'completed',
                    updatedAt: new Date(),
                },
            });
            return;
        }
        const appointmentDoc = {
            patientId: new mongodb_1.ObjectId(metadata.patientId),
            doctorId: new mongodb_1.ObjectId(metadata.doctorId),
            date: new Date(metadata.appointmentDate),
            time: metadata.appointmentTime,
            symptoms: metadata.symptoms || '',
            notes: metadata.notes || '',
            status: 'confirmed',
            paymentStatus: 'completed',
            amount: paymentIntent.amount / 100,
            paymentIntentId: paymentIntent.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await appointmentsCollection.insertOne(appointmentDoc);
        console.log('✅ Appointment created from webhook:', result.insertedId);
    }
    catch (error) {
        console.error('❌ Error handling payment success:', error);
    }
};
const handlePaymentFailed = async (paymentIntent) => {
    try {
        const appointmentsCollection = database_1.db.getCollection('appointments');
        const paymentIntentId = paymentIntent.id;
        await appointmentsCollection.updateOne({ paymentIntentId: paymentIntentId }, {
            $set: {
                status: 'cancelled',
                paymentStatus: 'failed',
                updatedAt: new Date(),
            },
        });
        console.log(`❌ Payment failed for: ${paymentIntentId}`);
    }
    catch (error) {
        console.error('❌ Error handling payment failure:', error);
    }
};
const cancelPaymentIntent = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            res.status(400).json({
                success: false,
                message: 'Payment intent ID is required',
            });
            return;
        }
        try {
            await stripe.paymentIntents.cancel(paymentIntentId);
            console.log('✅ Stripe payment intent cancelled:', paymentIntentId);
        }
        catch (stripeError) {
            console.warn('⚠️ Stripe cancel warning:', stripeError.message);
        }
        const appointmentsCollection = database_1.db.getCollection('appointments');
        await appointmentsCollection.deleteOne({
            paymentIntentId: paymentIntentId,
            paymentStatus: 'pending',
        });
        console.log('🗑️ Draft appointment cleaned up');
        res.status(200).json({
            success: true,
            message: 'Payment cancelled successfully',
        });
    }
    catch (error) {
        console.error('❌ Cancel payment error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to cancel payment',
        });
    }
};
exports.cancelPaymentIntent = cancelPaymentIntent;
