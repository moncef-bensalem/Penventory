'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  User as UserIcon, 
  Settings, 
  CreditCard, 
  Package, 
  ArrowRight, 
  ShoppingBag,
  Heart,
  Search,
  Calendar
} from 'lucide-react';

export default function AccountContent() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des commandes');
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Erreur:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Récupérer les IDs des commandes dans localStorage
    const checkLocalStorageOrders = () => {
      try {
        const orderIds = JSON.parse(localStorage.getItem('orderIds') || '[]');
        console.log('Commandes stockées localement:', orderIds);
      } catch (error) {
        console.error('Erreur lors de la lecture des commandes locales:', error);
      }
    };
    
    fetchOrders();
    checkLocalStorageOrders();
  }, []);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Chargement...
          </h1>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md mx-auto">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connectez-vous pour accéder à votre compte
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Mon compte</h1>
        
        {/* Résumé */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-gray-700 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xl font-bold mr-4">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {session.user.name || 'Utilisateur'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{session.user.email}</p>
            </div>
          </div>
        </div>
        
        {/* Raccourcis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mes commandes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">
                {orders.length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Mes commandes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Consultez et suivez vos commandes
            </p>
            <Link 
              href="/account/orders" 
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium inline-flex items-center"
            >
              Voir mes commandes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {/* Mes favoris */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Mes favoris</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Retrouvez vos produits préférés
            </p>
            <Link 
              href="/account/wishlist" 
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium inline-flex items-center"
            >
              Voir mes favoris
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {/* Suivi de commande */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Suivi de commande</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Suivez l'état de vos commandes
            </p>
            <Link 
              href="/account/orders/track" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center"
            >
              Suivre mes commandes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {/* Paramètres */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Paramètres</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Gérez vos informations personnelles
            </p>
            <Link 
              href="/account/settings" 
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium inline-flex items-center"
            >
              Modifier mes informations
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {/* Activité récente */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Activité récente</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Commande #{order.number}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Status: <span className="font-medium">{order.status}</span>
                  </p>
                  <Link 
                    href={`/account/orders/${order.id}`}
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium inline-flex items-center"
                  >
                    Voir les détails
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune commande récente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous n'avez pas encore passé de commande.
              </p>
              <Link 
                href="/products"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Découvrir nos produits
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
