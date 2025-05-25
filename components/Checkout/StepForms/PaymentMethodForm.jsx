'use client'
import TextInput from '@/components/FormInputs/TextInput'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import NavButtons from './NavButtons';
import SelectInput from '@/components/FormInputs/SelectInput'
import {CircleCheckBig, CreditCard, Hand, HandCoins, Truck } from 'lucide-react';
import { useCheckout } from '@/context/checkout-context';

function PaymentModal({ onClose, onSubmit }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      alert("Please fill in all card details.");
      setIsSubmitting(false);
      return;
    }

    onSubmit({ cardNumber, expiryDate, cvv, cardHolderName });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full relative transform transition-all scale-100 opacity-100">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
          aria-label="Close payment modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Enter Card Details (Fake)</h2>
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cardHolderName">
              Cardholder Name
            </label>
             <input
              type="text"
              id="cardHolderName"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cardNumber">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="XXXX XXXX XXXX XXXX"
              required
            />
          </div>
          <div className="flex mb-6 space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="expiryDate">
                Expiry Date (MM/YY)
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MM/YY"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cvv">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XXX"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Save Card Details (Fake)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodForm() {
    const { currentStep, setCurrentStep, checkoutFormData: existingFormData, updateCheckoutFormData } = useCheckout()
    const {
            register,
            reset,
            watch,
            handleSubmit,
            formState: { errors },
          } = useForm({
            defaultValues: {
                ...existingFormData
            }
          });
    const initialPaymentMethod = existingFormData.PaymentMethod||""
    const [PaymentMethod,setPaymentMethod] = useState(initialPaymentMethod)

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [fakeCardDetails, setFakeCardDetails] = useState(null);

    useEffect(() => {
        if (PaymentMethod === 'Online Payment') {
             if (!fakeCardDetails) {
                setIsPaymentModalOpen(true);
             }
        } else {
            setIsPaymentModalOpen(false);
        }
    }, [PaymentMethod, fakeCardDetails]);

    const handleFakeCardSubmit = (details) => {
        console.log("Détails de carte fake reçus et stockés:", details);
        setFakeCardDetails(details);
    };

    async function processData(data){
        data.PaymentMethod = PaymentMethod;
        if (PaymentMethod === 'Online Payment' && fakeCardDetails) {
             data.cardDetails = fakeCardDetails;
        } else {
             data.cardDetails = null;
        }

        updateCheckoutFormData(data);
        setCurrentStep(currentStep+1);
    }

    console.log("Méthode de paiement sélectionnée:", PaymentMethod);
    console.log("Détails de carte fake:", fakeCardDetails);

  return (
    <form onSubmit={handleSubmit(processData)}>
        <h2 className='text-xl font-semibold mb-6 text-orange-500 dark:text-orange-400'>Payment Method</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 ">
            <div className=" col-span-full">
                <h3 className="mb-5 text-lg font-medium text-slate-900 dark:text-white">Select The Payment Method You Prefer</h3>
                <ul className="grid w-full gap-6 md:grid-cols-2">
                    <li>
                        <input onChange={(e)=>setPaymentMethod(e.target.value)} type="radio" id="Hand Payment" name="paymentmethod" value="Hand Payment" className="hidden peer" required
                               checked={PaymentMethod === 'Hand Payment'}
                        />
                        <label htmlFor="Hand Payment" className="inline-flex items-center justify-between w-full p-5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer dark:hover:text-slate-300 dark:border-slate-700 dark:peer-checked:text-orange-500 peer-checked:border-orange-600 dark:peer-checked:border-orange-600 peer-checked:text-orange-600 hover:text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-700">                           
                            <div className="flex gap-2 items-center">
                                <HandCoins className='w-8 h-8 ms-3 flex-shrink-0'/>
                                <div className="">
                                    <p className='font-semibold'>Cash On Delivery Or Pickup</p>
                                    <p>Pay When You Receive</p>
                                </div>
                            </div>
                            {PaymentMethod === 'Hand Payment' && <CircleCheckBig className='w-5 h-5 ms-3 flex-shrink-0 text-orange-600'/>}
                             {PaymentMethod !== 'Hand Payment' && <div className='w-5 h-5 ms-3 flex-shrink-0'></div>}
                        </label>
                    </li>
                    <li>
                        <input onChange={(e)=>setPaymentMethod(e.target.value)} type="radio" id="Online Payment" name="paymentmethod" value="Online Payment" className="hidden peer"
                               checked={PaymentMethod === 'Online Payment'}
                        />
                        <label htmlFor="Online Payment" className="inline-flex items-center justify-between w-full p-5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer dark:hover:text-slate-300 dark:border-slate-700 dark:peer-checked:text-orange-500 peer-checked:border-orange-600 dark:peer-checked:border-orange-600 peer-checked:text-orange-600 hover:text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-700">
                            <div className="flex gap-2 items-center">
                                <CreditCard className='w-8 h-8 ms-3 flex-shrink-0'/>
                                <div className="">
                                    <p className='font-semibold'>Pay Online With Your Credit Card</p>
                                    <p>Pay Online</p>
                                </div>
                            </div>
                            {PaymentMethod === 'Online Payment' && <CircleCheckBig className='w-5 h-5 ms-3 flex-shrink-0 text-orange-600'/>}
                             {PaymentMethod !== 'Online Payment' && <div className='w-5 h-5 ms-3 flex-shrink-0'></div>}
                        </label>
                    </li>
                </ul>

                {PaymentMethod === 'Online Payment' && fakeCardDetails && (
                    <div className="mt-4 p-4 border border-green-500 dark:border-green-700 rounded-md bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                        <p className="font-semibold mb-2">Card Details Added (Fake)</p>
                        <p className="text-sm">Cardholder: {fakeCardDetails.cardHolderName}</p>
                        <p className="text-sm">Card Number: **** **** **** {fakeCardDetails.cardNumber.slice(-4)}</p>
                        <button type="button" 
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="mt-2 px-3 py-1 text-sm bg-green-200 hover:bg-green-300 dark:bg-green-700 dark:hover:bg-green-600 text-green-800 dark:text-green-100 rounded-md transition-colors"
                                >
                                Edit Card Details (Fake)
                        </button>
                    </div>
                )}

            </div>
        </div>
        <p className='text-green-700 text-sm font-semibold flex items-center justify-center dark:text-green-400'><b>Note: </b>"You can now pay online with your credit card."</p>
                <NavButtons/>

      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleFakeCardSubmit}
        />
      )}

    </form>
  )
}

