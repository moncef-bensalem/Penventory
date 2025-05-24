'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Vérifier que product est un objet valide
  if (!product || typeof product !== 'object') {
    return null; // Ne pas rendre quoi que ce soit si le produit n'est pas valide
  }
  
  // Vérifier si le produit est déjà dans les favoris au chargement du composant
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isProductInWishlist = wishlist.some(item => item.id === product.id);
      setIsFavorite(isProductInWishlist);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  }, [product.id]);

  // Fonction pour gérer l'ajout aux favoris
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Récupérer la liste actuelle des favoris
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      // Vérifier si le produit est déjà dans les favoris
      const existingIndex = wishlist.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Si le produit est déjà dans les favoris, le supprimer
        wishlist.splice(existingIndex, 1);
        setIsFavorite(false);
      } else {
        // Sinon, ajouter le produit aux favoris
        wishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          salePrice: product.discount ? product.price * (1 - product.discount / 100) : null,
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
          slug: product.slug || product.id,
          brand: product.brand || '',
          inStock: product.stock > 0
        });
        setIsFavorite(true);
      }
      
      // Sauvegarder la liste mise à jour dans le localStorage
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Déclencher un événement de stockage pour mettre à jour d'autres onglets
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
    }
  };
  
  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Utiliser une image placeholder si l'image du produit n'est pas disponible
  const getImageUrl = (src) => {
    if (!src || typeof src !== 'string' || src.startsWith('/')) {
      return `https://placehold.co/600x600/orange/white?text=${encodeURIComponent(typeof product.name === 'string' ? product.name : 'Produit')}`;
    }
    return src;
  };
  
  // S'assurer que images est un tableau
  const images = Array.isArray(product.images) ? product.images : [];
  
  // Extraire des valeurs sécurisées
  const productId = product.id || '';
  const name = typeof product.name === 'string' ? product.name : 'Produit sans nom';
  const discount = Number(product.discount) || 0;
  const isNew = Boolean(product.isNew);
  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;
  const rating = Number(product.rating) || 0;
  const reviewCount = Number(product.reviewCount) || 0;
  const brand = typeof product.brand === 'string' ? product.brand : '';

  return (
    <Link href={`/products/${productId}`}>
      <div 
        className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={getImageUrl(isHovered && images.length > 1 ? images[1] : images[0])}
            alt={name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
          />
          
          {/* Badge de réduction */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full transform -rotate-12 shadow-lg">
              -{discount}%
            </div>
          )}
          
          {/* Badge de nouveau produit */}
          {isNew && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg animate-pulse">
              Nouveau
            </div>
          )}
          
          {/* Bouton favoris */}
          <button 
            onClick={handleToggleFavorite}
            className={`absolute top-2 ${isNew ? 'right-20' : 'right-2'} p-2 rounded-full transform hover:scale-110 transition-all duration-300 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
            } shadow-lg backdrop-blur-sm`}
            aria-label="Ajouter aux favoris"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          {/* Informations du vendeur */}
          {product.store && typeof product.store === 'object' && product.store.name && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs px-3 py-1 rounded-full shadow-lg transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
              <span className="font-medium">{typeof product.store.name === 'string' ? product.store.name : 'Vendeur'}</span>
            </div>
          )}
          
          {/* Actions rapides */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-full font-medium text-sm transition-colors transform hover:scale-105 duration-300 flex items-center justify-center shadow-lg"
              disabled={stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          {/* Notation */}
          <div className="flex items-center mb-2">
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 text-sm font-medium text-yellow-700 dark:text-yellow-500">{rating.toFixed(1)}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-xs text-gray-500 hover:text-gray-700 transition-colors">{reviewCount} avis</span>
          </div>
          
          {/* Nom et marque */}
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">{name}</h3>
          {brand && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors">{brand}</p>}
          
          {/* Prix et stock */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              {discount > 0 ? (
                <>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-500">{(price * (1 - discount / 100)).toFixed(2)} DT</span>
                  <span className="ml-2 text-sm text-gray-500 line-through">{price.toFixed(2)} DT</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900 dark:text-white">{price.toFixed(2)} DT</span>
              )}
            </div>
            {stock <= 5 && stock > 0 ? (
              <span className="text-xs text-orange-600 font-medium bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">Plus que {stock}</span>
            ) : stock === 0 ? (
              <span className="text-xs text-red-600 font-medium bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">Rupture</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
