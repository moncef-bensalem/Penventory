'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';

import { LanguageSelector } from '@/components/LanguageSelector';

import ChatSupport from '@/components/support/ChatSupport';
import { ShoppingCart, User, Search, Menu, X, Heart, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function StoreLayoutContent({ children }) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Effet pour gérer le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Récupérer les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        // Utiliser des données fictives en cas d'erreur
        setCategories([
          { id: 1, name: 'Électronique', slug: 'electronique' },
          { id: 2, name: 'Mode', slug: 'mode' },
          { id: 3, name: 'Maison', slug: 'maison' },
          { id: 4, name: 'Sports', slug: 'sports' },
          { id: 5, name: 'Beauté', slug: 'beaute' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Récupérer le nombre d'articles dans le panier
  useEffect(() => {
    const getCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    };
    getCartCount();
    window.addEventListener('storage', getCartCount);
    return () => window.removeEventListener('storage', getCartCount);
  }, []);
  
  // Récupérer les notifications en temps réel
  useEffect(() => {

  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen pb-16 md:pb-0 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Barre de navigation */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-gray-900 shadow-md' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-500">PENVENTORY</span>
            </Link>

            {/* Navigation sur desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className={`text-sm font-medium ${pathname === '/' ? 'text-orange-600 dark:text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500'} transition-colors`}>
                {t('home')}
              </Link>
              <Link href="/products" className={`text-sm font-medium ${pathname.startsWith('/products') ? 'text-orange-600 dark:text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500'} transition-colors`}>
                {t('products')}
              </Link>
              <Link href="/categories" className={`text-sm font-medium ${pathname.startsWith('/categories') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'} transition-colors`}>
                {t('categories')}
              </Link>
              <Link href="/store" className={`text-sm font-medium ${pathname.startsWith('/store') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'} transition-colors`}>
                {t('sellers')}
              </Link>
              <Link href="/contact" className={`text-sm font-medium ${pathname.startsWith('/contact') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'} transition-colors`}>
                {t('contact')}
              </Link>
              <Link href="/listes-scolaires" className={`text-sm font-medium ${pathname.startsWith('/listes-scolaires') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'} transition-colors`}>
                {t('schoolLists')}
              </Link>
              <Link href="/help" className={`text-sm font-medium ${pathname.startsWith('/help') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'} transition-colors`}>
                {t('help')}
              </Link>
              <Link href="/become-seller" className={`text-sm font-medium ${pathname.startsWith('/become-seller') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'} transition-colors`}>
                {t('becomeSeller')}
              </Link>
            </nav>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Bouton de thème */}
              <button
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Icône de recherche */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              
              {/* Cloche de notification */}
              
              {/* Icône de favoris */}
              <Link href="/wishlist" className="hidden sm:block text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                <Heart size={20} />
              </Link>
              
              {/* Icône de panier */}
              <Link href="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 dark:bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* Utilisons le composant LanguageSelector au lieu d'une implémentation personnalisée */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              {/* Compte */}
              {loading ? (
                <div className="h-5 w-5 animate-pulse bg-gray-200 rounded-full"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                      <User size={20} />
                      <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        {t('profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="cursor-pointer">
                        {t('myOrders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="cursor-pointer">
                        {t('wishlist')}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          {t('administration')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'MANAGER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/manager/dashboard" className="cursor-pointer">
                          {t('management')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'SELLER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard" className="cursor-pointer">
                          {t('sellerSpace')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 hover:text-red-700">
                      <LogOut size={20} />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="flex items-center space-x-1 p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                  <LogIn size={20} />
                  <span className="hidden sm:inline text-sm font-medium">{t('login')}</span>
                </Link>
              )}

              {/* Menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <form onSubmit={handleSearch} className="flex items-center p-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-r-md hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                >
                  {t('search')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
            <div 
              className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-900 shadow-xl flex flex-col overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
              aria-modal="true"
              role="dialog"
              aria-label="Menu de navigation"
            >
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
                <span className="text-lg font-bold dark:text-white">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2"
                  aria-label="Fermer le menu"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col py-2 flex-1 overflow-y-auto">
                <Link
                  href="/"
                  className={`px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-orange-600' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('home')}
                </Link>
                <Link
                  href="/products"
                  className={`px-4 py-2 text-sm font-medium ${pathname.startsWith('/products') ? 'text-orange-600' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('products')}
                </Link>
                <Link
                  href="/categories"
                  className={`px-4 py-2 text-sm font-medium ${pathname.startsWith('/categories') ? 'text-orange-600' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('categories')}
                </Link>
                <Link
                  href="/store"
                  className={`px-4 py-2 text-sm font-medium ${pathname.startsWith('/store') ? 'text-orange-600' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('sellers')}
                </Link>
                <Link
                  href="/favorites"
                  className={`px-4 py-2 text-sm font-medium ${pathname === '/favorites' ? 'text-orange-600' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('favorites')}
                </Link>
                {user && (
                  <Link
                    href="/account/orders"
                    className={`px-4 py-2 text-sm font-medium ${pathname.startsWith('/account/orders') ? 'text-orange-600' : 'text-gray-700'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('myOrders')}
                  </Link>
                )}
                {!user && (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-orange-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                )}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 text-left"
                  >
                    {t('logout')}
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {children}
      </main>

      {/* Pied de page */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">{t('aboutUs')}</h3>
              <p className="text-gray-400 mb-4">
                {t('aboutUsText')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a4.902 4.902 0 00-1.772-1.153 4.902 4.902 0 00-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('categories')}</h3>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link href={`/categories/${category.slug}`} className="text-gray-400 hover:text-white transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('quickLinks')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    {t('about')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    {t('contact')}
                  </Link>
                </li>
                <li>
                  <Link href="/livraison" className="text-gray-400 hover:text-white transition-colors">
                    {t('delivery')}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                    {t('faq')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    {t('termsOfUse')}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    {t('privacyPolicy')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('newsletter')}</h3>
              <p className="text-gray-400 mb-4">
                {t('newsletterText')}
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
                >
                  {t('subscribe')}
                </button>
              </form>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} PENVENTORY. {t('allRightsReserved')}</p>
          </div>
        </div>
      </footer>

      {/* Barre de navigation mobile fixe en bas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 shadow-lg">
        <div className="flex items-center justify-around h-16">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">{t('home')}</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs mt-1">{t('categories')}</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors relative">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1/4 bg-orange-600 dark:bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">{t('cart')}</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">{t('menu')}</span>
          </button>
        </div>
      </div>

      {/* Composant de chat support client */}
      <ChatSupport />
      
      {/* Composant de demande de permission pour les notifications */}
    </div>
  );
}

// Wrapper avec le LanguageProvider
export default function StoreLayout({ children }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
          <StoreLayoutContent>{children}</StoreLayoutContent>
      </ThemeProvider>
    </LanguageProvider>
  );
}
