'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useConfirmation } from '@/hooks/use-confirmation';

export default function WishlistPage() {
  const { t } = useLanguage();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openConfirmation, ConfirmationDialog } = useConfirmation();

  useEffect(() => {
    // Récupérer les favoris depuis le localStorage
    const loadWishlist = () => {
      setIsLoading(true);
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistItems(wishlist);
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        toast.error(t('wishlistLoadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'wishlist') {
        loadWishlist();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [t]);

  // Fonction pour supprimer un article des favoris
  const removeFromWishlist = (productId) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      toast.success(t('wishlistItemRemoved'));
      
      // Déclencher un événement de stockage pour mettre à jour d'autres onglets
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit des favoris:', error);
      toast.error(t('wishlistRemoveError'));
    }
  };

  // Fonction pour ajouter un article au panier
  const addToCart = (product) => {
    try {
      // Récupérer le panier actuel
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Vérifier si le produit est déjà dans le panier
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Si le produit existe déjà, augmenter la quantité
        cart[existingItemIndex].quantity += 1;
      } else {
        // Sinon, ajouter le produit avec une quantité de 1
        cart.push({
          ...product,
          quantity: 1
        });
      }
      
      // Sauvegarder le panier mis à jour
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Afficher un message de succès
      toast.success(t('addedToCart'));
      
      // Déclencher un événement de stockage pour mettre à jour le compteur du panier
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error(t('addToCartError'));
    }
  };

  // Fonction pour vider la liste de favoris
  const clearWishlist = () => {
    openConfirmation({
      title: t('clearWishlistTitle') || "Vider la liste de souhaits",
      message: t('confirmClearWishlist') || "Êtes-vous sûr de vouloir vider votre liste de souhaits ? Tous les articles seront supprimés.",
      confirmText: t('clearButton') || "Vider",
      cancelText: t('cancelButton') || "Annuler",
      type: "warning",
      onConfirm: () => {
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistItems([]);
        toast.success(t('wishlistCleared'));
        
        // Déclencher un événement de stockage pour mettre à jour d'autres onglets
        window.dispatchEvent(new Event('storage'));
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myWishlist')}</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('emptyWishlist')}</h2>
          <p className="text-gray-600 mb-6">{t('emptyWishlistMessage')}</p>
          <Link 
            href="/products" 
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{wishlistItems.length} {wishlistItems.length === 1 ? t('item') : t('items')}</p>
            <button
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('clearWishlist')}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('product')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('price')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wishlistItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 relative">
                          <Image
                            src={item.image || '/images/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="ml-4">
                          <Link href={`/products/${item.slug || item.id}`} className="text-sm font-medium text-gray-900 hover:text-orange-600">
                            {item.name}
                          </Link>
                          {item.brand && (
                            <p className="text-xs text-gray-500">{item.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.price ? (
                          <>
                            {item.salePrice && (
                              <span className="line-through text-gray-400 mr-2">
                                {item.price.toFixed(2)} {t('currency')}
                              </span>
                            )}
                            <span className={item.salePrice ? 'text-red-600' : ''}>
                              {(item.salePrice || item.price).toFixed(2)} {t('currency')}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">{t('priceUnavailable')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.inStock ? t('inStock') : t('outOfStock')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                          className={`p-2 rounded-full ${
                            item.inStock 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={item.inStock ? t('addToCart') : t('outOfStock')}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title={t('removeFromWishlist')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Link 
              href="/products" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
            >
              ← {t('continueShopping')}
            </Link>
            <Link 
              href="/cart" 
              className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {t('viewCart')}
            </Link>
          </div>
        </>
      )}
      <ConfirmationDialog />
    </div>
  );
}
