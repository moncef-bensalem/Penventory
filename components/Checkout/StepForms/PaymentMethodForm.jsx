'use client'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import NavButtons from './NavButtons';
import SelectInput from '@/components/FormInputs/SelectInput'
import {CircleCheckBig, CreditCard, Hand, HandCoins, Truck } from 'lucide-react';
import { useCheckout } from '@/context/checkout-context';
import PaymentModal from '@/components/PaymentModal';

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

