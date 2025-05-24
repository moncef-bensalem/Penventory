'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Calendar, Printer, ArrowLeft, ShoppingBag, Phone, Mail, MapPin } from 'lucide-react';

// Composant de facture
function Invoice({ orderDetails }) {
  if (!orderDetails) return null;
  
  // Utiliser la première boutique comme boutique principale pour l'en-tête
  const mainStore = orderDetails.stores && orderDetails.stores.length > 0 
    ? orderDetails.stores[0] 
    : { name: 'Marketplace', address: 'Adresse non disponible', city: 'Tunis', country: 'Tunisie', email: 'contact@marketplace.com', phone: '' };
  
  return (
    <div className="invoice-container p-8 max-w-4xl mx-auto bg-white">
      {/* En-tête de la facture */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">FACTURE</h1>
          <p className="text-gray-600">N° {orderDetails.orderNumber || orderDetails.id}</p>
          <p className="text-gray-600">Date: {new Date(orderDetails.date).toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{mainStore.name}</h2>
          <p className="text-gray-600">{mainStore.address}</p>
          <p className="text-gray-600">{mainStore.postalCode} {mainStore.city}, {mainStore.country}</p>
          <p className="text-gray-600">{mainStore.email}</p>
          {mainStore.phone && <p className="text-gray-600">{mainStore.phone}</p>}
        </div>
      </div>
      
      {/* Informations client */}
      <div className="mb-8 border-b pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Informations client</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Facturation</h3>
            <p className="text-gray-600">{orderDetails.shippingAddress.name}</p>
            <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
            <p className="text-gray-600">{orderDetails.shippingAddress.postalCode}, {orderDetails.shippingAddress.city}</p>
            <p className="text-gray-600">{orderDetails.shippingAddress.country}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Livraison</h3>
            <p className="text-gray-600">{orderDetails.shippingAddress.name}</p>
            <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
            <p className="text-gray-600">{orderDetails.shippingAddress.postalCode}, {orderDetails.shippingAddress.city}</p>
            <p className="text-gray-600">{orderDetails.shippingAddress.country}</p>
          </div>
        </div>
      </div>
      
      {/* Détails de la commande par boutique */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Détails de la commande</h2>
        
        {orderDetails.stores && orderDetails.stores.map((store, storeIndex) => (
          <div key={store.id} className={`mb-6 ${storeIndex > 0 ? 'mt-8 pt-6 border-t border-gray-200' : ''}`}>
            <h3 className="font-semibold text-gray-900 mb-3">Boutique: {store.name}</h3>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 text-left text-gray-900">Produit</th>
                  <th className="py-2 text-center text-gray-900">Quantité</th>
                  <th className="py-2 text-center text-gray-900">Prix unitaire</th>
                  <th className="py-2 text-center text-gray-900">Remise</th>
                  <th className="py-2 text-right text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {store.items.map((item) => {
                  const unitPrice = item.price;
                  const discountedPrice = unitPrice * (1 - item.discount / 100);
                  const totalPrice = discountedPrice * item.quantity;
                  
                  return (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 text-left text-gray-900">{item.name}</td>
                      <td className="py-3 text-center text-gray-900">{item.quantity}</td>
                      <td className="py-3 text-center text-gray-900">{unitPrice.toFixed(2)} DT</td>
                      <td className="py-3 text-center text-gray-900">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                      <td className="py-3 text-right text-gray-900">{totalPrice.toFixed(2)} DT</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Coordonnées de la boutique */}
            <div className="mt-2 text-sm text-gray-600">
              <p>Contact: {store.email} {store.phone ? ` | ${store.phone}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Résumé des coûts */}
      <div className="mb-8 border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Sous-total</span>
          <span className="text-gray-900">{orderDetails.subtotal.toFixed(2)} DT</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Livraison</span>
          <span className="text-gray-900">
            {orderDetails.shipping === 0 ? 'Gratuite' : `${orderDetails.shipping.toFixed(2)} DT`}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">TVA (20%)</span>
          <span className="text-gray-900">{orderDetails.tax.toFixed(2)} DT</span>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-300">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">{orderDetails.total.toFixed(2)} DT</span>
        </div>
      </div>
      
      {/* Pied de page */}
      <div className="text-center text-gray-600 text-sm mt-12 pt-6 border-t">
        <p>Merci pour votre commande!</p>
        <p>Pour toute question concernant cette facture, veuillez contacter notre service client.</p>
        <p className="mt-2">VOTRE BOUTIQUE - SIRET: 123 456 789 00012 - TVA: FR12345678900</p>
      </div>
    </div>
  );
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orderDetails, setOrderDetails] = useState(null);
  const invoiceRef = useRef(null);
  
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
      const total = subtotal + shipping + tax; // Inclure la TVA dans le total
      
      // Regrouper les articles par boutique
      const itemsByStore = {};
      cartItems.forEach(item => {
        const storeId = item.storeId || 'unknown';
        const storeName = item.storeName || 'Boutique';
        
        if (!itemsByStore[storeId]) {
          itemsByStore[storeId] = {
            id: storeId,
            name: storeName,
            logo: item.storeLogo || null,
            address: item.storeAddress || 'Adresse non disponible',
            city: item.storeCity || 'Ville non disponible',
            postalCode: item.storePostalCode || '',
            country: item.storeCountry || 'Tunisie',
            email: item.storeEmail || 'contact@boutique.com',
            phone: item.storePhone || '',
            items: []
          };
        }
        
        itemsByStore[storeId].items.push({
          id: item.id,
          name: item.name || 'Produit',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          discount: Number(item.discount) || 0,
          image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : 
                 (item.image || 'https://placehold.co/600x600/orange/white?text=Produit')
        });
      });
      
      // Créer l'objet détails de commande
      const orderData = {
        id: currentOrderId, // Utiliser l'ID MongoDB
        orderNumber: orderNumber, // Utiliser le numéro formaté
        date: new Date().toISOString(),
        status: 'confirmed',
        stores: Object.values(itemsByStore),
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name || 'Produit',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          discount: Number(item.discount) || 0,
          storeId: item.storeId || 'unknown',
          storeName: item.storeName || 'Boutique',
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
            onClick={() => {
              // Créer une nouvelle fenêtre pour l'impression
              const printWindow = window.open('', '_blank', 'width=800,height=600');
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Facture - Commande ${orderDetails.orderNumber || orderDetails.id}</title>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                  <style>
                    @media print {
                      body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                      }
                      @page {
                        size: A4;
                        margin: 0.5cm;
                      }
                    }
                    body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }
                  </style>
                </head>
                <body>
                  <div class="invoice-container p-8 max-w-4xl mx-auto bg-white">
                    <!-- En-tête de la facture -->
                    <div class="flex justify-between items-start mb-8 border-b pb-6">
                      <div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-1">FACTURE</h1>
                        <p class="text-gray-600">N° ${orderDetails.orderNumber || orderDetails.id}</p>
                        <p class="text-gray-600">Date: ${new Date(orderDetails.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div class="text-right">
                        <h2 class="text-xl font-bold text-gray-900 mb-1">${orderDetails.stores && orderDetails.stores.length > 0 ? orderDetails.stores[0].name : 'Marketplace'}</h2>
                        <p class="text-gray-600">${orderDetails.stores && orderDetails.stores.length > 0 ? orderDetails.stores[0].address : 'Adresse non disponible'}</p>
                        <p class="text-gray-600">${orderDetails.stores && orderDetails.stores.length > 0 ? `${orderDetails.stores[0].postalCode} ${orderDetails.stores[0].city}, ${orderDetails.stores[0].country}` : 'Tunis, Tunisie'}</p>
                        <p class="text-gray-600">${orderDetails.stores && orderDetails.stores.length > 0 ? orderDetails.stores[0].email : 'contact@marketplace.com'}</p>
                        ${orderDetails.stores && orderDetails.stores.length > 0 && orderDetails.stores[0].phone ? `<p class="text-gray-600">${orderDetails.stores[0].phone}</p>` : ''}
                      </div>
                    </div>
                    
                    <!-- Informations client -->
                    <div class="mb-8 border-b pb-6">
                      <h2 class="text-lg font-bold text-gray-900 mb-3">Informations client</h2>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <h3 class="font-semibold text-gray-900">Facturation</h3>
                          <p class="text-gray-600">${orderDetails.shippingAddress.name}</p>
                          <p class="text-gray-600">${orderDetails.shippingAddress.address}</p>
                          <p class="text-gray-600">${orderDetails.shippingAddress.postalCode}, ${orderDetails.shippingAddress.city}</p>
                          <p class="text-gray-600">${orderDetails.shippingAddress.country}</p>
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-900">Livraison</h3>
                          <p class="text-gray-600">${orderDetails.shippingAddress.name}</p>
                          <p class="text-gray-600">${orderDetails.shippingAddress.address}</p>
                          <p class="text-gray-600">${orderDetails.shippingAddress.postalCode}, ${orderDetails.shippingAddress.city}</p>
                          <p class="text-gray-600">${orderDetails.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Détails de la commande par boutique -->
                    <div class="mb-8">
                      <h2 class="text-lg font-bold text-gray-900 mb-3">Détails de la commande</h2>
                      
                      ${orderDetails.stores && orderDetails.stores.map((store, storeIndex) => `
                        <div class="${storeIndex > 0 ? 'mt-8 pt-6 border-t border-gray-200' : ''} mb-6">
                          <h3 class="font-semibold text-gray-900 mb-3">Boutique: ${store.name}</h3>
                          
                          <table class="w-full border-collapse">
                            <thead>
                              <tr class="border-b-2 border-gray-300">
                                <th class="py-2 text-left text-gray-900">Produit</th>
                                <th class="py-2 text-center text-gray-900">Quantité</th>
                                <th class="py-2 text-center text-gray-900">Prix unitaire</th>
                                <th class="py-2 text-center text-gray-900">Remise</th>
                                <th class="py-2 text-right text-gray-900">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${store.items.map(item => {
                                const unitPrice = item.price;
                                const discountedPrice = unitPrice * (1 - item.discount / 100);
                                const totalPrice = discountedPrice * item.quantity;
                                
                                return `
                                  <tr class="border-b border-gray-200">
                                    <td class="py-3 text-left text-gray-900">${item.name}</td>
                                    <td class="py-3 text-center text-gray-900">${item.quantity}</td>
                                    <td class="py-3 text-center text-gray-900">${unitPrice.toFixed(2)} DT</td>
                                    <td class="py-3 text-center text-gray-900">${item.discount > 0 ? `${item.discount}%` : '-'}</td>
                                    <td class="py-3 text-right text-gray-900">${totalPrice.toFixed(2)} DT</td>
                                  </tr>
                                `;
                              }).join('')}
                            </tbody>
                          </table>
                          
                          <!-- Coordonnées de la boutique -->
                          <div class="mt-2 text-sm text-gray-600">
                            <p>Contact: ${store.email} ${store.phone ? ` | ${store.phone}` : ''}</p>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                    
                    <!-- Résumé des coûts -->
                    <div class="mb-8 border-t pt-4">
                      <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Sous-total</span>
                        <span class="text-gray-900">${orderDetails.subtotal.toFixed(2)} DT</span>
                      </div>
                      <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Livraison</span>
                        <span class="text-gray-900">
                          ${orderDetails.shipping === 0 ? 'Gratuite' : `${orderDetails.shipping.toFixed(2)} DT`}
                        </span>
                      </div>
                      <div class="flex justify-between mb-4">
                        <span class="text-gray-600">TVA (20%)</span>
                        <span class="text-gray-900">${orderDetails.tax.toFixed(2)} DT</span>
                      </div>
                      <div class="flex justify-between pt-4 border-t border-gray-300">
                        <span class="font-bold text-gray-900">Total</span>
                        <span class="font-bold text-gray-900">${orderDetails.total.toFixed(2)} DT</span>
                      </div>
                    </div>
                    
                    <!-- Pied de page -->
                    <div class="text-center text-gray-600 text-sm mt-12 pt-6 border-t">
                      <p>Merci pour votre commande!</p>
                      <p>Pour toute question concernant cette facture, veuillez contacter notre service client.</p>
                      <p class="mt-2">VOTRE BOUTIQUE - SIRET: 123 456 789 00012 - TVA: FR12345678900</p>
                    </div>
                  </div>
                  <script>
                    // Imprimer automatiquement la facture
                    window.onload = function() {
                      setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                          window.close();
                        }, 500);
                      }, 500);
                    };
                  </script>
                </body>
                </html>
              `);
              printWindow.document.close();
            }}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimer la facture
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
