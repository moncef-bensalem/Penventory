'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Heart, Share2, ChevronRight } from 'lucide-react';
import { useConfirmation } from '@/hooks/use-confirmation';
import { X } from 'lucide-react';

// Composant d'alerte personnalisé pour l'ajout au panier
function CartAlert({ onClose, onViewCart, onContinueShopping }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300">
      <div className="relative w-full max-w-md p-6 mx-auto rounded-xl shadow-xl bg-white border border-gray-200 transition-all duration-300">
        {/* Effet de brillance */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute -inset-x-40 -inset-y-40 bg-gradient-to-r from-transparent via-orange-50/10 to-transparent transform rotate-45 animate-shimmer"></div>
        </div>
        
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-50 text-green-500">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Produit ajouté au panier</h3>
        </div>
        
        <p className="mt-4 text-gray-700">Votre produit a été ajouté au panier avec succès!</p>
        
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onContinueShopping}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Continuer mes achats
          </button>
          <button
            onClick={onViewCart}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
             Voir le panier
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { productId } = params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showCartAlert, setShowCartAlert] = useState(false);
  const { openConfirmation, ConfirmationDialog } = useConfirmation();
  
  // Fonction pour générer une clé sécurisée
  const safeKey = (prefix, value) => {
    if (value === null || value === undefined) return `${prefix}-null-${Math.random().toString(36).substr(2, 9)}`;
    if (typeof value === 'string') return `${prefix}-str-${value}`;
    if (typeof value === 'number') return `${prefix}-num-${value}`;
    if (typeof value === 'object') {
      // Pour les objets, utiliser JSON.stringify mais éviter les erreurs de circularité
      try {
        const objStr = JSON.stringify(value);
        // Utiliser un hash simple pour éviter des clés trop longues
        const hash = Array.from(objStr).reduce((acc, char) => {
          return ((acc << 5) - acc) + char.charCodeAt(0) >>> 0;
        }, 0);
        return `${prefix}-obj-${hash}`;
      } catch (e) {
        // En cas d'erreur (e.g., objet circulaire), utiliser un ID aléatoire
        return `${prefix}-obj-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
    return `${prefix}-${String(value)}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // Fonctions utilitaires pour le rendu sécurisé
  const safeString = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return typeof value === 'string' ? value : String(value);
  };
  
  const safeNumber = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;
    return typeof value === 'number' ? value : Number(value) || fallback;
  };
  
  const safeArray = (value, fallback = []) => {
    if (Array.isArray(value)) return value;
    return fallback;
  };
  
  const safeObject = (value, fallback = {}) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    return fallback;
  };
  
  // Fonction pour vérifier et journaliser les objets problématiques
  const checkForInvalidObjects = (obj, path = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        console.log(`Objet potentiellement problématique: ${currentPath}`, value);
        
        // Continuez la vérification récursive
        checkForInvalidObjects(value, currentPath);
      }
    });
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null); // Réinitialiser l'erreur au début de chaque requête
        
        if (!productId) {
          setError('ID du produit manquant');
          return;
        }

        console.log('Fetching product with ID:', productId);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Debug pour trouver les problèmes potentiels
        console.log('Raw product data:', data);
        
        if (!data || !data.id) {
          throw new Error('Données du produit invalides');
        }

        // Création d'un objet produit nettoyé
        const cleanedProduct = {
          id: safeString(data.id),
          name: safeString(data.name, 'Produit sans nom'),
          description: safeString(data.description, 'Aucune description disponible'),
          price: safeNumber(data.price),
          discount: safeNumber(data.discount),
          rating: safeNumber(data.rating),
          reviewCount: safeNumber(data.reviewCount),
          stock: safeNumber(data.stock),
          images: safeArray(data.images, []).filter(img => typeof img === 'string'),
          features: safeArray(data.features, []).map(feature => 
            typeof feature === 'string' ? feature : JSON.stringify(feature)
          ),
          
          // Nouveaux champs
          barcode: safeString(data.barcode),
          isWholesale: !!data.isWholesale,
          wholesalePrice: safeNumber(data.wholesalePrice),
          wholesaleMinQty: safeNumber(data.wholesaleMinQty),
          isActive: data.isActive !== undefined ? !!data.isActive : true,
          
          // Attributs produit
          brand: safeString(data.brand),
          color: safeString(data.color),
          material: safeString(data.material),
          size: safeString(data.size),
          
          // Options pour produits papier
          dimensions: safeString(data.dimensions),
          pages: safeNumber(data.pages),
          
          // Options pour livres
          level: safeString(data.level),
          collection: safeString(data.collection),
          author: safeString(data.author),
          language: safeString(data.language),
          
          sku: safeString(data.sku),
          isNew: !!data.isNew,
          category: data.category ? {
            id: safeString(data.category.id, ''),
            name: safeString(data.category.name, 'Non catégorisé')
          } : { id: '', name: 'Non catégorisé' },
          store: data.store ? {
            id: safeString(data.store.id, ''),
            name: safeString(data.store.name, 'Magasin inconnu'),
            owner: data.store.owner ? {
              id: safeString(data.store.owner.id, ''),
              name: safeString(data.store.owner.name, ''),
              email: safeString(data.store.owner.email, ''),
              image: safeString(data.store.owner.image, '')
            } : null
          } : { id: '', name: 'Magasin inconnu' }
        };
        
        console.log('Cleaned product data:', cleanedProduct);
        setProduct(cleanedProduct);
        
        // Traiter les produits similaires
        if (data.similarProducts && Array.isArray(data.similarProducts)) {
          console.log('Similar products data:', data.similarProducts);
          
          const processedProducts = data.similarProducts
            .filter(p => p && p.id)
            .map(p => ({
              id: safeString(p.id),
              name: safeString(p.name, 'Produit similaire'),
              price: safeNumber(p.price),
              discount: safeNumber(p.discount),
              images: safeArray(p.images, []),
              store: p.store ? {
                name: safeString(p.store.name),
                logo: safeString(p.store.logo)
              } : null
            }));
          
          setRelatedProducts(processedProducts);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        setError(error.message || 'Une erreur est survenue lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = () => {
    if (!product) return;
    
    // Vérifier si la quantité demandée est disponible en stock
    if (quantity > product.stock) {
      openConfirmation({
        title: "Stock insuffisant",
        message: `Désolé, il n'y a que ${product.stock} exemplaire${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''} en stock.`,
        confirmText: "OK",
        type: "danger"
      });
      return;
    }
    
    // Vérifier les options de vente en gros
    let priceToUse = product.price;
    let isWholesaleOrder = false;
    
    // Si le produit a des options de vente en gros et que la quantité est suffisante
    if (product.isWholesale && product.wholesaleMinQty && product.wholesalePrice && quantity >= product.wholesaleMinQty) {
      priceToUse = product.wholesalePrice;
      isWholesaleOrder = true;
    }
    
    // Calcul du prix final avec remise
    let finalPrice = priceToUse;
    if (product.discount && product.discount > 0) {
      finalPrice = priceToUse * (1 - product.discount / 100);
    }
    
    // Message d'ajout au panier avec information sur le prix
    let message = `Voulez-vous ajouter ${product.name} au panier (${quantity} exemplaire${quantity > 1 ? 's' : ''}) ?`;
    
    // Ajouter des informations sur le prix spécial si applicable
    if (isWholesaleOrder) {
      message += `\n\nVous bénéficiez du prix de gros : ${finalPrice.toFixed(2)} DT par unité.`;
    } else if (product.discount && product.discount > 0) {
      message += `\n\nPrix après remise : ${finalPrice.toFixed(2)} DT par unité.`;
    }
    
    openConfirmation({
      title: "Ajouter au panier",
      message: message,
      confirmText: "Ajouter au panier",
      cancelText: "Annuler",
      type: "info",
      onConfirm: () => {
        // Debug pour vérifier les valeurs
        console.log('Ajout au panier - Product:', product);
        
        // Extraire uniquement les propriétés nécessaires pour le panier
        const cartProduct = {
          id: product.id,
          name: product.name,
          price: priceToUse, // Utiliser le prix approprié (normal ou gros)
          discount: product.discount,
          isWholesale: isWholesaleOrder,
          wholesalePrice: product.wholesalePrice,
          wholesaleMinQty: product.wholesaleMinQty,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          quantity: quantity,
          stock: product.stock, // Ajouter le stock pour les vérifications futures
          barcode: product.barcode || null,
          store: product.store ? {
            id: product.store.id,
            name: product.store.name
          } : null
        };
        
        // Récupérer le panier actuel du localStorage
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Vérifier si le produit est déjà dans le panier
        const existingProductIndex = currentCart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex >= 0) {
          // Vérifier que la nouvelle quantité totale ne dépasse pas le stock disponible
          const newQuantity = currentCart[existingProductIndex].quantity + quantity;
          
          if (newQuantity > product.stock) {
            openConfirmation({
              title: "Stock insuffisant",
              message: `Désolé, vous avez déjà ${currentCart[existingProductIndex].quantity} exemplaire${currentCart[existingProductIndex].quantity > 1 ? 's' : ''} dans votre panier et il n'y a que ${product.stock} exemplaire${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''} en stock.`,
              confirmText: "OK",
              type: "danger"
            });
            return;
          }
          
          // Si le produit existe déjà et qu'il y a assez de stock, augmenter la quantité
          currentCart[existingProductIndex].quantity = newQuantity;
          
          // Mettre à jour les informations de vente en gros si nécessaire
          if (isWholesaleOrder && newQuantity >= product.wholesaleMinQty) {
            currentCart[existingProductIndex].isWholesale = true;
            currentCart[existingProductIndex].price = product.wholesalePrice;
          }
        } else {
          // Sinon, ajouter le produit
          currentCart.push(cartProduct);
        }
        
        // Sauvegarder le panier mis à jour
        localStorage.setItem('cart', JSON.stringify(currentCart));
        console.log('Panier mis à jour:', currentCart);
        
        // Déclencher un événement pour mettre à jour le compteur du panier
        window.dispatchEvent(new Event('storage'));
        
        // Afficher l'alerte personnalisée avec les deux options
        setShowCartAlert(true);
      }
    });
  };
  
  // Fonction pour gérer l'ajout aux favoris
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Ici, vous pourriez implémenter la logique pour sauvegarder les favoris
  };
  
  // Fonction pour ajouter un produit similaire au panier
  const handleAddRelatedToCart = async (relatedProductId) => {
    try {
      // Vérifier que l'ID est une chaîne valide
      if (!relatedProductId || typeof relatedProductId !== 'string') {
        console.error('ID de produit invalide:', relatedProductId);
        openConfirmation({
          title: "Erreur",
          message: "ID de produit invalide",
          confirmText: "OK",
          type: "danger"
        });
        return;
      }
      
      console.log('Adding related product to cart:', relatedProductId);
      const response = await fetch(`/api/products/${relatedProductId}`);
      
      if (!response.ok) throw new Error(`Erreur: ${response.status}`);
      
      const productData = await response.json();
      
      // Vérifier que les données sont valides
      if (!productData || !productData.id) {
        throw new Error('Données de produit invalides');
      }
      
      // Vérifier si le produit est en stock
      const stock = safeNumber(productData.stock, 0);
      if (stock <= 0) {
        openConfirmation({
          title: "Produit indisponible",
          message: "Désolé, ce produit n'est plus disponible en stock.",
          confirmText: "OK",
          type: "danger"
        });
        return;
      }
      
      // Créer un objet simple pour le panier
      const cartProduct = {
        id: safeString(productData.id),
        name: safeString(productData.name, 'Produit'),
        price: safeNumber(productData.price),
        discount: safeNumber(productData.discount),
        image: Array.isArray(productData.images) && productData.images.length > 0 ? 
          productData.images[0] : null,
        quantity: 1,
        stock: stock, // Ajouter le stock pour les vérifications futures
        store: productData.store ? {
          id: safeString(productData.store.id),
          name: safeString(productData.store.name)
        } : null
      };
      
      // Récupérer le panier actuel pour vérifier la quantité existante
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProductIndex = currentCart.findIndex(item => item.id === cartProduct.id);
      
      // Vérifier si l'ajout dépasserait le stock disponible
      if (existingProductIndex >= 0) {
        const currentQuantity = currentCart[existingProductIndex].quantity;
        if (currentQuantity >= stock) {
          openConfirmation({
            title: "Stock insuffisant",
            message: `Désolé, vous avez déjà ${currentQuantity} exemplaire${currentQuantity > 1 ? 's' : ''} dans votre panier et il n'y a que ${stock} exemplaire${stock > 1 ? 's' : ''} disponible${stock > 1 ? 's' : ''} en stock.`,
            confirmText: "OK",
            type: "danger"
          });
          return;
        }
      }
      
      openConfirmation({
        title: "Ajouter au panier",
        message: `Voulez-vous ajouter ${cartProduct.name} au panier ?`,
        confirmText: "Ajouter au panier",
        cancelText: "Annuler",
        type: "info",
        onConfirm: () => {
          // Vérifier si le produit est déjà dans le panier
          if (existingProductIndex >= 0) {
            // Si le produit existe déjà, augmenter la quantité de 1
            currentCart[existingProductIndex].quantity += 1;
          } else {
            // Sinon, ajouter le produit
            currentCart.push(cartProduct);
          }
          
          // Sauvegarder le panier mis à jour
          localStorage.setItem('cart', JSON.stringify(currentCart));
          
          // Déclencher un événement pour mettre à jour le compteur du panier
          window.dispatchEvent(new Event('storage'));
          
          // Afficher l'alerte personnalisée avec les deux options
          setShowCartAlert(true);
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      openConfirmation({
        title: "Erreur",
        message: "Erreur lors de l'ajout au panier. Veuillez réessayer.",
        confirmText: "OK",
        type: "danger"
      });
    }
  };
  
  // Fonction pour rendre les images de manière sécurisée
  const renderImage = (imageUrl, alt, className = '', priority = false) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Image non disponible</span>
        </div>
      );
    }
    
    try {
      return (
        <Image
          src={imageUrl}
          alt={alt || 'Image de produit'}
          fill
          className={`object-cover ${className}`}
          priority={priority}
        />
      );
    } catch (error) {
      console.error('Erreur lors du rendu de l\'image:', error);
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Erreur de chargement</span>
        </div>
      );
    }
  };
  
  // Si une erreur se produit, afficher un message d'erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Erreur de chargement</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center mr-4"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push('/products')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }
  
  // État de chargement
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[...Array(4)].map((_, index) => (
                  <div key={safeKey('thumb-skeleton', index)} className="aspect-square bg-gray-300 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <ConfirmationDialog />
      </div>
    );
  }
  
  // Si le produit n'est pas trouvé
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Produit non trouvé</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nous n'avons pas pu trouver le produit que vous recherchez.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }
  
  // Rendu principal de la page produit
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Fil d'Ariane */}
        <nav className="flex items-center text-sm font-medium">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link href="/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Produits
          </Link>
          {product.category && product.category.id && (
            <>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <Link 
                href={`/products?category=${product.category.id}`} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {typeof product.category.name === 'string' ? product.category.name : 'Catégorie'}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {typeof product.name === 'string' ? product.name : 'Produit'}
          </span>
        </nav>
        
        {/* Détails du produit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Galerie d'images */}
              <div className="md:w-1/2">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    renderImage(product.images[selectedImageIndex], product.name, 'hover:scale-105 transition-transform', true)
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400">Image non disponible</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.discount > 0 && (
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Nouveau
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Miniatures des images */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.images.map((image, index) => {
                      // S'assurer que l'image est une chaîne valide
                      if (typeof image !== 'string') return null;
                      
                      return (
                        <button
                          key={`thumb-${index}-${Math.random().toString(36).substr(2, 5)}`}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded border-2 overflow-hidden ${
                            selectedImageIndex === index 
                              ? 'border-orange-500 dark:border-orange-600' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          {renderImage(image, `${product.name} - image ${index + 1}`)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Informations du produit */}
              <div className="md:w-1/2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                
                {product.brand && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Marque: <span className="font-medium">{product.brand}</span>
                  </p>
                )}
                
                {/* Catégorie */}
                {product.category && product.category.name && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Catégorie: <span className="font-medium">{product.category.name}</span>
                  </p>
                )}
                
                {/* Notes et avis */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {product.rating > 0 ? product.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  
                  {product.reviewCount > 0 && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <Link href="#reviews" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                        {product.reviewCount} avis
                      </Link>
                    </>
                  )}
                  
                  {product.store && product.store.name && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <Link 
                        href={`/store/${product.store.id}`} 
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Vendu par {product.store.name}
                      </Link>
                    </>
                  )}
                </div>
                
                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-baseline">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {((product.price * (100 - product.discount)) / 100).toFixed(2)} DT
                            </span>
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {product.price.toFixed(2)} DT
                            </span>
                            <span className="ml-2 text-sm font-medium text-red-600">
                              (-{product.discount}%)
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.price.toFixed(2)} DT
                          </span>
                        )}
                      </div>
                      
                      {/* Options de vente en gros */}
                      {product.isWholesale && product.wholesalePrice && product.wholesaleMinQty && (
                        <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                          <Truck className="h-4 w-4 mr-1" />
                          <span>
                            Prix de gros: <strong>{product.wholesalePrice.toFixed(2)} DT</strong> (min. {product.wholesaleMinQty} unités)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {/* Stock */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-medium">
                          En stock ({product.stock} disponibles)
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Rupture de stock
                        </span>
                      )}
                    </p>
                    
                    {/* Code-barres */}
                    {product.barcode && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Code-barres: <span className="font-mono">{product.barcode}</span>
                      </p>
                    )}
                    
                    {/* Status */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: 
                      <span className={product.isActive ? "text-green-600 font-medium ml-1" : "text-red-600 font-medium ml-1"}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Attributs du produit */}
                <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Attributs du produit</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.brand && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Marque:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.brand}</span>
                      </div>
                    )}
                    
                    {product.color && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Couleur:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.color}</span>
                      </div>
                    )}
                    
                    {product.material && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Matériau:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.material}</span>
                      </div>
                    )}
                    
                    {product.size && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Taille:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.size}</span>
                      </div>
                    )}
                    
                    {product.dimensions && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Dimensions:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.dimensions}</span>
                      </div>
                    )}
                    
                    {product.pages > 0 && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Pages:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.pages}</span>
                      </div>
                    )}
                    
                    {product.level && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Niveau:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.level}</span>
                      </div>
                    )}
                    
                    {product.collection && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Collection:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.collection}</span>
                      </div>
                    )}
                    
                    {product.author && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Auteur:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.author}</span>
                      </div>
                    )}
                    
                    {product.language && (
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">Langue:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{product.language}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Choix de quantité et boutons d'action */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                      Quantité:
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                      <button 
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-3 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                      >
                        -
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={product.stock > 0 ? product.stock : 1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                        className="w-12 px-2 py-1 text-center border-x border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                      />
                      <button 
                        onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Ajouter au panier
                    </button>
                    
                    <button
                      onClick={handleToggleFavorite}
                      className={`p-3 rounded-md border ${
                        isFavorite 
                          ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' 
                          : 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                      } hover:bg-opacity-80 transition-colors`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      className="p-3 rounded-md border bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-opacity-80 transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Livraison et garanties */}
                <div className="mt-8 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Livraison gratuite</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pour les commandes supérieures à 50€</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Garantie de remboursement</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Retours sous 30 jours sans frais</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description et caractéristiques */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <div className="prose prose-orange dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">
                {/* Vérifier que la description est une chaîne valide */}
                {typeof product.description === 'string' ? product.description : 'Aucune description disponible'}
              </p>
            </div>
            
            {/* Caractéristiques */}
            {Array.isArray(product.features) && product.features.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Caractéristiques</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                  {product.features.map((feature, index) => {
                    // S'assurer que chaque caractéristique est une chaîne
                    const featureText = typeof feature === 'string' ? 
                      feature : 
                      (feature ? JSON.stringify(feature) : `Caractéristique ${index + 1}`);
                    
                    return (
                      <li 
                        key={`feature-${index}-${Math.random().toString(36).substr(2, 5)}`} 
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        {featureText}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            
            {/* Listes scolaires si disponibles */}
            {Array.isArray(product.schoolLists) && product.schoolLists.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Listes scolaires</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Ce produit est présent dans les listes scolaires suivantes:
                </p>
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                  {product.schoolLists.map((list, index) => {
                    // S'assurer que chaque élément de liste est une chaîne
                    const listText = typeof list === 'string' ? 
                      list : 
                      (list ? JSON.stringify(list) : `Liste ${index + 1}`);
                    
                    // Génération d'une clé vraiment unique pour chaque élément
                    const uniqueKey = `school-list-${index}-${Math.random().toString(36).substr(2, 5)}`;
                    
                    return (
                      <li key={uniqueKey}>
                        <Link 
                          href={`/school-lists/${encodeURIComponent(listText)}`} 
                          className="hover:underline"
                        >
                          {listText}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Produits similaires</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct, index) => {
              // Garantir que chaque produit a une clé unique et valide
              const itemKey = typeof relatedProduct.uniqueId === 'string' 
                ? relatedProduct.uniqueId 
                : `related-product-${index}-${Math.random().toString(36).substr(2, 9)}`;
              
              return (
                <div 
                  key={itemKey} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
                >
                  <Link 
                    href={`/products/${relatedProduct.id}`} 
                    className="block relative aspect-square bg-gray-100 dark:bg-gray-700"
                  >
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      renderImage(
                        relatedProduct.images[0],
                        relatedProduct.name,
                        "object-cover hover:scale-105 transition-transform"
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Aucune image
                      </div>
                    )}
                    {relatedProduct.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{relatedProduct.discount}%
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/products/${relatedProduct.id}`} className="block">
                      <h3 className="font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 line-clamp-2 mb-1">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    
                    {relatedProduct.brand && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {relatedProduct.brand}
                      </p>
                    )}
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center text-yellow-400 text-xs">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {relatedProduct.rating > 0 ? relatedProduct.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <span className="mx-2 text-gray-300 text-xs">•</span>
                      <span className="text-xs text-gray-500">
                        {relatedProduct.reviewCount || 0} avis
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        {relatedProduct.discount > 0 ? (
                          <div className="flex items-center">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {((relatedProduct.price * (100 - relatedProduct.discount)) / 100).toFixed(2)} DT
                            </span>
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {relatedProduct.price.toFixed(2)} DT
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-900 dark:text-white">
                            {relatedProduct.price.toFixed(2)} DT
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleAddRelatedToCart(relatedProduct.id)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ConfirmationDialog />
      
      {/* Alerte personnalisée pour l'ajout au panier */}
      {showCartAlert && (
        <CartAlert 
          onClose={() => setShowCartAlert(false)}
          onViewCart={() => {
            setShowCartAlert(false);
            router.push('/cart');
          }}
          onContinueShopping={() => {
            setShowCartAlert(false);
            router.push('/products');
          }}
        />
      )}
    </div>
  );
}