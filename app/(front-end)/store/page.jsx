'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, MapPin, ShoppingBag, ExternalLink, User, CheckCircle, Tag, Search } from 'lucide-react';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCounts, setProductCounts] = useState({});
  const [sortOption, setSortOption] = useState('default'); // default, name, product-high, product-low
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        // Récupérer les magasins
        const response = await fetch('/api/stores');
        
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        
        const data = await response.json();
        setStores(data.stores || []);
        setFilteredStores(data.stores || []);
        
        // Récupérer le nombre de produits par magasin
        try {
          const countsResponse = await fetch('/api/products/store-counts');
          if (countsResponse.ok) {
            const countsData = await countsResponse.json();
            setProductCounts(countsData.storeCounts || {});
          }
        } catch (countError) {
          console.error('Erreur lors de la récupération des comptages des produits:', countError);
        }
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors de la récupération des magasins:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStores();
  }, []);

  // Mettre à jour les magasins filtrés lorsque les filtres changent
  useEffect(() => {
    if (stores.length === 0) return;
    
    let result = [...stores];
    
    // Appliquer la recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(store => 
        store.name.toLowerCase().includes(query) || 
        (store.description && store.description.toLowerCase().includes(query))
      );
    }
    
    // Appliquer le tri
    switch (sortOption) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'product-high':
        result.sort((a, b) => (productCounts[b.id] || 0) - (productCounts[a.id] || 0));
        break;
      case 'product-low':
        result.sort((a, b) => (productCounts[a.id] || 0) - (productCounts[b.id] || 0));
        break;
      // Le cas 'default' utilise l'ordre par défaut de l'API
      default:
        break;
    }
    
    setFilteredStores(result);
  }, [stores, sortOption, searchQuery, productCounts]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Fonction pour rendre l'image du magasin de manière sécurisée
  const renderStoreImage = (logoUrl, alt, priority = false) => {
    if (!logoUrl || typeof logoUrl !== 'string') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
      );
    }
    
    return (
      <Image
        src={logoUrl}
        alt={typeof alt === 'string' ? alt : 'Logo du magasin'}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        priority={priority}
      />
    );
  };

  // Fonction pour obtenir les magasins populaires (ceux avec le plus de produits)
  const getPopularStores = () => {
    if (stores.length === 0 || Object.keys(productCounts).length === 0) return [];
    
    return [...stores]
      .sort((a, b) => (productCounts[b.id] || 0) - (productCounts[a.id] || 0))
      .slice(0, 3); // Prendre les 3 premiers
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Bannière */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg overflow-hidden mb-10">
          <div className="container px-4 py-12 sm:py-16 md:py-20 flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Découvrez Nos Magasins Partenaires
            </h1>
            <p className="text-white/90 max-w-2xl text-lg mb-6">
              Explorez notre réseau de marchands et trouvez des produits uniques proposés par nos vendeurs partenaires.
            </p>
            
            {/* Statistiques */}
            {!loading && !error && stores.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 mt-6 w-full max-w-3xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <div className="text-3xl font-bold text-white">{stores.length}</div>
                  <div className="text-white/80 text-sm">Magasins</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {Object.values(productCounts).reduce((sum, count) => sum + count, 0) || '∞'}
                  </div>
                  <div className="text-white/80 text-sm">Produits</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-white/80 text-sm">Support</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Magasins populaires */}
        {!loading && !error && stores.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Magasins Populaires
              </h2>
              <Link href="/store" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                Voir tous
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getPopularStores().map((store) => (
                <Link 
                  key={`popular-${store.id}`}
                  href={`/store/${store.id}`}
                  className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-gradient-to-r from-orange-400 to-red-600">
                    {store.logo && typeof store.logo === 'string' ? (
                      <Image 
                        src={store.logo} 
                        alt={store.name} 
                        fill
                        className="object-cover opacity-20 group-hover:opacity-30 transition-opacity" 
                      />
                    ) : null}
                    
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-center">
                      <h3 className="text-xl font-bold text-white mb-2">{store.name}</h3>
                      <p className="text-white/80 text-sm mb-4 line-clamp-2">
                        {store.description || 'Explorez notre sélection de produits'}
                      </p>
                      
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                        {productCounts[store.id] || 0} produit{productCounts[store.id] !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Fil d'Ariane */}
        <nav className="flex items-center text-sm font-medium">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            Magasins
          </span>
        </nav>
        
        {/* Titre de section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tous les Magasins
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Parcourez notre liste complète de magasins partenaires
          </p>
        </div>
        
        {/* Filtres et recherche */}
        {!loading && !error && stores.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rechercher un magasin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Nom ou description..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="sm:w-48">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trier par
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="default">Par défaut</option>
                  <option value="name">Nom (A-Z)</option>
                  <option value="product-high">Plus de produits</option>
                  <option value="product-low">Moins de produits</option>
                </select>
              </div>
            </div>
            
            {searchQuery && (
              <div className="mt-4 text-gray-600 dark:text-gray-400">
                {filteredStores.length} résultat{filteredStores.length !== 1 ? 's' : ''} trouvé{filteredStores.length !== 1 ? 's' : ''} pour "{searchQuery}"
              </div>
            )}
          </div>
        )}
        
        {loading ? (
          // Squelettes de chargement
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Message d'erreur
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            <p>Erreur lors du chargement des magasins: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : stores.length === 0 ? (
          // Message si aucun magasin n'est trouvé
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aucun magasin n'a été trouvé.
            </p>
          </div>
        ) : (
          // Grille de magasins
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div 
                key={store.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {renderStoreImage(
                    store.logo || '/vercel.svg',
                    store.name,
                    false
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {store.isVerified && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Vérifié
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <Link href={`/store/${store.id}`}>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                      {store.name}
                    </h2>
                  </Link>
                  
                  {store.owner && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      Par {store.owner.name}
                    </p>
                  )}
                  
                  {store.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {store.location}
                    </p>
                  )}
                  
                  {store.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm line-clamp-3">
                      {store.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                      <ShoppingBag className="h-3 w-3 mr-1" /> Produits
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100/80 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 rounded-full">
                      <Tag className="h-3 w-3 mr-1" /> Vendeur
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-orange-600 dark:text-orange-500 font-medium">
                      {productCounts[store.id] 
                        ? `${productCounts[store.id]} produit${productCounts[store.id] > 1 ? 's' : ''}` 
                        : 'Voir le magasin'}
                    </div>
                    <Link 
                      href={`/store/${store.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                    >
                      Visiter <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 