'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  Filter, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Truck,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Appel à l'API pour récupérer les commandes de l'utilisateur
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      
      const data = await response.json();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        console.error('Format de réponse incorrect:', data);
        toast.error('Format de réponse incorrect');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
      setOrders([]); // Définir un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour obtenir l'icône et la couleur en fonction du statut
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { 
        icon: Clock, 
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' 
      },
      'EN_ATTENTE': { 
        icon: Clock, 
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' 
      },
      'CONFIRMEE': { 
        icon: CheckCircle, 
        label: 'Confirmée',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
      },
      'EN_PREPARATION': { 
        icon: Package, 
        label: 'En préparation',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' 
      },
      'PROCESSING': { 
        icon: Package, 
        label: 'En préparation',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' 
      },
      'EXPEDIEE': { 
        icon: Truck, 
        label: 'Expédiée',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' 
      },
      'SHIPPED': { 
        icon: Truck, 
        label: 'Expédiée',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' 
      },
      'LIVREE': { 
        icon: CheckCircle, 
        label: 'Livrée',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
      },
      'DELIVERED': { 
        icon: CheckCircle, 
        label: 'Livrée',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
      },
      'ANNULEE': { 
        icon: XCircle, 
        label: 'Annulée',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
      },
      'CANCELLED': { 
        icon: XCircle, 
        label: 'Annulée',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
      }
    };
    
    return statusMap[status] || { 
      icon: Clock, 
      label: status,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
    };
  };
  
  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    // Filtrer par statut
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      return (
        order.number?.toLowerCase().includes(query) ||
        order.items?.some(item => item.product?.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Formatter la date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date inconnue';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      
      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une commande..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Filtre par statut */}
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="CONFIRMEE">Confirmée</option>
              <option value="EN_PREPARATION">En préparation</option>
              <option value="EXPEDIEE">Expédiée</option>
              <option value="LIVREE">Livrée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Liste des commandes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune commande trouvée</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {orders.length === 0
              ? "Vous n'avez pas encore passé de commande."
              : "Aucune commande ne correspond à vos critères de recherche."
            }
          </p>
          <Link
            href="/"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md inline-flex items-center"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div 
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    {/* En-tête de la commande */}
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-lg">Commande #{order.number}</h3>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${statusInfo.color}`}>
                          <StatusIcon className="inline-block h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    
                    {/* Prix total */}
                    <div className="md:text-right">
                      <div className="font-bold text-lg">{order.total.toFixed(2)} DT</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items?.length || 0} article(s)
                      </p>
                    </div>
                  </div>
                  
                  {/* Articles (limité à 2) */}
                  <div className="mt-4 space-y-3">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={`${order.id}-item-${index}`} className="flex items-center">
                        {item.product?.images?.[0] && (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="h-12 w-12 object-cover rounded mr-3 border border-gray-200 dark:border-gray-700" 
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.product?.name || 'Produit'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qté: {item.quantity} × {item.price.toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length > 2) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        + {order.items.length - 2} autre(s) article(s)
                      </p>
                    )}
                  </div>
                  
                  {/* Bouton de suivi */}
                  <div className="mt-6 text-right">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Suivre ma commande
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 