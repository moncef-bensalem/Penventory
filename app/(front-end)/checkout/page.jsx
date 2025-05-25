'use client';
import CartBanner from '@/components/Checkout/CartBanner';
import StepForm from '@/components/Checkout/StepForm';
import Steps from '@/components/Checkout/Steps';
import React from 'react';
import { CartProvider } from '@/context/cart-context';
import { CheckoutProvider } from '@/context/checkout-context';
import { SessionProvider } from 'next-auth/react';

export default function page() {
    const steps = [
  { number: 1, title: "Personal Details" },
  { number: 2, title: "Delivery Details" },
  { number: 3, title: "Payment Method" },
  { number: 4, title: "Order Summary" },
];

  // Le code de test a été supprimé car il n'est plus nécessaire
  return (
    <SessionProvider>
      <CartProvider>
        <CheckoutProvider>
          <div className='bg-slate-100 dark:bg-slate-900 min-h-screen'>
            <div className="max-w-3xl my-6 mx-auto p-6">
              <Steps steps={steps}/>
              <div className='w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700'>
                <CartBanner/>
                <StepForm/>
              </div>
            </div>
          </div>
        </CheckoutProvider>
      </CartProvider>
    </SessionProvider>
  )
}
