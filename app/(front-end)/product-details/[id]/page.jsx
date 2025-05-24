'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Heart, Share2, ChevronRight } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Essayer d'appeler l'API réelle pour récupérer le produit
        try {
          const response = await fetch(`/api/products/${id}`);
          
          if (response.ok) {
            const data = await response.json();
            
            // Vérifier que les données sont valides
            if (data && data.id) {
              // S'assurer que toutes les propriétés nécessaires sont présentes
              const cleanedProduct = {
                id: data.id,
                name: data.name || 'Produit sans nom',
                brand: data.brand || '',
                price: typeof data.price === 'number' ? data.price : 0,
                discount: typeof data.discount === 'number' ? data.discount : 0,
                rating: typeof data.rating === 'number' ? data.rating : 4.5,
                reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
                stock: typeof data.stock === 'number' ? data.stock : 0,
                description: data.description || 'Aucune description disponible',
                features: Array.isArray(data.features) ? data.features : [],
                images: Array.isArray(data.images) ? data.images : 
                       (data.images ? [data.images] : 
                       ['https://placehold.co/600x600/orange/white?text=Image%20non%20disponible']),
                category: typeof data.category === 'object' ? data.category : 
                          (typeof data.category === 'string' ? { name: data.category } : { name: 'Non catégorisé' }),
                seller: typeof data.seller === 'object' ? data.seller : 
                        (data.store ? data.store : { name: 'Vendeur inconnu' }),
                isNew: Boolean(data.isNew),
                educationLevel: data.educationLevel || '',
                inSchoolLists: Array.isArray(data.inSchoolLists) ? data.inSchoolLists : []
              };
              
              setProduct(cleanedProduct);
              
              // Essayer de récupérer des produits associés
              try {
                // ... code de récupération des produits associés ...
                const categoryId = cleanedProduct.category?.id;
                const storeId = cleanedProduct.seller?.id || cleanedProduct.store?.id;
                
                if (categoryId || storeId) {
                  const params = new URLSearchParams();
                  if (categoryId) params.append('categoryId', categoryId);
                  if (storeId) params.append('storeId', storeId);
                  params.append('limit', '3');
                  params.append('excludeId', id);
                  
                  const relatedResponse = await fetch(`/api/products?${params.toString()}`);
                  if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();
                    
                    if (relatedData.products && Array.isArray(relatedData.products)) {
                      setRelatedProducts(relatedData.products);
                    }
                  }
                }
              } catch (relatedError) {
                console.error('Erreur lors de la récupération des produits associés:', relatedError);
                // Ne pas bloquer l'affichage du produit principal
              }
              
              setLoading(false);
              return; // Sortir de la fonction si l'API a fonctionné
            }
          }
        } catch (apiError) {
          console.error('Erreur API:', apiError);
          // Continuer avec les données mockées en cas d'erreur
        }
        
        // Fallback sur les données mockées si l'API a échoué
        console.log('Utilisation des données mockées pour le produit:', id);
        
        // Produit fictif basé sur l'ID
        const mockProduct = {
          id: parseInt(id),
          name: 'Cahier Oxford 96 pages',
          brand: 'Oxford',
          price: 3.99,
          discount: 0,
          rating: 4.8,
          reviewCount: 156,
          stock: 42,
          description: `Cahier de qualité supérieure avec papier Optik Paper 90g/m². Format A4 (21 x 29,7 cm). 96 pages avec grands carreaux Seyes. Couverture en polypropylène résistante. Idéal pour les élèves du collège et du lycée.`,
          features: [
            'Format A4 (21 x 29,7 cm)',
            'Papier Optik Paper 90g/m²',
            '96 pages',
            'Grands carreaux Seyes',
            'Couverture en polypropylène',
            'Reliure agrafée'
          ],
          images: [
            'https://placehold.co/600x600/orange/white?text=Cahier%20Oxford%201',
            'https://placehold.co/600x600/orange/white?text=Cahier%20Oxford%202',
            'https://placehold.co/600x600/orange/white?text=Cahier%20Oxford%203',
            'https://placehold.co/600x600/orange/white?text=Cahier%20Oxford%204'
          ],
          category: { id: 'cahiers', name: 'Cahiers' },
          seller: { 
            id: 1, 
            name: 'Librairie Centrale',
            rating: 4.7,
            reviewCount: 324,
            products: 156
          },
          isNew: true,
          educationLevel: 'Collège',
          inSchoolLists: ['Collège - 6ème', 'Collège - 5ème']
        };
        
        setProduct(mockProduct);
        
        // Produits similaires fictifs
        const mockRelatedProducts = [
          {
            id: 101,
            name: 'Cahier Oxford 48 pages',
            brand: 'Oxford',
            price: 2.49,
            discount: 0,
            rating: 4.6,
            reviewCount: 89,
            stock: 56,
            images: ['https://placehold.co/600x600/orange/white?text=Cahier%20Oxford%2048p'],
            category: { id: 'cahiers', name: 'Cahiers' },
            seller: { id: 1, name: 'Librairie Centrale' }
          },
          {
            id: 102,
            name: 'Cahier Clairefontaine 96 pages',
            brand: 'Clairefontaine',
            price: 3.79,
            discount: 5,
            rating: 4.7,
            reviewCount: 112,
            stock: 38,
            images: ['https://placehold.co/600x600/orange/white?text=Cahier%20Clairefontaine'],
            category: { id: 'cahiers', name: 'Cahiers' },
            seller: { id: 2, name: 'Papeterie Express' }
          },
          {
            id: 103,
            name: 'Cahier à spirale Oxford 120 pages',
            brand: 'Oxford',
            price: 4.99,
            discount: 0,
            rating: 4.9,
            reviewCount: 76,
            stock: 23,
            images: ['https://placehold.co/600x600/orange/white?text=Cahier%20Spirale%20Oxford'],
            category: { id: 'cahiers', name: 'Cahiers' },
            seller: { id: 1, name: 'Librairie Centrale' }
          }
        ];
        
        setRelatedProducts(mockRelatedProducts);
        setLoading(false);
        
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = () => {
    if (!product) return;
    
    // Récupérer le panier actuel du localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Vérifier si le produit est déjà dans le panier
    const existingProductIndex = currentCart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Si le produit existe déjà, augmenter la quantité
      currentCart[existingProductIndex].quantity += quantity;
    } else {
      // Sinon, ajouter le produit avec la quantité spécifiée
      currentCart.push({
        ...product,
        quantity
      });
    }
    
    // Sauvegarder le panier mis à jour
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Déclencher un événement pour mettre à jour le compteur du panier dans la navigation
    window.dispatchEvent(new Event('storage'));
    
    // Afficher une notification (à implémenter)
    alert(`${product.name} ajouté au panier (${quantity} exemplaire${quantity > 1 ? 's' : ''})`);
  };
  
  // Fonction pour gérer l'ajout aux favoris
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Ici, vous pourriez implémenter la logique pour sauvegarder les favoris
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="md:w-1/2 space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Fil d'Ariane */}
        <nav className="flex items-center text-sm mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link href="/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Produits
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          {product.category && (
            <>
              <Link 
                href={`/products?category=${encodeURIComponent(typeof product.category === 'object' ? product.category.id || product.category.name : product.category)}`} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {typeof product.category === 'object' ? product.category.name : product.category}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            </>
          )}
          <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>
        </nav>
        
        {/* Détails du produit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Galerie d'images */}
            <div className="md:w-1/2 p-6">
              <div className="relative aspect-square mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Nouveau
                  </div>
                )}
              </div>
              
              {/* Miniatures */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImage === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Informations produit */}
            <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
              {/* En-tête produit */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Marque: <span className="font-medium">{product.brand}</span></p>
                
                {/* Notation */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <Link href="#reviews" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                    {product.reviewCount} avis
                  </Link>
                  <span className="mx-2 text-gray-300">•</span>
                  <Link href={`/seller/${product.seller.id}`} className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
                    Vendu par {product.seller.name}
                  </Link>
                </div>
                
                {/* Prix */}
                <div className="mb-4">
                  {product.discount > 0 ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(product.price * (1 - product.discount / 100)).toFixed(2)} DT
                      </span>
                      <span className="ml-2 text-sm text-gray-500 line-through">{product.price.toFixed(2)} DT</span>
                      <span className="ml-2 text-sm text-red-500 font-medium">Économisez {(product.price * product.discount / 100).toFixed(2)} DT</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{product.price.toFixed(2)} DT</span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">TVA incluse</p>
                </div>
                
                {/* Disponibilité */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <p className="text-green-600 font-medium flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                      En stock
                      {product.stock <= 5 && (
                        <span className="ml-2 text-orange-600">
                          (Plus que {product.stock} disponible{product.stock > 1 ? 's' : ''})
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-red-600 font-medium flex items-center">
                      <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                      Rupture de stock
                    </p>
                  )}
                </div>
                
                {/* Sélecteur de quantité et boutons d'action */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <label htmlFor="quantity" className="mr-4 text-gray-700 dark:text-gray-300 font-medium">Quantité:</label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-gray-800 dark:text-gray-200 font-medium min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Ajouter au panier
                    </button>
                    
                    <button 
                      onClick={handleToggleFavorite}
                      className={`p-3 rounded-md border ${
                        isFavorite 
                          ? 'bg-red-50 border-red-200 text-red-500 dark:bg-gray-800 dark:border-red-800'
                          : 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button className="p-3 rounded-md border bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Informations supplémentaires */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                {/* Livraison */}
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Livraison</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Livraison standard gratuite à partir de 30€ d'achat.
                      <br />
                      Livraison estimée: 2-4 jours ouvrables.
                    </p>
                  </div>
                </div>
                
                {/* Garantie */}
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Garantie</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Satisfait ou remboursé sous 30 jours.
                    </p>
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
                <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
              </div>
            </div>
            
            {/* Caractéristiques - affichées seulement si disponibles */}
            {Array.isArray(product.features) && product.features.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Caractéristiques</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Listes scolaires - affichées seulement si disponibles */}
            {product.inSchoolLists && Array.isArray(product.inSchoolLists) && product.inSchoolLists.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Inclus dans les listes scolaires:</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    {product.inSchoolLists.map((list, index) => (
                      <li key={index}>
                        <Link href={`/school-lists/${encodeURIComponent(list)}`} className="hover:underline">
                          {list}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Informations sur le vendeur */}
            {product.seller && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">À propos du vendeur</h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{product.seller.name}</h3>
                      <div className="flex items-center mt-1">
                        {product.seller.rating && (
                          <>
                            <div className="flex items-center text-yellow-400">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{product.seller.rating}</span>
                            </div>
                            <span className="mx-2 text-gray-300">•</span>
                          </>
                        )}
                        {product.seller.reviewCount && (
                          <>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{product.seller.reviewCount} avis</span>
                            <span className="mx-2 text-gray-300">•</span>
                          </>
                        )}
                        {product.seller.products && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">{product.seller.products} produits</span>
                        )}
                      </div>
                    </div>
                    {product.seller.id && (
                      <Link 
                        href={`/seller/${product.seller.id}`}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        Voir la boutique
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Produits similaires</h2>
              {product.category && (
                <Link 
                  href={`/products?category=${encodeURIComponent(typeof product.category === 'object' ? product.category.id || product.category.name : product.category)}`}
                  className="text-orange-600 hover:text-orange-700 flex items-center text-sm font-medium"
                >
                  Voir plus
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id}
                  href={`/product-details/${relatedProduct.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0 
                          ? relatedProduct.images[0] 
                          : (typeof relatedProduct.images === 'string' ? relatedProduct.images : 'https://placehold.co/600x600/orange/white?text=Image%20non%20disponible')}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                    {relatedProduct.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{relatedProduct.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{relatedProduct.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{relatedProduct.brand}</p>
                    <div className="flex items-center justify-between">
                      {relatedProduct.discount > 0 ? (
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {(relatedProduct.price * (1 - relatedProduct.discount / 100)).toFixed(2)} DT
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through">{relatedProduct.price.toFixed(2)} DT</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{relatedProduct.price.toFixed(2)} DT</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
