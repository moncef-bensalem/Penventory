'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Mail, Phone, ShoppingBag, Clock, Globe, ChevronRight, User, Calendar, CheckCircle, ExternalLink, Facebook, Instagram } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StoreDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching store details for ID: ${id}`);
        
        const response = await fetch(`/api/stores/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Magasin non trouvé ou non approuvé');
          }
          throw new Error(`Erreur: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Store details:', data);
        
        setStore(data.store);
        setProducts(data.products || []);
        setProductsCount(data.productsCount || 0);
      } catch (err) {
        console.error('Error fetching store details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchStoreDetails();
    }
  }, [id]);

  // Fonctions auxiliaires pour gérer les valeurs nulles/indéfinies
  const renderImage = (url, alt, fallbackClass = 'h-12 w-12', priority = false) => {
    if (!url) {
      return (
        <div className={`flex items-center justify-center bg-gray-200 ${fallbackClass}`}>
          <ShoppingBag className="h-1/2 w-1/2 text-gray-400" />
        </div>
      );
    }
    
    return (
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<div class="flex items-center justify-center bg-gray-200 h-full w-full"><span class="text-gray-500">Image non disponible</span></div>`;
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des détails du magasin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Magasin non disponible</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/store" 
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Retour à la liste des magasins
          </Link>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Magasin non trouvé</h2>
          <p className="text-gray-600 mb-6">Le magasin demandé n'existe pas ou n'est pas approuvé.</p>
          <Link 
            href="/store" 
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Retour à la liste des magasins
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du magasin */}
      <div className="relative mb-10">
        {/* Bannière */}
        <div className="h-48 md:h-64 rounded-lg overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 relative">
          {store.banner && (
            <div className="absolute inset-0">
              <Image 
                src={store.banner} 
                alt={`Bannière de ${store.name}`} 
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        {/* Logo et informations principales */}
        <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 relative z-10 px-4">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white bg-white shadow-lg relative">
            {renderImage(store.logo, store.name, 'h-full w-full', true)}
          </div>
          
          <div className="md:ml-6 mt-4 md:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{store.name}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {store.rating > 0 && (
                <div className="flex items-center text-yellow-500 bg-yellow-100 px-2 py-1 rounded">
                  <Star className="h-4 w-4 mr-1" fill="currentColor" />
                  <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded">
                <ShoppingBag className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{productsCount} produit{productsCount !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Approuvé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Informations du magasin */}
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
            <p className="text-gray-700 mb-6">{store.description}</p>
            
            <div className="space-y-4">
              {store.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Adresse</h3>
                    <p className="text-gray-600">{[store.address, store.city].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              )}
              
              {store.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <a href={`mailto:${store.email}`} className="text-blue-600 hover:underline">{store.email}</a>
                  </div>
                </div>
              )}
              
              {store.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Téléphone</h3>
                    <a href={`tel:${store.phone}`} className="text-blue-600 hover:underline">{store.phone}</a>
                  </div>
                </div>
              )}
              
              {store.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Site web</h3>
                    <a 
                      href={store.website.startsWith('http') ? store.website : `https://${store.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      {store.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Membre depuis</h3>
                  <p className="text-gray-600">
                    {store.createdAt && formatDistanceToNow(new Date(store.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              
              {store.owner && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Propriétaire</h3>
                    <p className="text-gray-600">{store.owner.name}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Réseaux sociaux */}
            {(store.facebook || store.instagram) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Suivez-nous</h3>
                <div className="flex space-x-3">
                  {store.facebook && (
                    <a 
                      href={store.facebook.startsWith('http') ? store.facebook : `https://${store.facebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  
                  {store.instagram && (
                    <a 
                      href={store.instagram.startsWith('http') ? store.instagram : `https://${store.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gradient-to-tr from-purple-600 to-pink-600 text-white p-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Produits du magasin */}
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Produits</h2>
              <Link 
                href={`/products?storeId=${store.id}`}
                className="text-orange-600 hover:underline text-sm font-medium flex items-center"
              >
                Voir tous
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <Link 
                    key={product.id} 
                    href={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square relative">
                      {product.images && product.images.length > 0 ? (
                        <Image 
                          src={product.images[0]} 
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {product.price.toFixed(2)} DT
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun produit disponible actuellement</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 