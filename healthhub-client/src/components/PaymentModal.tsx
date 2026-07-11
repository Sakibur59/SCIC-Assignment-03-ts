'use client';

import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctorName: string;
  amount: number;
  doctorId: string;
  appointmentData: any;
}

const PaymentForm = ({ onClose, onSuccess, doctorName, amount, doctorId, appointmentData }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const hasCalled = useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      hasCalled.current = true;
      createPaymentIntent();
    }
  }, []);

  const createPaymentIntent = async () => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      setLoading(true);
      console.log('📤 Creating payment intent...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          doctorId,
          amount,
          appointmentData,
        }),
      });

      const data = await response.json();
      console.log('📥 Payment intent response:', data);

      if (data.success) {
        if (data.mock) {
          toast.success('Appointment booked successfully!');
          setPaymentCompleted(true);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
          return;
        }
        setClientSecret(data.clientSecret);
      } else {
        if (data.duplicate) {
          toast.error('You already have an appointment at this time');
          onClose();
          return;
        }
        setError(data.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
      setIsCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret || paymentCompleted) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Patient',
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful! Appointment confirmed.');
        setPaymentCompleted(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      setError(error.message || 'Payment failed');
    }

    setLoading(false);
  };

const handleClose = async () => {
  if (!paymentCompleted && clientSecret) {

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0], // Extract 
        }),
      });

      if (response.ok) {
        console.log('✅ Payment intent cancelled');
      }
    } catch (error) {
      console.error('❌ Failed to cancel payment:', error);
    }

    toast('Payment cancelled.', {
      icon: 'ℹ️',
      duration: 3000,
    });
  }
  onClose();
};
  if (paymentCompleted) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Payment Successful!</h3>
        <p className="text-gray-500 mt-2">Your appointment has been confirmed.</p>
        <div className="mt-4 animate-pulse text-sm text-gray-400">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Pay for Appointment</h3>
        <button 
          onClick={handleClose} 
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Doctor:</span> {doctorName}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Amount:</span> ${amount}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Date:</span> {appointmentData.date}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Time:</span> {appointmentData.time}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  fontFamily: 'Arial, sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
              iconStyle: 'solid' as const,
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="h-3 w-3" />
          <span>Secure payment powered by Stripe</span>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || paymentCompleted}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pay ${amount}
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        Your payment is secure and encrypted
      </p>
    </div>
  );
};

export const PaymentModal = ({ isOpen, onClose, onSuccess, doctorName, amount, doctorId, appointmentData }: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Elements stripe={stripePromise}>
          <PaymentForm
            onClose={onClose}
            onSuccess={onSuccess}
            doctorName={doctorName}
            amount={amount}
            doctorId={doctorId}
            appointmentData={appointmentData}
          />
        </Elements>
      </div>
    </div>
  );
};