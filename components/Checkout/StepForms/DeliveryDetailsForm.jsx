'use client'
import TextInput from '@/components/FormInputs/TextInput'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import NavButtons from './NavButtons';
import SelectInput from '@/components/FormInputs/SelectInput'
import {CircleCheckBig, Hand, Truck } from 'lucide-react';
import { useCheckout } from '@/context/checkout-context';

export default function DeliveryDetailsForm() {
    const { currentStep, setCurrentStep, checkoutFormData: existingFormData, updateCheckoutFormData } = useCheckout()
    const states = [
  { id: 1, title: "Ariana" },
  { id: 2, title: "Béja" },
  { id: 3, title: "Ben Arous" },
  { id: 4, title: "Bizerte" },
  { id: 5, title: "Gabès" },
  { id: 6, title: "Gafsa" },
  { id: 7, title: "Jendouba" },
  { id: 8, title: "Kairouan" },
  { id: 9, title: "Kasserine" },
  { id: 10, title: "Kebili" },
  { id: 11, title: "Kef" },
  { id: 12, title: "Mahdia" },
  { id: 13, title: "Manouba" },
  { id: 14, title: "Medenine" },
  { id: 15, title: "Monastir" },
  { id: 16, title: "Nabeul" },
  { id: 17, title: "Sfax" },
  { id: 18, title: "Sidi Bouzid" },
  { id: 19, title: "Siliana" },
  { id: 20, title: "Sousse" },
  { id: 21, title: "Tataouine" },
  { id: 22, title: "Tozeur" },
    { id: 23, title: "Tunis" },
  { id: 24, title: "Zaghouan" }
]

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
    const initialDeliveryCost = existingFormData.deliveryCost||""
    const [deliveryCost,setDeliveryCost] = useState(initialDeliveryCost)
          console.log(deliveryCost)
    async function processData(data){
        data.deliveryCost = deliveryCost
        updateCheckoutFormData(data)
        setCurrentStep(currentStep+1)
    }
  return (
    <form onSubmit={handleSubmit(processData)}>
        <h2 className='text-xl font-semibold mb-6 text-orange-500 dark:text-orange-400'>Delivery Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 ">
                    <TextInput
                        label="Street Address"
                        name="street"
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    <TextInput
                        label="City"
                        name="city"
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    <SelectInput
                        label="Governorate / State"
                        name="state"
                        register={register}
                        options = {states}
                        className="w-full"
                    />

                    <TextInput
                        label="Postal Code"
                        name="postalcode"
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    
                <div className=" col-span-full">
                    <h3 className="mb-5 text-lg font-medium text-slate-900 dark:text-white">Select Either Doorstep Delivery Or Pick Up Your Order In Store.</h3>
                <ul className="grid w-full gap-6 md:grid-cols-2">
                    <li>
                        <input onChange={(e)=>setDeliveryCost(e.target.value)} type="radio" id="delivery" name="deliverycost" value="7" className="hidden peer" required />
                        <label htmlFor="delivery" className="inline-flex items-center justify-between w-full p-5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer dark:hover:text-slate-300 dark:border-slate-700 dark:peer-checked:text-orange-500 peer-checked:border-orange-600 dark:peer-checked:border-orange-600 peer-checked:text-orange-600 hover:text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-700">                           
                            <div className="flex gap-2 items-center">
                                <Truck className='w-8 h-8 ms-3 flex-shrink-0'/>
                                <div className="">
                                    <p className='font-semibold'>Delivery To Doorstep
 </p>
                                    <p>Delivery Cost : 7 Dt</p>
                                </div>
                            </div>
                            <CircleCheckBig className='w-5 h-5 ms-3 flex-shrink-0'/>
                        </label>
                    </li>
                    <li>
                        <input onChange={(e)=>setDeliveryCost(e.target.value)} type="radio" id="pickup" name="deliverycost" value="0" className="hidden peer"/>
                        <label htmlFor="pickup" className="inline-flex items-center justify-between w-full p-5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer dark:hover:text-slate-300 dark:border-slate-700 dark:peer-checked:text-orange-500 peer-checked:border-orange-600 dark:peer-checked:border-orange-600 peer-checked:text-orange-600 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:bg-slate-900 dark:hover:bg-slate-700">
                            <div className="flex gap-2 items-center">
                                <Hand className='w-8 h-8 ms-3 flex-shrink-0'/>
                                <div className="">
                                    <p className='font-semibold'>Picking Up From Store</p>
                                    <p>No Delivery Cost : 0 Dt</p>
                                </div>
                            </div>
                            <CircleCheckBig className='w-5 h-5 ms-3 flex-shrink-0'/>
                        </label>
                    </li>
                </ul>
                </div>

                    </div>
                <NavButtons/>
    </form>
  )
}

