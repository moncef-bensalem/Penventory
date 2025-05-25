'use client'
import { ChevronLeft, CircleCheckBig } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '@/context/cart-context'
import { useCheckout } from '@/context/checkout-context'
import Link from 'next/link'

export default function OrderSummaryForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { currentStep, setCurrentStep, checkoutFormData } = useCheckout()
    const { cartItems } = useCart()
    
    // Fonction pour obtenir l'URL de l'image ou une image placeholder
    const getImageUrl = (src, itemName) => {
      if (src && typeof src === 'string' && src.startsWith('http')) {
        return src;
      } else if (Array.isArray(src) && src.length > 0 && typeof src[0] === 'string') {
        return src[0];
      } else {
        // Image placeholder avec le nom du produit
        const encodedName = encodeURIComponent(itemName || 'Produit');
        return `https://placehold.co/600x600/orange/white?text=${encodedName}`;
      }
    };
    
    // État pour stocker les valeurs du panier
    const [cartSummary, setCartSummary] = useState({
      subtotal: '0.000',
      shippingCost: '0.000',
      taxAmount: '0.000',
      total: '0.000',
      couponApplied: false,
      couponAmount: '0.000'
    })
    
    // Calcul direct des valeurs du panier à partir des articles
    useEffect(() => {
      // Calcul du sous-total (avec réductions produits)
      const calculatedSubtotal = cartItems.reduce((total, item) => {
        const itemPrice = item.discount > 0 
          ? item.price * (1 - item.discount / 100) 
          : item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      // Vérifier si un code promo a été appliqué
      const storedCouponDiscount = localStorage.getItem('couponDiscount') 
        ? Number(localStorage.getItem('couponDiscount')) 
        : 0;
      
      const hasCoupon = storedCouponDiscount > 0;
      
      // Calculer la réduction du coupon
      const calculatedCouponAmount = hasCoupon 
        ? calculatedSubtotal * (storedCouponDiscount / 100) 
        : 0;
      
      // Calculer le montant après réduction
      const afterDiscount = calculatedSubtotal - calculatedCouponAmount;
      
      // Calculer les frais de livraison (gratuit si le sous-total > 30 DT)
      const calculatedShippingCost = afterDiscount > 30 ? 0 : 7.00;
      
      // Calculer la TVA (20%)
      const calculatedTaxAmount = afterDiscount * 0.2;
      
      // Calculer le total final
      const calculatedTotal = afterDiscount + calculatedShippingCost + calculatedTaxAmount;
      
      // Mettre à jour l'état avec les valeurs calculées
      const newCartSummary = {
        subtotal: calculatedSubtotal.toFixed(3),
        couponDiscount: storedCouponDiscount,
        couponAmount: calculatedCouponAmount.toFixed(3),
        shippingCost: calculatedShippingCost.toFixed(3),
        taxAmount: calculatedTaxAmount.toFixed(3),
        total: calculatedTotal.toFixed(3),
        couponApplied: hasCoupon
      };
      
      setCartSummary(newCartSummary);
      
      // Afficher les valeurs calculées dans la console
      console.log('Valeurs calculées dans OrderSummaryForm:', newCartSummary);
    }, [cartItems])
    
    function handlePrevious() {
      setCurrentStep(currentStep-1)
    }
    
    // Afficher les valeurs du panier dans la console
    console.log('Checkout Summary:', {
      subtotal: cartSummary.subtotal,
      couponAmount: cartSummary.couponAmount,
      shippingCost: cartSummary.shippingCost,
      taxAmount: cartSummary.taxAmount,
      total: cartSummary.total
    });
  async function submitData() {
  // Formater les données dans le format attendu par l'API
  const { firstName, lastName, email, phone, address, city, postalCode, country, paymentMethod } = checkoutFormData;
  
  // Créer l'adresse de livraison
  const shippingAddress = {
    name: `${firstName || ''} ${lastName || ''}`.trim(),
    address: address || '',
    city: city || '',
    postalCode: postalCode || '',
    country: country || ''
  };
  
  // Créer les informations du client
  const customerInfo = {
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    phone: phone || ''
  };
  
  // Formater les articles du panier
  const items = cartItems.map(item => ({
    productId: item.id,
    name: item.title || item.name,
    price: parseFloat(item.price),
    quantity: item.quantity,
    image: item.imageUrl || (item.images && item.images.length > 0 ? item.images[0] : null),
    storeId: item.storeId,
    storeName: item.storeName,
    discount: item.discount || 0
  }));
  
  // Créer les données de la commande dans le format attendu par l'API
  const data = {
    items: items,
    shippingAddress: shippingAddress,
    customerInfo: customerInfo,
    total: parseFloat(cartSummary.total) || 0,
    subtotal: parseFloat(cartSummary.subtotal) || 0,
    taxAmount: parseFloat(cartSummary.taxAmount) || 0,
    shippingCost: parseFloat(cartSummary.shippingCost) || 0,
    couponAmount: parseFloat(cartSummary.couponAmount || 0) || 0,
    couponApplied: cartSummary.couponApplied || false,
    paymentMethod: paymentMethod || 'Carte bancaire'
  };
  
  // Vérifier qu'aucune valeur n'est NaN
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'number' && isNaN(data[key])) {
      data[key] = 0;
    }
  });
  
  try {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    // Vérifier si c'est un paiement en ligne
    if (paymentMethod === 'Online Payment') {
      // Simuler un processus de paiement en ligne
      toast.loading('Traitement du paiement en cours...', { duration: 2000 });
      
      // Ici, vous pourriez intégrer un vrai système de paiement comme Stripe
      // Pour l'instant, nous simulons simplement un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ajouter un indicateur de paiement réussi
      data.paymentStatus = 'PAID';
    }
    
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      setLoading(false);
      toast.success("Commande créée avec succès");
      
      console.log('Réponse de l\'API:', responseData);
      
      // Stocker les informations de commande pour la page de confirmation
      const checkoutInfo = {
        name: shippingAddress.name,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        paymentMethod: paymentMethod || 'Carte bancaire',
        email: email,
        phone: phone
      };
      
      // Stocker aussi les informations de contact directement
      if (email) localStorage.setItem('checkout_email', email);
      if (phone) localStorage.setItem('checkout_phone', phone);
      
      // Stocker les informations de checkout dans localStorage
      Object.entries(checkoutInfo).forEach(([key, value]) => {
        if (value) localStorage.setItem(`checkout_${key}`, value);
      });
      
      // Stocker les articles commandés
      localStorage.setItem('lastOrder', JSON.stringify(cartItems));
      
      // Vider le panier après la commande
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Vérifier si nous avons des orderIds dans la réponse
      if (responseData.orderIds && responseData.orderIds.length > 0) {
        const orderId = responseData.orderIds[0].id;
        
        // Stocker les orderIds dans localStorage pour la page de confirmation
        localStorage.setItem('orderIds', JSON.stringify(responseData.orderIds));
        
        // Rediriger vers la page de confirmation avec l'ID de la commande
        router.push(`/checkout/confirmation?orderId=${orderId}`);
      } 
      // Si nous avons des commandes mais pas d'orderIds
      else if (responseData.orders && responseData.orders.length > 0) {
        const orderId = responseData.orders[0].id;
        
        // Stocker les commandes dans localStorage pour la page de confirmation
        localStorage.setItem('lastOrders', JSON.stringify(responseData.orders));
        
        // Rediriger vers la page de confirmation avec l'ID de la commande
        router.push(`/checkout/confirmation?orderId=${orderId}`);
      }
      // Fallback si nous n'avons ni orderIds ni orders
      else {
        console.error('Aucun ID de commande trouvé dans la réponse:', responseData);
        toast.warning("Commande créée mais impossible de trouver l'ID");
        
        // Rediriger vers la page de confirmation générale sans ID
        router.push('/checkout/confirmation');
      }
    } else {
      setLoading(false);
      console.error('Erreur API:', responseData);
      // Afficher des détails plus précis sur l'erreur
      let errorMessage = "Une erreur est survenue lors de la création de la commande";
      if (responseData.error) {
        errorMessage = responseData.error;
        if (typeof responseData.error === 'object') {
          try {
            errorMessage = JSON.stringify(responseData.error);
          } catch (e) {
            // Garder le message par défaut
          }
        }
      }
      toast.error(errorMessage);
    }
  } catch (error) {
    setLoading(false);
    console.error('Erreur lors de la création de la commande:', error);
    // Essayer d'extraire plus d'informations sur l'erreur
    let errorMessage = "Une erreur est survenue lors de la création de la commande";
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    toast.error(errorMessage);
  }
}
  
  return (
    <div className='flex flex-col gap-4 w-full'>
        <div className='flex flex-col gap-4 w-full'>
        <h2 className='text-2xl font-semibold'>Order Summary</h2>
        {
          cartItems.map((cartItem, i) => {
            return (
                <div key={i} className='flex items-center justify-between border-b border-slate-400  pb-3 font-semibold text-sm'>
                        <div className='flex items-center gap-3'>
                          <div className="h-16 w-16 rounded-md overflow-hidden">
                            <img
                              src={getImageUrl(cartItem.images || cartItem.imageUrl, cartItem.title || cartItem.name)}
                              alt={cartItem.title || cartItem.name || 'Produit'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className='flex flex-col'>
                            <h2 className='flex flex-col text-xl'>{cartItem.title}</h2>
                            <small><b>Brand: </b> {cartItem.brand || 'N/A'} | <b>Color: </b> {cartItem.color || 'N/A'}</small>
                          </div>
                        </div>
                        <div className="rounded-xl border border-gray-400 flex gap-3 items-center">
                          <p className='flex-grow px-3 py-'>{cartItem.quantity || 1}</p>
                        </div>
                        <div className='flex items-center gap-8'>
                          <h2 className='text-xl'>{((cartItem.price || 0) * (cartItem.quantity || 1)).toFixed(3)} Dt</h2>
                        </div>  
                      </div>
            )
            
        })
        }
        
        {/* Affichage du récapitulatif des coûts */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
            <span className="font-semibold">{cartSummary.subtotal} Dt</span>
          </div>
          {cartSummary.couponApplied && (
            <div className="flex justify-between items-center py-2 text-green-600">
              <span>Réduction:</span>
              <span>-{cartSummary.couponAmount} Dt</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">Frais de livraison:</span>
            <span className="font-semibold">{Number(cartSummary.shippingCost) === 0 ? 'Gratuit' : `${cartSummary.shippingCost} Dt`}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">TVA (20%):</span>
            <span className="font-semibold">{cartSummary.taxAmount} Dt</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-2">
            <span className="text-lg font-bold text-gray-800 dark:text-white">Total:</span>
            <span className="text-lg font-bold text-orange-500">{cartSummary.total} Dt</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
            <button onClick={handlePrevious} type='button' className='inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-slate-50 bg-orange-500 rounded-lg hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'>
              <ChevronLeft className='w-5 h-5 mr-2'/>
              <span>Previous</span>
            </button>
            {
              loading?(
                <button disabled className='inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-slate-50 bg-orange-500 rounded-lg hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'>Processing! Please Wait ...</button>
              ):(
                <button onClick={submitData} className='inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-slate-50 bg-orange-500 rounded-lg hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'>
                <CircleCheckBig className='w-5 h-5 mr-2'/>
                <span>Proceed To Payment</span>
            </button>
              )
            }
        </div>
    </div>
  </div>
  )
}
