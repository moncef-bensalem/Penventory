'use client'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useCart } from '@/context/cart-context'

export default function CartBanner() {
  const { cartItems } = useCart()
  
  // Vérifier si cartItems est un tableau et s'il contient des éléments
  const subTotal = Array.isArray(cartItems) && cartItems.length > 0 
    ? cartItems.reduce((acc, currentItem) => {
        // Vérifier que price et quantity sont des nombres valides
        const price = Number(currentItem.price) || 0;
        const quantity = Number(currentItem.quantity) || 0;
        return acc + (price * quantity);
      }, 0).toFixed(3)
    : '0.000'
  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl mb-6">
                <div className="p-4">
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center flex-1">
                      <div className="inline-flex items-center justify-center flex-shrink-0 bg-orange-500 rounded-full w-9 h-9 text-gray-50">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="ml-3 text-base font-normal text-gray-900 dark:text-slate-100">
                        You have <span className='font-bold'>{cartItems.length}</span> items in cart. Sub total is{" "}
                        <span className="font-bold">{subTotal} Dt</span>
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0">
                      <Link
                        href='/cart'
                        type="button"
                        className="
                                            inline-flex
                                            items-center
                                            px-4
                                            py-2
                                            text-base
                                            font-semibold
                                            text-slate-200
                                            transition-all
                                            duration-200
                                            rounded-md
                                            bg-orange-500
                                            hover:bg-orange-600 
                                        "
                      >
                        Edit cart
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
  )
}
