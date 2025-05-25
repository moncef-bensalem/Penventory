'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Calendar, Printer, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }
    
    // Récupérer les informations de commande stockées dans localStorage
    try {
      // On récupère le panier car c'est ce qui a été commandé
      const cartItems = JSON.parse(localStorage.getItem('lastOrder') || '[]');
      
      // Récupérer les IDs MongoDB des commandes avec sécurité
      let orderIds = [];
      try {
        const orderIdsString = localStorage.getItem('orderIds');
        if (orderIdsString && orderIdsString.startsWith('[') && orderIdsString.endsWith(']')) {
          orderIds = JSON.parse(orderIdsString);
        } else {
          console.warn('Format incorrect des orderIds dans localStorage');
        }
      } catch (parseError) {
        console.error('Erreur lors du parsing des orderIds:', parseError);
        // En cas d'erreur, on continue avec un tableau vide
      }
      
      const currentOrderId = orderIds.length > 0 && orderIds[0].id ? orderIds[0].id : orderId;
      const orderNumber = orderIds.length > 0 && orderIds[0].number ? orderIds[0].number : orderId;
      
      // Si le panier est vide, on essaie de récupérer l'historique
      if (!cartItems || cartItems.length === 0) {
        console.log("Aucun article dans la dernière commande, utilisation de l'historique si disponible");
      }
      
      // Calculer les totaux
      const subtotal = cartItems.reduce((total, item) => 
        total + (item.price * (1 - (item.discount || 0) / 100) * item.quantity), 0);
      const shipping = subtotal > 30 ? 0 : 4.99;
      const tax = subtotal * 0.2; // TVA 20%
      const total = subtotal + shipping;
      
      // Créer l'objet détails de commande
      const orderData = {
        id: currentOrderId, // Utiliser l'ID MongoDB
        orderNumber: orderNumber, // Utiliser le numéro formaté
        date: new Date().toISOString(),
        status: 'confirmed',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name || 'Produit',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          discount: Number(item.discount) || 0,
          image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : 
                 (item.image || 'https://placehold.co/600x600/orange/white?text=Produit')
        })),
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        shippingAddress: {
          name: localStorage.getItem('checkout_name') || 'Client',
          address: localStorage.getItem('checkout_address') || '123 Rue de Paris',
          city: localStorage.getItem('checkout_city') || 'Paris',
          postalCode: localStorage.getItem('checkout_postalCode') || '75000',
          country: localStorage.getItem('checkout_country') || 'France'
        },
        paymentMethod: localStorage.getItem('checkout_paymentMethod') || 'Carte bancaire',
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      };
      
      setOrderDetails(orderData);
      
      // Vider le panier après la commande et stocker cette commande comme dernière commande
      if (!localStorage.getItem('lastOrder')) {
        localStorage.setItem('lastOrder', JSON.stringify(cartItems));
        localStorage.setItem('cart', JSON.stringify([]));
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données de commande:', error);
      
      // En cas d'erreur, utiliser des données de secours
      const mockOrderDetails = {
        id: orderId,
        orderNumber: orderId,
        date: new Date().toISOString(),
        status: 'confirmed',
        items: [
          {
            id: 1,
            name: 'Produit de secours',
            price: 9.99,
            quantity: 1,
            discount: 0,
            image: 'https://placehold.co/600x600/orange/white?text=Produit'
          }
        ],
        subtotal: 9.99,
        shipping: 0,
        tax: 2.00,
        total: 9.99,
        shippingAddress: {
          name: 'Client',
          address: 'Adresse non disponible',
          city: 'Ville',
          postalCode: '00000',
          country: 'France'
        },
        paymentMethod: 'Méthode de paiement',
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      };
      
      setOrderDetails(mockOrderDetails);
    }
  }, [orderId, router]);
  
  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Bannière de confirmation */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Merci pour votre commande. Un email de confirmation a été envoyé à votre adresse email.
          </p>
          <div className="text-sm bg-white dark:bg-gray-800 inline-block px-4 py-2 rounded-md font-mono text-gray-700 dark:text-gray-300">
            Numéro de commande: <span className="font-bold">{orderDetails.orderNumber}</span>
          </div>
        </div>
        
        {/* Détails de la commande */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Détails de la commande</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Informations</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <span className="font-medium">Date de commande:</span> {new Date(orderDetails.date).toLocaleDateString('fr-FR')}
                  </li>
                  <li>
                    <span className="font-medium">Statut:</span> <span className="text-green-600 dark:text-green-400">Confirmée</span>
                  </li>
                  <li>
                    <span className="font-medium">Méthode de paiement:</span> {orderDetails.paymentMethod}
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Livraison</h3>
                <address className="not-italic text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.address}</p>
                  <p>{orderDetails.shippingAddress.postalCode}, {orderDetails.shippingAddress.city}</p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </address>
                <p className="mt-2 text-sm flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Livraison estimée: <span className="font-medium ml-1">{orderDetails.estimatedDelivery}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Récapitulatif des articles */}
          <div className="p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Articles commandés</h3>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orderDetails.items.map((item) => (
                <div key={`item-${item.id}-${Math.random().toString(36).substr(2, 9)}`} className="py-4 flex justify-between">
                  <div className="flex items-center">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-12 w-12 object-cover mr-4" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantité: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {((item.price * (1 - item.discount / 100)) * item.quantity).toFixed(2)} DT
                    </p>
                    {item.discount > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400">-{item.discount}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Résumé des coûts */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span className="text-gray-900 dark:text-white">{orderDetails.subtotal.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                <span className="text-gray-900 dark:text-white">
                  {orderDetails.shipping === 0 ? 'Gratuite' : `${orderDetails.shipping.toFixed(2)} DT`}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                <span className="text-gray-900 dark:text-white">{orderDetails.tax.toFixed(2)} DT</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">{orderDetails.total.toFixed(2)} DT</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continuer mes achats
          </Link>
          <Link
            href={`/account/orders/${orderDetails.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            <Package className="mr-2 h-5 w-5" />
            Suivre ma commande
          </Link>
          <button 
            onClick={() => window.print()}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimer la confirmation
          </button>
        </div>
      </div>
    </div>
  );
}
