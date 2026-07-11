import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey || stripeSecretKey === 'dummy_key_for_testing') {
  console.warn('⚠️ Stripe is not configured. Payment will not work.');
  console.warn('⚠️ Please add STRIPE_SECRET_KEY to .env file');
}

const stripe = new Stripe(stripeSecretKey || 'dummy_key_for_testing', {
  apiVersion: '2026-06-24.dahlia',
});


export const createPaymentIntent = async (req: any, res: Response) => {
  try {
    const { doctorId, amount, appointmentData } = req.body;
    const patientId = req.userId;

 
    if (!stripeSecretKey || stripeSecretKey === 'dummy_key_for_testing') {
      return res.status(400).json({
        success: false,
        message: 'Payment system is not configured. Please contact support.',
        configError: true,
      });
    }

    // Get patient details
    const usersCollection = db.getCollection('users');
    const patient = await usersCollection.findOne({ _id: new ObjectId(patientId) });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Get doctor details
    const doctorsCollection = db.getCollection('doctors');
    const doctor = await doctorsCollection.findOne({ _id: new ObjectId(doctorId) });

    const appointmentsCollection = db.getCollection('appointments');


    const existingAppointment = await appointmentsCollection.findOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      date: new Date(appointmentData.date),
      time: appointmentData.time,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment with this doctor at this time',
        duplicate: true,
      });
    }

 
    const appointmentDoc = {
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      date: new Date(appointmentData.date),
      time: appointmentData.time,
      symptoms: appointmentData.symptoms || '',
      notes: appointmentData.notes || '',
      status: 'pending',
      paymentStatus: 'Paid',
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
    await appointmentsCollection.updateOne(
      { _id: appointmentId },
      {
        $set: {
          paymentIntentId: paymentIntent.id,
        },
      }
    );



    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      appointmentId: appointmentId,
    });
  } catch (error: any) {
    console.error('❌ Payment intent error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create payment',
    });
  }
};

// ✅ Webhook Handler
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    console.log('📥 Webhook received');

    if (!stripeSecretKey || stripeSecretKey === 'dummy_key_for_testing') {
      console.log('⚠️ Webhook: Mock mode');
      return res.json({ received: true, mock: true });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('❌ Webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
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
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};


const handlePaymentSuccess = async (paymentIntent: any) => {
  try {
    const appointmentsCollection = db.getCollection('appointments');
    const metadata = paymentIntent.metadata;

    console.log('📥 Payment success for:', paymentIntent.id);
    console.log('📦 Metadata:', metadata);


    const existingAppointment = await appointmentsCollection.findOne({
      paymentIntentId: paymentIntent.id,
    });

    if (existingAppointment) {
      console.log('⚠️ Appointment already exists, updating status:', existingAppointment._id);
      await appointmentsCollection.updateOne(
        { paymentIntentId: paymentIntent.id },
        {
          $set: {
            status: 'confirmed',
            paymentStatus: 'completed',
            updatedAt: new Date(),
          },
        }
      );
      return;
    }


    const appointmentDoc = {
      patientId: new ObjectId(metadata.patientId),
      doctorId: new ObjectId(metadata.doctorId),
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
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
};

const handlePaymentFailed = async (paymentIntent: any) => {
  try {
    const appointmentsCollection = db.getCollection('appointments');
    const paymentIntentId = paymentIntent.id;

    await appointmentsCollection.updateOne(
      { paymentIntentId: paymentIntentId },
      {
        $set: {
          status: 'cancelled',
          paymentStatus: 'failed',
          updatedAt: new Date(),
        },
      }
    );

    console.log(`❌ Payment failed for: ${paymentIntentId}`);
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
};

export const cancelPaymentIntent = async (req: any, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required',
      });
    }

    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
      console.log('✅ Stripe payment intent cancelled:', paymentIntentId);
    } catch (stripeError: any) {
      console.warn('⚠️ Stripe cancel warning:', stripeError.message);
    }

    const appointmentsCollection = db.getCollection('appointments');
    const deleteResult = await appointmentsCollection.deleteOne({
      paymentIntentId: paymentIntentId,
      paymentStatus: 'Paid',
    });

    console.log('🗑️ Draft appointment cleaned up:', deleteResult.deletedCount);

    res.status(200).json({
      success: true,
      message: 'Payment cancelled successfully',
    });
  } catch (error: any) {
    console.error('❌ Cancel payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel payment',
    });
  }
};