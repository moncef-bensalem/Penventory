'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  PackageSearch, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderTrackingFromLocalStorage() {
  const [savedOrders, setSavedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Récupérer les IDs des commandes stockés dans localStorage
    const fetchSavedOrderIds = () => {
      try {
        const savedOrderIdsString = localStorage.getItem('orderIds');
        if (!savedOrderIdsString) {
          setLoading(false);
          return;
        }

        // Vérifier que la chaîne est bien un JSON valide
        if (savedOrderIdsString.startsWith('[') && savedOrderIdsString.endsWith(']')) {
          try {
            const orderIds = JSON.parse(savedOrderIdsString);
            if (Array.isArray(orderIds) && orderIds.length > 0) {
              setSavedOrders(orderIds);
            }
          } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            // Tentative de nettoyage des caractères non désirés
            const cleanedString = savedOrderIdsString.replace(/^\s*|\s*$/g, '');
            try {
              const orderIds = JSON.parse(cleanedString);
              if (Array.isArray(orderIds) && orderIds.length > 0) {
                setSavedOrders(orderIds);
              }
            } catch (error) {
              throw new Error(`Format JSON invalide: ${parseError.message}`);
            }
          }
        } else {
          throw new Error('Format de données attendu incorrect dans localStorage');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes sauvegardées:', err);
        setError('Impossible de récupérer les commandes sauvegardées. Erreur: ' + err.message);
        toast.error('Erreur lors du chargement des commandes sauvegardées');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedOrderIds();
  }, []);

  const navigateToOrder = (orderId) => {
    if (!orderId) {
      toast.error("ID de commande invalide");
      return;
    }
    
    try {
      router.push(`/account/orders/${orderId}`);
    } catch (err) {
      console.error('Erreur de navigation:', err);
      toast.error("Impossible d'afficher cette commande");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/account" className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mon compte
          </Link>
        </div>
      </div>
    );
  }

  if (!savedOrders.length) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/account" className="text-gray-600 hover:text-orange-600 inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mon compte
          </Link>
        </div>
        
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <PackageSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Aucune commande récente</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas de commandes récentes à suivre. 
            Effectuez un achat pour suivre vos commandes ici.
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
          >
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/account" className="text-gray-600 hover:text-orange-600 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à mon compte
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Mes commandes récentes</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
        <div className="p-6">
          <div className="mb-4 p-4 bg-orange-50 dark:bg-gray-700 rounded-lg border-l-4 border-orange-500">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Voici les commandes que vous avez récemment passées. Cliquez sur une commande pour voir ses détails et suivre son statut.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {savedOrders.map((orderInfo, index) => (
              <div 
                key={index} 
                className="py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out rounded-lg p-2"
                onClick={() => navigateToOrder(orderInfo.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Commande #{orderInfo.number || `ORD-${orderInfo.id.substring(0, 6)}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {orderInfo.storeId ? `Magasin ID: ${orderInfo.storeId}` : 'Commande en ligne'}
                    </p>
                  </div>
                  <div className="flex items-center text-orange-600">
                    <span className="mr-1">Voir détails</span>
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 