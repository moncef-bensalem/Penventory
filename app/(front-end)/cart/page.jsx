  'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, X, ChevronLeft, ChevronRight, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useConfirmation } from '@/hooks/use-confirmation';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [promoStoreId, setPromoStoreId] = useState(null);
  const { openConfirmation, ConfirmationDialog } = useConfirmation();
  
  // Récupérer les éléments du panier depuis le localStorage
  useEffect(() => {
    setLoading(true);
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Erreur lors de la récupération du panier:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  }, []);
  
  // Mettre à jour le localStorage lorsque le panier change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      // Déclencher un événement pour mettre à jour le compteur du panier dans la navigation
      window.dispatchEvent(new Event('storage'));
    }
  }, [cartItems, loading]);
  
  // Mettre à jour promoStoreId depuis localStorage
  useEffect(() => {
    const storedPromoStore = localStorage.getItem('appliedPromoStore');
    setPromoStoreId(storedPromoStore);
  }, [couponApplied]);
  
  // Fonction pour mettre à jour la quantité d'un produit
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Trouver le produit dans le panier
    const product = cartItems.find(item => item.id === productId);
    
    // Vérifier si le produit a une propriété stock et si la nouvelle quantité dépasse le stock disponible
    if (product && product.stock !== undefined && newQuantity > product.stock) {
      openConfirmation({
        title: "Stock insuffisant",
        message: `Désolé, il n'y a que ${product.stock} exemplaire${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''} en stock pour ${product.name}.`,
        confirmText: "OK",
        type: "danger"
      });
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // Fonction pour supprimer un produit du panier
  const removeItem = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  // Fonction pour vider le panier
  const clearCart = () => {
    openConfirmation({
      title: "Vider le panier",
      message: "Êtes-vous sûr de vouloir vider votre panier ? Tous les articles seront supprimés.",
      confirmText: "Vider le panier",
      cancelText: "Annuler",
      type: "danger",
      onConfirm: () => {
        setCartItems([]);
      }
    });
  };
  
  // Fonction pour appliquer un code promo
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Veuillez entrer un code promo');
      return;
    }
    
    try {
      // Calculer le total du panier pour vérifier les conditions de montant minimum
      const cartTotal = cartItems.reduce((total, item) => {
        const itemPrice = item.discount > 0 
          ? item.price * (1 - item.discount / 100) 
          : item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      // Préparation des données du panier pour l'API
      const cartItemsForApi = cartItems.map(item => ({
        id: item.id,
        price: item.price,
        discount: item.discount || 0,
        quantity: item.quantity,
        store: item.store ? {
          id: item.store.id,
          name: item.store.name
        } : null
      }));
      
      // Récupérer tous les storeIds des produits du panier
      const cartStoreIds = [...new Set(cartItems.map(item => item.store?.id).filter(Boolean))];
      
      // Vérifier le code promo via l'API
      const response = await fetch('/api/coupons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartItems: cartItemsForApi,
          cartStoreIds: cartStoreIds,
          cartTotal
        }),
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setCouponApplied(true);
        
        // Pour une promotion de type pourcentage
        if (result.discount.type === 'PERCENTAGE') {
          setCouponDiscount(result.discount.value);
        } 
        // Pour une promotion de type montant fixe, convertir en pourcentage équivalent
        else if (result.discount.type === 'FIXED') {
          // Calculer le pourcentage équivalent au montant fixe par rapport au sous-total
          const equivalentPercentage = (result.discount.value / subtotal) * 100;
          setCouponDiscount(equivalentPercentage);
        }
        
        // Stocker les informations de la promotion
        if (result.storeId) {
          // Si c'est une promotion de magasin, stocker l'ID du magasin
          localStorage.setItem('appliedPromoStore', result.storeId);
        } else {
          // Si c'est une promotion globale, supprimer toute restriction de magasin
          localStorage.removeItem('appliedPromoStore');
        }
        
        alert(result.message || 'Code promo appliqué avec succès !');
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        localStorage.removeItem('appliedPromoStore');
        alert(result.message || 'Code promo invalide.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du code promo:', error);
      setCouponApplied(false);
      setCouponDiscount(0);
      alert('Une erreur est survenue lors de la vérification du code promo. Veuillez réessayer.');
    }
  };
  
  // Calculer le sous-total (sans réduction)
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.discount > 0 
      ? item.price * (1 - item.discount / 100) 
      : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Calculer la réduction du coupon
  const couponAmount = couponApplied ? (() => {
    // Temporairement: appliquer la réduction à tous les produits, quel que soit le magasin
    return subtotal * (couponDiscount / 100);
    
    // Code original commenté:
    /*
    // Si c'est une promotion spécifique à un magasin
    if (promoStoreId) {
      // Calculer uniquement sur les produits de ce magasin (vérification stricte)
      const storeSubtotal = cartItems.reduce((total, item) => {
        // Vérifier strictement si l'article appartient au magasin concerné
        if (item.store && item.store.id === promoStoreId) {
          const itemPrice = item.discount > 0 
            ? item.price * (1 - item.discount / 100) 
            : item.price;
          return total + (itemPrice * item.quantity);
        }
        return total;
      }, 0);
      
      return storeSubtotal * (couponDiscount / 100);
    } else {
      // Promotion globale, appliquer à tous les produits
      return subtotal * (couponDiscount / 100);
    }
    */
  })() : 0;
  
  // Calculer les frais de livraison (gratuit si le sous-total > 30€)
  const shippingCost = subtotal > 30 ? 0 : 7.00;
  
  // Calculer la TVA (20%)
  const taxRate = 0.2;
  const taxAmount = (subtotal - couponAmount) * taxRate;
  
  // Calculer le total (avec TVA)
  const total = subtotal - couponAmount + shippingCost + taxAmount;
  
  // Fonction pour passer à la page de paiement
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      openConfirmation({
        title: "Panier vide",
        message: "Votre panier est vide.",
        confirmText: "OK",
        type: "info"
      });
      return;
    }
    
    // Sauvegarder les informations de réduction du coupon dans localStorage
    if (couponApplied) {
      localStorage.setItem('couponDiscount', couponDiscount.toString());
      localStorage.setItem('couponAmount', couponAmount.toString());
      localStorage.setItem('promoStoreId', promoStoreId || '');
      localStorage.setItem('cartTotal', total.toString());
      localStorage.setItem('taxAmount', taxAmount.toString());
    } else {
      // Supprimer les informations de réduction si aucun coupon n'est appliqué
      localStorage.removeItem('couponDiscount');
      localStorage.removeItem('couponAmount');
      localStorage.removeItem('promoStoreId');
      localStorage.removeItem('cartTotal');
      localStorage.removeItem('taxAmount');
    }
    
    // Rediriger vers la page de paiement
    router.push('/checkout');
  };
  
  // Fonction pour ajouter un produit au panier
  const handleAddToCart = (product) => {
    // Vérifier si le produit est déjà dans le panier
    const existingProduct = cartItems.find(item => item.id === product.id);
    
    // Vérifier si le produit a une propriété stock
    if (product.stock !== undefined) {
      // Si le produit existe déjà, vérifier que la nouvelle quantité ne dépasse pas le stock
      if (existingProduct) {
        const newQuantity = existingProduct.quantity + 1;
        if (newQuantity > product.stock) {
          openConfirmation({
            title: "Stock insuffisant",
            message: `Désolé, il n'y a que ${product.stock} exemplaire${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''} en stock pour ${product.name}.`,
            confirmText: "OK",
            type: "danger"
          });
          return;
        }
        updateQuantity(product.id, newQuantity);
      } else {
        // Si le produit n'est pas dans le panier, vérifier que le stock est suffisant
        if (product.stock < 1) {
          openConfirmation({
            title: "Produit indisponible",
            message: `Désolé, ${product.name} n'est plus disponible en stock.`,
            confirmText: "OK",
            type: "danger"
          });
          return;
        }
        setCartItems([...cartItems, { ...product, quantity: 1 }]);
      }
    } else {
      // Comportement par défaut si le stock n'est pas défini
      if (existingProduct) {
        updateQuantity(product.id, existingProduct.quantity + 1);
      } else {
        setCartItems([...cartItems, { ...product, quantity: 1 }]);
      }
    }
  };
  
  // Fonction pour obtenir l'URL de l'image ou une image placeholder
  const getImageUrl = (src, itemName) => {
    // Si pas d'image, utiliser un placeholder
    if (!src) {
      return `https://placehold.co/600x600/orange/white?text=${encodeURIComponent(typeof itemName === 'string' ? itemName : 'Produit')}`;
    }
    
    // Si src est un tableau, prendre le premier élément
    if (Array.isArray(src)) {
      return src[0];
    }
    
    // Retourner l'URL telle quelle
    return src;
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Panier</h1>
          <Link 
            href="/products" 
            className="text-orange-600 hover:text-orange-700 flex items-center text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Continuer mes achats
          </Link>
        </div>
        
        {loading ? (
          // Affichage du chargement
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="h-24 w-24 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                <div className="ml-6 flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Liste des produits */}
            <div className="lg:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Articles ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Vider le panier
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => {
                    // Calculer le prix avec réduction si applicable
                    const itemPrice = item.discount > 0 
                      ? item.price * (1 - item.discount / 100) 
                      : item.price;
                    
                    return (
                      <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                        {/* Image du produit */}
                        <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                          <div className="h-24 w-24 rounded-md overflow-hidden">
                            <img
                              src={getImageUrl(item.images && item.images.length > 0 ? item.images[0] : null, item.name)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        
                        {/* Détails du produit */}
                        <div className="sm:ml-6 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                <Link href={`/product-details/${item.id}`} className="hover:text-orange-600">
                                  {item.name}
                                </Link>
                                {couponApplied && (
                                  <span className="ml-2 text-xs py-1 px-2 bg-green-100 text-green-800 rounded-full">
                                    Promo appliquée
                                  </span>
                                )}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.brand}
                              </p>
                              {item.seller && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  Vendu par: {item.seller.name}
                                </p>
                              )}
                            </div>
                            <div className="mt-4 sm:mt-0">
                              <div className="flex items-center">
                                {item.discount > 0 && (
                                  <span className="text-sm text-gray-500 line-through mr-2">
                                    {item.price.toFixed(2)} DT
                                  </span>
                                )}
                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                  {itemPrice.toFixed(2)} DT
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-900 dark:text-white">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-gray-500 hover:text-red-600 flex items-center"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Récapitulatif de la commande */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Récapitulatif de la commande
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                    <span className="text-gray-900 dark:text-white font-medium">{subtotal.toFixed(2)} DT</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex flex-col">
                        <span>Réduction ({couponDiscount.toFixed(0)}%)</span>
                        {/* Message temporairement supprimé
                        {promoStoreId && (
                          <span className="text-xs text-gray-500">
                            Applicable uniquement aux produits {cartItems.find(item => item.store?.id === promoStoreId)?.store?.name 
                              ? `de ${cartItems.find(item => item.store?.id === promoStoreId)?.store?.name}`
                              : 'du magasin sélectionné'}
                          </span>
                        )}
                        */}
                      </span>
                      <span>-{couponAmount.toFixed(2)} DT</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frais de livraison</span>
                    <span className={shippingCost === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}>
                      {shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} DT`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                    <span className="text-gray-900 dark:text-white">{taxAmount.toFixed(2)} DT</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{total.toFixed(2)} DT</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">TVA incluse</p>
                  </div>
                  
                  {/* Code promo */}
                  <div className="pt-4">
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code promo
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Entrez votre code"
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-r-md font-medium transition-colors"
                      >
                        Appliquer
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Saisissez un code promo du site ou d'un vendeur
                    </p>
                  </div>
                  
                  {/* Bouton de paiement */}
                  <div className="mt-8">
                    <button
                      onClick={proceedToCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-md font-medium transition-colors"
                    >
                      Passer la commande
                    </button>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="pt-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Livraison gratuite à partir de 30 DT d'achat
                    </p>
                    <p className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Paiement sécurisé
                    </p>
                    <p className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Retours gratuits sous 30 jours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Panier vide
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore ajouté de produits à votre panier. Parcourez notre catalogue pour trouver ce dont vous avez besoin.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Découvrir nos produits
            </Link>
          </div>
        )}
        
        {/* Aide et FAQ */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Besoin d'aide ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Livraison</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Livraison gratuite à partir de 30 DT d'achat. Délai de livraison estimé : 2-4 jours ouvrables.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Retours</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Retours gratuits sous 30 jours. Les articles doivent être non utilisés et dans leur emballage d'origine.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Contact</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notre service client est disponible du lundi au vendredi de 9h à 18h au +216 94 914 886.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog />
    </div>
  );
}
