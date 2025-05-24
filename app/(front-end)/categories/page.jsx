'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`);
        }
        
        const data = await response.json();
        setCategories(data);
        
        const countsResponse = await fetch('/api/products/counts');
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          setProductCounts(countsData.categoryCounts || {});
        }
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors de la récupération des catégories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fonction pour rendre l'image de la catégorie de manière sécurisée
  const renderCategoryImage = (imageUrl, alt, priority = false) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Image non disponible</span>
        </div>
      );
    }
    
    return (
      <Image
        src={imageUrl}
        alt={typeof alt === 'string' ? alt : 'Catégorie'}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        priority={priority}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Bannière */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg overflow-hidden mb-10">
          <div className="container px-4 py-12 sm:py-16 md:py-20 flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Explorez Nos Catégories
            </h1>
            <p className="text-white/90 max-w-2xl text-lg">
              Découvrez toute notre gamme de produits organisés par catégories. 
              Trouvez facilement ce que vous cherchez et explorez de nouvelles idées.
            </p>
          </div>
        </div>
        
        {/* Titre de section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Toutes les Catégories
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Parcourez notre catalogue complet de catégories
          </p>
        </div>
        
        {/* Fil d'Ariane */}
        <nav className="flex items-center text-sm font-medium">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            Catégories
          </span>
        </nav>
        
        {/* Titre principal */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Découvrez Nos Catégories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explorez notre sélection de produits par catégorie et trouvez exactement ce que vous cherchez.
          </p>
        </div>
        
        {loading ? (
          // Squelettes de chargement
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Message d'erreur
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            <p>Erreur lors du chargement des catégories: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : categories.length === 0 ? (
          // Message si aucune catégorie n'est trouvée
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aucune catégorie n'a été trouvée.
            </p>
          </div>
        ) : (
          // Grille de catégories
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link 
                href={`/products?category=${category.id}`}
                key={category.id}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {renderCategoryImage(
                    category.image || '/next.svg',
                    category.name,
                    false
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4">
                  <h2 className="font-medium text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                    {category.name}
                  </h2>
                  
                  {category.store && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.store.name}
                    </p>
                  )}
                  
                  {category.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-orange-600 dark:text-orange-500 font-medium">
                      {productCounts[category.id] 
                        ? `${productCounts[category.id]} produit${productCounts[category.id] > 1 ? 's' : ''}` 
                        : 'Voir les produits'}
                    </span>
                    <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs py-1 px-2 rounded-full">
                      Explorer →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 