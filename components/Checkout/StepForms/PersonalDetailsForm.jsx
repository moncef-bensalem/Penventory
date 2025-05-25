'use client'
import TextInput from '@/components/FormInputs/TextInput'
import React from 'react'
import { useForm } from 'react-hook-form';
import NavButtons from './NavButtons';
import { useCheckout } from '@/context/checkout-context';
import { useSession } from 'next-auth/react';

export default function PersonalDetailsForm() {
    const {data:session,status} = useSession()
    const userId = session?.user?.id
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
        async function processData(data){
          if (userId){
            data.userId = userId
            updateCheckoutFormData(data)
            setCurrentStep(currentStep+1)
          }
    }
  return (
    <form onSubmit={handleSubmit(processData)}>
        <h2 className='text-xl font-semibold mb-6 text-orange-500 dark:text-orange-400'>Personal Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 ">
                    <TextInput
                        label="First Name"
                        name="firstname"
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    <TextInput
                        label="Last Name"
                        name="lastname"
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    <TextInput
                        label="Email Address"
                        name="email"
                        type='email'
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    <TextInput
                        label="Phone Nubmer"
                        name="phone"
                        register={register}
                        errors={errors}
                        className="w-full"
                    />
                    </div>
                <NavButtons/>
    </form>
  )
}
