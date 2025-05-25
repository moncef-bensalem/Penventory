'use client'
import React from 'react'
import PersonalDetailsForm from './StepForms/PersonalDetailsForm'
import DeliveryDetailsForm from './StepForms/DeliveryDetailsForm'
import PaymentMethodForm from './StepForms/PaymentMethodForm'
import OrderSummaryForm from './StepForms/OrderSummaryForm'
import { useCheckout } from '@/context/checkout-context'

export default function StepForm() {
    const { currentStep } = useCheckout()


    function renderFormByStep(step){
        
        if(step===1){
            return <PersonalDetailsForm/>
        }else if(step===2){
            return <DeliveryDetailsForm/>
        }else if(step===3){
            return <PaymentMethodForm/>
        }else if(step===4){
            return <OrderSummaryForm/>
        } 
    }
  return <div>{renderFormByStep(currentStep)}</div>
}
