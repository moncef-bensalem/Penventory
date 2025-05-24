'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { ArrowRight, Star, TrendingUp, Award, ShoppingBag, ChevronRight, ChevronLeft, Search } from 'lucide-react';

// Composant pour les catégories de stylos
const PenCategory = ({ name, image, slug }) => (
  <Link href={`/categories/${slug}`} className="group">
    <div className="relative overflow-hidden rounded-lg aspect-square">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-white font-semibold text-lg">{name}</h3>
      </div>
    </div>
  </Link>
);

// Composant pour les produits en vedette
const FeaturedProduct = ({ product, t }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Ajouter la fonction de traduction au produit pour l'utiliser dans le composant
  product.t = t;
  
  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={isHovered && product.images.length > 1 ? product.images[1] : product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-all duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md font-medium text-sm transition-colors">
            {product.t('homeAddToCart')}
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-1">
          <div className="flex items-center text-yellow-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-xs text-gray-500">{product.reviewCount} {product.t('homeReviews')}</span>
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{product.brand}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {product.discount > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{(product.price * (1 - product.discount / 100)).toFixed(2)} DT</span>
                <span className="ml-2 text-sm text-gray-500 line-through">{product.price.toFixed(2)} DT</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price.toFixed(2)} DT</span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 ? (
            <span className="text-xs text-orange-600 font-medium">{product.t('homeLowStock').replace('{stock}', product.stock)}</span>
          ) : product.stock === 0 ? (
            <span className="text-xs text-red-600 font-medium">{product.t('homeOutOfStock')}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Composant pour les marques
const BrandLogo = ({ logo, name }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <Image src={logo} alt={name} width={100} height={100} className="mx-auto" />
  </div>
);

// Composant pour les catégories
const CategoryCard = ({ category }) => {
  return (
    <Link href={`/categories/${category.id}`} className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <Image 
          src={category.image || `/images/placeholder-category.jpg`} 
          alt={category.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
      </div>
      <h2 className="text-center text-gray-800 mt-2 font-medium">{category.name}</h2>
    </Link>
  );
};

// Composant pour les magasins
const StoreCard = ({ store }) => {
  return (
    <Link href={`/store/${store.id}`} className="group">
      <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-4 flex flex-col items-center transition-all duration-300">
        <div className="w-20 h-20 overflow-hidden mb-3 flex items-center justify-center">
          <Image 
            src={store.logo || "/images/placeholder-store.jpg"} 
            alt={store.name}
            width={80}
            height={80}
            className="object-contain"
            unoptimized
          />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-orange-600 transition-colors">{store.name}</h3>
      </div>
    </Link>
  );
};

// Composant pour les produits
const ProductCard = ({ product }) => {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="relative aspect-square">
          <Image 
            src={product.images[0]} 
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
          <div className="flex items-center justify-between mt-1">
            {product.discount > 0 ? (
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900">{(product.price * (1 - product.discount / 100)).toFixed(2)} DT</span>
                <span className="ml-2 text-xs text-gray-500 line-through">{product.price.toFixed(2)} DT</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-900">{product.price.toFixed(2)} DT</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Home() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storeBanners, setStoreBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fonction de placeholder pour les images manquantes
  const placeholderImage = (text) => {
    return `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(text)}`;
  };

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log('Categories data:', data); // Pour déboguer
      
      // Récupérer le nombre de produits par catégorie
      let productCounts = {};
      try {
        const countsResponse = await fetch('/api/products/counts');
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          productCounts = countsData.categoryCounts || {};
          console.log('Product counts:', productCounts); // Pour déboguer
        }
      } catch (countErr) {
        console.error('Error fetching product counts:', countErr);
      }
      
      // Transformer les données pour inclure des images et le nombre de produits
      // L'API retourne directement un tableau de catégories, pas un objet avec une propriété categories
      const categoriesWithImages = (Array.isArray(data) ? data : []).map(category => ({
        ...category,
        image: category.image || placeholderImage(category.name),
        productCount: productCounts[category.id] || 0
      }));
      
      console.log('Categories with images:', categoriesWithImages); // Pour déboguer
      setCategories(categoriesWithImages);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  // Récupérer les produits en vedette
  const fetchFeaturedProducts = async () => {
    try {
      // Récupérer les produits en vedette
      const featuredResponse = await fetch('/api/products?featured=true');
      if (!featuredResponse.ok) {
        throw new Error(`Error: ${featuredResponse.status}`);
      }
      const featuredData = await featuredResponse.json();
      
      // Transformer les données pour s'assurer que tous les produits ont des images
      const productsWithImages = (featuredData.products || []).map(product => ({
        ...product,
        images: product.images && product.images.length > 0 
          ? product.images 
          : [placeholderImage(product.name)],
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || 0,
        discount: product.discount || 0,
        stock: product.stock || 10
      }));
      
      setFeaturedProducts(productsWithImages);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('Failed to load featured products');
    }
  };

  // Récupérer les nouveaux produits
  const fetchNewArrivals = async () => {
    try {
      const response = await fetch('/api/products?sort=newest');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Transformer les données pour s'assurer que tous les produits ont des images
      const productsWithImages = (data.products || []).map(product => ({
        ...product,
        images: product.images && product.images.length > 0 
          ? product.images 
          : [placeholderImage(product.name)],
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || 0,
        discount: product.discount || 0,
        stock: product.stock || 10
      }));
      
      setNewArrivals(productsWithImages);
    } catch (err) {
      console.error('Error fetching new arrivals:', err);
      setError('Failed to load new arrivals');
    }
  };

  // Récupérer les meilleures ventes
  const fetchBestSellers = async () => {
    try {
      const response = await fetch('/api/products?sort=popularity');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Transformer les données pour s'assurer que tous les produits ont des images
      const productsWithImages = (data.products || []).map(product => ({
        ...product,
        images: product.images && product.images.length > 0 
          ? product.images 
          : [placeholderImage(product.name)],
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || 0,
        discount: product.discount || 0,
        stock: product.stock || 10
      }));
      
      setBestSellers(productsWithImages);
    } catch (err) {
      console.error('Error fetching best sellers:', err);
      setError('Failed to load best sellers');
    }
  };

  // Récupérer les articles de blog
  const fetchBlogPosts = async () => {
    try {
      // Essayer de récupérer les articles de blog depuis l'API
      try {
        const response = await fetch('/api/blog/posts');
        if (response.ok) {
          const data = await response.json();
          
          // Transformer les données pour s'assurer que tous les articles ont des images
          const postsWithImages = (data.posts || []).map(post => ({
            ...post,
            coverImage: post.coverImage || '/images/placeholder-blog.jpg',
            publishedAt: post.publishedAt || new Date().toISOString(),
            excerpt: post.excerpt || '',
            slug: post.slug || post.id
          }));
          
          setBlogPosts(postsWithImages);
          return;
        }
      } catch (apiError) {
        console.log('API blog/posts non disponible, utilisation de données fictives');
      }
      
      // Si l'API n'est pas disponible, utiliser des données fictives
      const mockPosts = [
        {
          id: '1',
          title: 'Comment choisir le bon stylo pour vos besoins',
          coverImage: '/images/placeholder-blog.jpg',
          publishedAt: new Date().toISOString(),
          excerpt: 'Découvrez les différents types de stylos et comment choisir celui qui convient le mieux à vos besoins.',
          slug: 'choisir-stylo',
          category: { name: 'Guide' }
        },
        {
          id: '2',
          title: 'Les meilleures techniques de prise de notes pour les étudiants',
          coverImage: '/images/placeholder-blog.jpg',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          excerpt: 'Améliorez votre apprentissage avec ces techniques de prise de notes efficaces.',
          slug: 'techniques-prise-notes',
          category: { name: 'Conseils' }
        },
        {
          id: '3',
          title: 'Nouveaux produits: Découvrez notre collection automne',
          coverImage: '/images/placeholder-blog.jpg',
          publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          excerpt: 'Explorez notre nouvelle gamme de produits pour la rentrée scolaire et le bureau.',
          slug: 'collection-automne',
          category: { name: 'Actualités' }
        }
      ];
      
      setBlogPosts(mockPosts);
    } catch (err) {
      console.error('Error in blog posts handling:', err);
      // Ne pas afficher d'erreur à l'utilisateur pour cette section non critique
      setBlogPosts([]);
    }
  };

  // Récupérer les marques (stores)
  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/stores');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Transformer les données pour inclure des logos si ils n'existent pas
      const brandsWithLogos = (data.stores || []).map(store => ({
        ...store,
        logo: store.logo || placeholderImage(store.name),
        productCount: store.productCount || 0
      }));
      
      setBrands(brandsWithLogos);
      
      // Récupérer les bannières des magasins qui en ont
      const storesWithBanners = brandsWithLogos.filter(store => store.banner);
      setStoreBanners(storesWithBanners);
      
      // Si aucune bannière n'est disponible, ajouter une bannière par défaut
      if (storesWithBanners.length === 0) {
        setStoreBanners([{
          id: 'default',
          name: 'Back to School',
          banner: '/images/back-to-school-banner.jpg'
        }]);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
    }
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchFeaturedProducts(),
          fetchNewArrivals(),
          fetchBestSellers(),
          fetchBlogPosts()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (storeBanners.length <= 1) return; // Ne pas démarrer le timer s'il n'y a qu'une seule bannière
    
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev === storeBanners.length - 1 ? 0 : prev + 1));
    }, 5000); // Change toutes les 5 secondes
    
    return () => clearInterval(timer); // Nettoyer le timer lors du démontage
  }, [storeBanners]);

  return (
    <div className="container mx-auto px-4 py-8 bg-white text-gray-900 dark:bg-white dark:text-gray-900">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">  
          <input
            type="text"
            placeholder={t('homeSearchPlaceholder')}
            className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bannière principale et catégories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 dark:bg-white">
        {/* Catégories à gauche */}
        <div className="md:col-span-1 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md overflow-hidden dark:from-gray-50 dark:to-white">
          <div className="p-5 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="font-bold text-white text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {t('categories')}
            </h2>
          </div>
          <ul className="py-2">
            {categories.length > 0 ? categories.slice(0, 8).map((category) => (
              <li key={category.id} className="px-2 py-1">
                <Link href={`/products?category=${category.id}`} className="flex items-center p-3 hover:bg-orange-50 group rounded-lg transition-all duration-200 transform hover:scale-[1.02]">
                  <div className="w-14 h-14 rounded-lg overflow-hidden mr-3 shadow-sm bg-gradient-to-br from-orange-100 to-orange-50 p-0.5">
                    <div className="w-full h-full rounded-md overflow-hidden bg-white">
                      <Image 
                        src={category.image || `/images/placeholder-category.jpg`}
                        alt={category.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-medium group-hover:text-orange-600 transition-colors block">{category.name}</span>
                    {category.productCount > 0 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Award className="h-3 w-3 mr-1 text-orange-400" />
                        {category.productCount} {t('products').toLowerCase()}
                      </span>
                    )}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4 text-orange-600" />
                  </div>
                </Link>
              </li>
            )) : (
              // État de chargement
              Array.from({ length: 8 }).map((_, index) => (
                <li key={index} className="px-2 py-1">
                  <div className="flex items-center p-3 animate-pulse">
                    <div className="w-14 h-14 rounded-lg bg-gray-200 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-t border-orange-100">
            <Link href="/categories" className="flex items-center justify-center bg-white hover:bg-orange-500 text-orange-600 hover:text-white font-medium rounded-lg py-2 px-4 transition-colors shadow-sm">
              Voir toutes les catégories <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Slider de bannières de magasins */}
        <div className="md:col-span-2 relative h-64 md:h-auto rounded-xl overflow-hidden shadow-lg">
          {/* Slider */}
          <div className="relative w-full h-full">
            {storeBanners.length > 0 ? (
              <>
                {/* Bannières */}
                <div className="relative w-full h-full">
                  {storeBanners.map((store, index) => (
                    <div 
                      key={store.id} 
                      className={`absolute inset-0 transition-opacity duration-500 ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      <div className="relative w-full h-full">
                        <Image 
                          src={store.banner || '/images/back-to-school-banner.jpg'}
                          alt={store.name}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">{store.name}</h2>
                            <Link href={`/store/${store.id}`} className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                              Visiter la boutique <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Contrôles du slider */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
                  <button 
                    onClick={() => setCurrentBanner(prev => (prev === 0 ? storeBanners.length - 1 : prev - 1))}
                    className="h-10 w-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow-md transition-colors"
                    aria-label="Bannière précédente"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
                
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
                  <button 
                    onClick={() => setCurrentBanner(prev => (prev === storeBanners.length - 1 ? 0 : prev + 1))}
                    className="h-10 w-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow-md transition-colors"
                    aria-label="Bannière suivante"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
                
                {/* Indicateurs de slide */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                  {storeBanners.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentBanner(index)}
                      className={`h-2 ${index === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50'} rounded-full transition-all duration-300`}
                      aria-label={`Aller à la bannière ${index + 1}`}
                    ></button>
                  ))}
                </div>
              </>
            ) : (
              // État de chargement
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">{t('loading') || 'Chargement des bannières...'}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Services à droite */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="mr-3 text-orange-500">
                <span className="text-xl">?</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{t('helpCenter') || 'CENTRE D\'AIDE'}</h3>
                <p className="text-xs text-gray-600 mb-2">{t('helpCenterDescription') || 'Guide d\'assistance pour les clients sur la plateforme'}</p>
                <Link href="/help" className="text-xs text-orange-500 font-medium hover:underline">{t('contactUs')} →</Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="mr-3 text-orange-500">
                <span className="text-xl">↻</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{t('easyReturn') || 'RETOUR FACILE'}</h3>
                <p className="text-xs text-gray-600 mb-2">{t('quickReturns') || 'Retours et remboursements rapides'}</p>
                <Link href="/returns" className="text-xs text-orange-500 font-medium hover:underline">{t('returnPolicy')} →</Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="mr-3 text-orange-500">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{t('becomeSeller')}</h3>
                <p className="text-xs text-gray-600 mb-2">{t('becomeSellerDescription') || 'Devenez vendeur, fournisseur et partenaire'}</p>
                <Link href="/become-seller" className="text-xs text-orange-500 font-medium hover:underline">{t('start') || 'Commencer'} →</Link>
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-center">
            <Image 
              src="/images/brain-reading.png" 
              alt="Brain Reading" 
              width={120} 
              height={120} 
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="mb-10">
            <div className="relative bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl overflow-hidden shadow-lg dark:from-orange-50 dark:to-orange-100">
              {/* Éléments décoratifs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200 rounded-full -ml-12 -mb-12 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="text-center py-6 border-b border-orange-200">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-900 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 mr-3 text-orange-500" />
                    {t('sellers') || 'Boutiques'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-600 mt-1">{t('discoverStores') || 'Découvrez nos boutiques partenaires'}</p>
                </div>

                <div className="p-8">
                  {loading ? (
                    // État de chargement
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="bg-white/60 rounded-xl aspect-square shadow-sm"></div>
                          <div className="h-4 bg-white/60 rounded w-3/4 mx-auto mt-3"></div>
                        </div>
                      ))}
                    </div>
                  ) : brands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
                      {brands.map((brand) => (
                        <div key={brand.id} className="text-center">
                          <Link href={`/store/${brand.id}`} className="group block">
                            <div className="shadow-sm group-hover:shadow-md rounded-xl overflow-hidden aspect-square mb-3 transform transition-all duration-300 group-hover:-translate-y-1 relative">
                              <Image 
                                src={brand.logo || "/images/placeholder-store.jpg"} 
                                alt={brand.name}
                                fill
                                className="object-cover transition-all duration-300 group-hover:scale-110"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{brand.name}</h3>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white/80 rounded-xl">
                      <p className="text-gray-600">{t('homeNoStores') || 'Aucun magasin disponible'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      
      {/* Contenu principal */}
      <div className="flex flex-col gap-8">
          {/* Sections de produits par catégorie */}
          {categories.length > 0 && categories.map((category, index) => {
            // Ne montrer que les 4 premières catégories
            if (index >= 4) return null;
            
            // Filtrer les produits pour cette catégorie
            const categoryProducts = featuredProducts.filter(product => 
              product.categoryId === category.id || 
              product.category?.id === category.id
            ).slice(0, 6);
            
            // Si aucun produit n'est trouvé pour cette catégorie, passer à la suivante
            if (categoryProducts.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-10 bg-white rounded-lg shadow-sm overflow-hidden dark:bg-white">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3 dark:bg-orange-100">
                      <span className="text-orange-500 text-xs font-bold dark:text-orange-500">{category.name.charAt(0)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-900">{category.name}</h2>
                  </div>
                  <Link href={`/categories/${category.id}`} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600">
                    See All
                  </Link>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {loading ? (
                      // État de chargement
                      Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="bg-gray-100 rounded-lg overflow-hidden aspect-square animate-pulse">
                          <div className="h-full w-full"></div>
                        </div>
                      ))
                    ) : categoryProducts.length > 0 ? (
                      // Produits de la catégorie
                      categoryProducts.map((product) => (
                        <Link key={product.id} href={`/products/${product.id}`} className="group block">
                          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                            <div className="relative aspect-square overflow-hidden">
                              <Image 
                                src={product.images[0]} 
                                alt={product.name}
                                fill
                                className="object-cover transition-all duration-500 group-hover:scale-110"
                                unoptimized
                              />
                              {product.discount > 0 && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                                  -{product.discount}%
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                              <div className="flex items-center justify-between mt-2">
                                {product.discount > 0 ? (
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-orange-600">{(product.price * (1 - product.discount / 100)).toFixed(2)} DT</span>
                                    <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)} DT</span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-bold text-gray-900">{product.price.toFixed(2)} DT</span>
                                )}
                                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                                  <ChevronRight className="h-3 w-3 text-orange-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      // Aucun produit
                      <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">Aucun produit disponible dans cette catégorie</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
