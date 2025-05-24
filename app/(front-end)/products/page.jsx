'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, X, ChevronDown, Grid3X3, List, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useConfirmation } from '@/hooks/use-confirmation';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialStore = searchParams.get('store') || '';
  
  // États pour les filtres et les produits
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStore, setSelectedStore] = useState(initialStore);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const { openConfirmation, ConfirmationDialog } = useConfirmation();
  
  // Fonction pour récupérer les produits avec les filtres appliqués
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStores();
  }, [searchQuery, selectedCategory, selectedStore, priceRange, selectedLevel, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }
      
      if (selectedStore) {
        params.append('storeId', selectedStore);
      }
      
      // Utiliser l'API des produits standard
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }
      
      const data = await response.json();
      
      // Récupérer les produits de la réponse
      let filteredProducts = data.products || [];
      
      // Filtrer par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.description?.toLowerCase().includes(query) ||
          product.category?.name?.toLowerCase().includes(query) ||
          product.store?.name?.toLowerCase().includes(query)
        );
      }
      
      // Filtrer par fourchette de prix
      filteredProducts = filteredProducts.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      
      // Trier les produits
      switch (sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popularity':
        default:
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
      }
      
      // Nettoyer les produits pour éviter les erreurs d'objets en enfants React
      const cleanedProducts = filteredProducts.map(product => ({
        ...product,
        id: product.id || Math.random().toString(36).substr(2, 9),
        productId: product.id || Math.random().toString(36).substr(2, 9), // Pour la clé unique
        name: typeof product.name === 'string' ? product.name : 'Produit sans nom',
        description: typeof product.description === 'string' ? product.description : '',
        price: Number(product.price) || 0,
        discount: Number(product.discount) || 0,
        rating: Number(product.rating) || 0,
        reviewCount: Number(product.reviewCount) || 0,
        stock: Number(product.stock) || 0,
        images: Array.isArray(product.images) ? product.images.filter(img => typeof img === 'string') : [],
        category: product.category ? {
          id: product.category.id || '',
          name: typeof product.category.name === 'string' ? product.category.name : 'Catégorie'
        } : null,
        store: product.store ? {
          id: product.store.id || '',
          name: typeof product.store.name === 'string' ? product.store.name : 'Magasin'
        } : null
      }));
      
      setProducts(cleanedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des catégories');
      }
      
      const data = await response.json();
      // Transformer les objets catégorie en objets simples avec id et name
      const processedCategories = (data || []).map(category => ({
        id: category.id || Math.random().toString(36).substr(2, 9),
        name: typeof category.name === 'string' ? category.name : 'Catégorie'
      }));
      setCategories(processedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des magasins');
      }
      
      const data = await response.json();
      // Transformer les objets magasin en objets simples avec id et name
      const processedStores = (data.stores || []).map(store => ({
        id: store.id || Math.random().toString(36).substr(2, 9),
        name: typeof store.name === 'string' ? store.name : 'Magasin'
      }));
      setStores(processedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };
  
  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = (product) => {
    openConfirmation({
      title: "Ajouter au panier",
      message: `Voulez-vous ajouter ${product.name} au panier ?`,
      confirmText: "Ajouter au panier",
      cancelText: "Annuler",
      type: "info",
      onConfirm: () => {
        // Récupérer le panier actuel du localStorage
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Vérifier si le produit est déjà dans le panier
        const existingProductIndex = currentCart.findIndex(item => item.id === product.id);
        
        if (existingProductIndex >= 0) {
          // Si le produit existe déjà, augmenter la quantité
          currentCart[existingProductIndex].quantity += 1;
        } else {
          // Sinon, ajouter le produit avec une quantité de 1
          currentCart.push({
            ...product,
            quantity: 1
          });
        }
        
        // Sauvegarder le panier mis à jour
        localStorage.setItem('cart', JSON.stringify(currentCart));
        
        // Déclencher un événement pour mettre à jour le compteur du panier dans la navigation
        window.dispatchEvent(new Event('storage'));
      }
    });
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStore('');
    setSelectedLevel('');
    setPriceRange([0, 1000]);
    setSortBy('popularity');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête de la page */}
      <div className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tous les produits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Découvrez notre sélection de fournitures scolaires et de papeterie
          </p>
          
          {/* Barre de recherche */}
          <div className="mt-6 max-w-2xl">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtres (version mobile) */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 text-gray-700 dark:text-gray-300"
          >
            <Filter className="h-5 w-5" />
            Filtres
          </button>
          
          {/* Filtres (version desktop) */}
          <aside className={`lg:block ${isFilterOpen ? 'block' : 'hidden'} lg:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-fit sticky top-24`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Réinitialiser
              </button>
            </div>
            
            {/* Filtre par catégorie */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Catégories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={`category-${category.id}`} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                  </label>
                ))}
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="flex items-center text-xs text-orange-600 hover:text-orange-700 mt-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Effacer la sélection
                  </button>
                )}
              </div>
            </div>
            
            {/* Filtre par magasin */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Magasins</h3>
              <div className="space-y-2">
                {stores.map((store) => (
                  <label key={`store-${store.id}`} className="flex items-center">
                    <input
                      type="radio"
                      name="store"
                      checked={selectedStore === store.id}
                      onChange={() => setSelectedStore(store.id)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{store.name}</span>
                  </label>
                ))}
                {selectedStore && (
                  <button 
                    onClick={() => setSelectedStore('')}
                    className="flex items-center text-xs text-orange-600 hover:text-orange-700 mt-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Effacer la sélection
                  </button>
                )}
              </div>
            </div>
            
            {/* Filtre par niveau scolaire */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Niveau scolaire</h3>
              <div className="space-y-2">
                {educationLevels.map((level) => (
                  <label key={`level-${level}`} className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === level}
                      onChange={() => setSelectedLevel(level)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{typeof level === 'string' ? level : 'Niveau'}</span>
                  </label>
                ))}
                {selectedLevel && (
                  <button 
                    onClick={() => setSelectedLevel('')}
                    className="flex items-center text-xs text-orange-600 hover:text-orange-700 mt-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Effacer la sélection
                  </button>
                )}
              </div>
            </div>
            
            {/* Filtre par prix */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Prix</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{priceRange[0]}DT</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{priceRange[1]}DT</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </aside>
          
          {/* Liste des produits */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md focus:ring-orange-500 focus:border-orange-500 p-2"
                >
                  <option value="popularity">Popularité</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="newest">Nouveautés</option>
                  <option value="rating">Meilleures notes</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Affichage:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Résultats */}
            {loading ? (
              // Affichage du chargement
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-300 dark:bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              // Affichage des produits
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {products.map((product) => (
                  <ProductCard 
                    key={product.productId} 
                    product={product} 
                    onAddToCart={handleAddToCart} 
                  />
                ))}
              </div>
            ) : (
              // Aucun résultat
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Nous n'avons trouvé aucun produit correspondant à vos critères de recherche.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationDialog />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
