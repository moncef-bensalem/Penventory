import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import { useCheckout } from '@/context/checkout-context'

export default function NavButtons() {
        const { currentStep, setCurrentStep } = useCheckout()
        
        function handlePrevious(){
          setCurrentStep(currentStep-1)
        }
  return (
    <div className='flex justify-between items-center'>
        {currentStep>1 && (
            <button onClick={handlePrevious} type='button' className='inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-slate-50 bg-orange-500 rounded-lg hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'>
                <ChevronLeft className='w-5 h-5 mr-2'/>
                <span>Previous</span>
            </button>
        )}
        <button type='submit' className='inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-slate-50 bg-orange-500 rounded-lg hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'>
                <ChevronRight className='w-5 h-5 mr-2'/>
                <span>Next</span>
            </button>
    </div>
  )
}
