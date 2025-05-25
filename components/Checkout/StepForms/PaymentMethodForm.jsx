'use client'
import TextInput from '@/components/FormInputs/TextInput'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import NavButtons from './NavButtons';
import SelectInput from '@/components/FormInputs/SelectInput'
import {CircleCheckBig, CreditCard, Hand, HandCoins, Truck } from 'lucide-react';
import { useCheckout } from '@/context/checkout-context';

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
          console.log(PaymentMethod)
    async function processData(data){
        data.PaymentMethod = PaymentMethod
        updateCheckoutFormData(data)
        setCurrentStep(currentStep+1)
    }
  return (
    <form onSubmit={handleSubmit(processData)}>
        <h2 className='text-xl font-semibold mb-6 text-orange-500 dark:text-orange-400'>Payment Method</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 ">
                <div className=" col-span-full">
                    <h3 className="mb-5 text-lg font-medium text-slate-900 dark:text-white">Select The Payment Method You Prefer</h3>
                <ul className="grid w-full gap-6 md:grid-cols-2">
                    <li>
                        <input onChange={(e)=>setPaymentMethod(e.target.value)} type="radio" id="Hand Payment" name="paymentmethod" value="Hand Payment" className="hidden peer" required />
                        <label htmlFor="Hand Payment" className="inline-flex items-center justify-between w-full p-5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer dark:hover:text-slate-300 dark:border-slate-700 dark:peer-checked:text-orange-500 peer-checked:border-orange-600 dark:peer-checked:border-orange-600 peer-checked:text-orange-600 hover:text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-700">                           
                            <div className="flex gap-2 items-center">
                                <HandCoins className='w-8 h-8 ms-3 flex-shrink-0'/>
                                <div className="">
                                    <p className='font-semibold'>Cash On Delivery Or Pickup
 </p>
                                    <p>Pay When You Receive</p>
                                </div>
                            </div>
                            <CircleCheckBig className='w-5 h-5 ms-3 flex-shrink-0'/>
                        </label>
                    </li>
                    <li>
                        <input onChange={(e)=>setPaymentMethod(e.target.value)} type="radio" id="Online Payment" name="paymentmethod" value="Online Payment" className="hidden peer"/>
                        <label htmlFor="Online Payment" className="inline-flex items-center justify-between w-full p-5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer dark:hover:text-slate-300 dark:border-slate-700 dark:peer-checked:text-orange-500 peer-checked:border-orange-600 dark:peer-checked:border-orange-600 peer-checked:text-orange-600 hover:text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-700">
                            <div className="flex gap-2 items-center">
                                <CreditCard className='w-8 h-8 ms-3 flex-shrink-0'/>
                                <div className="">
                                    <p className='font-semibold'>Pay Online With Your Credit Card</p>
                                    <p>Pay Online</p>
                                </div>
                            </div>
                            <CircleCheckBig className='w-5 h-5 ms-3 flex-shrink-0'/>
                        </label>
                    </li>
                </ul>
                </div>
                    </div>
                <p className='text-green-700 text-sm font-semibold flex items-center justify-center'><b>Note: </b>"You can now pay online with your credit card."</p>
                <NavButtons/>
    </form>
  )
}

