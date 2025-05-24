'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye,
  Filter, 
  RefreshCw,
  Download,
  ShoppingBag,
  Search,
  Calendar,
  ArrowUpDown,
  Check,
  X,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les commandes
  useEffect(() => {
    if (user) {
      console.log('User detected, fetching orders...');
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      
      // L'URL de l'API dépend du rôle de l'utilisateur
      const apiUrl = user.role === 'ADMIN' 
        ? '/api/admin/orders' 
        : '/api/seller/orders';
      
      const response = await fetch(apiUrl);
      console.log('Orders response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des commandes');
      }
      
      const data = await response.json();
      console.log('Orders data received:', data);
      
      // S'assurer que les données sont valides et extraire les commandes
      if (!data) {
        console.error('Invalid orders data format:', data);
        throw new Error('Format de données de commandes invalide');
      }
      
      // La structure peut varier en fonction de l'API
      const ordersArray = data.orders || data;
      
      if (!Array.isArray(ordersArray)) {
        console.error('Data is not an array:', ordersArray);
        throw new Error('Les données de commandes ne sont pas au format attendu');
      }
      
      console.log('Orders fetched successfully:', ordersArray.length);
      
      // Transformer les données pour l'affichage
      const formattedOrders = ordersArray.map(order => ({
        id: order.id,
        orderNumber: order.number || `ORD-${order.id.substring(0, 6)}`,
        customer: order.customer || { name: 'Client inconnu', email: 'N/A' },
        status: order.status || 'PENDING',
        totalAmount: order.total || 0,
        formattedTotal: new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'TND' 
        }).format(order.total || 0),
        paymentStatus: 'PAID', // Par défaut, peut être modifié si disponible
        items: order.items || [],
        createdAt: order.createdAt,
        formattedCreatedAt: order.createdAt ? 
          format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr }) :
          'Date inconnue'
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.message || 'Erreur lors de la récupération des commandes');
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      const demoData = [
        {
          id: 'ord_123456',
          orderNumber: 'CMD-2025-001',
          customer: { name: 'Jean Dupont', email: 'jean@example.com' },
          status: 'PENDING',
          totalAmount: 129.99,
          formattedTotal: '129,99 DT',
          paymentStatus: 'PAID',
          items: [
            { id: '1', productName: 'Smartphone XYZ', quantity: 1, price: 99.99 },
            { id: '2', productName: 'Coque de protection', quantity: 1, price: 19.99 },
            { id: '3', productName: 'Chargeur rapide', quantity: 1, price: 10.00 }
          ],
          createdAt: new Date(),
          formattedCreatedAt: format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })
        },
        {
          id: 'ord_123457',
          orderNumber: 'CMD-2025-002',
          customer: { name: 'Marie Martin', email: 'marie@example.com' },
          status: 'DELIVERED',
          totalAmount: 249.99,
          formattedTotal: '249,99 DT',
          paymentStatus: 'PAID',
          items: [
            { id: '1', productName: 'Ordinateur portable', quantity: 1, price: 249.99 }
          ],
          createdAt: new Date(Date.now() - 86400000), // Hier
          formattedCreatedAt: format(new Date(Date.now() - 86400000), 'dd MMMM yyyy à HH:mm', { locale: fr })
        },
        {
          id: 'ord_123458',
          orderNumber: 'CMD-2025-003',
          customer: { name: 'Pierre Dubois', email: 'pierre@example.com' },
          status: 'PROCESSING',
          totalAmount: 59.97,
          formattedTotal: '59,97 DT',
          paymentStatus: 'PENDING',
          items: [
            { id: '1', productName: 'T-shirt', quantity: 3, price: 19.99 }
          ],
          createdAt: new Date(Date.now() - 172800000), // Avant-hier
          formattedCreatedAt: format(new Date(Date.now() - 172800000), 'dd MMMM yyyy à HH:mm', { locale: fr })
        }
      ];
      
      setOrders(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (orders) => {
    return orders.filter(order => {
      // Filtre par statut
      if (filters.status && order.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche (numéro de commande ou nom du client)
      if (filters.search && 
         !(order.orderNumber?.toLowerCase().includes(filters.search.toLowerCase()) || 
           order.customer?.name?.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const orderDate = new Date(order.createdAt);
        if (orderDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const orderDate = new Date(order.createdAt);
        if (orderDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les commandes en CSV
  const exportToCSV = () => {
    try {
      const headers = ['Numéro de commande', 'Client', 'Email', 'Date', 'Statut', 'Paiement', 'Montant'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredOrders.forEach(order => {
        const row = [
          `"${order.orderNumber}"`,
          `"${order.customer?.name || ''}"`,
          `"${order.customer?.email || ''}"`,
          `"${order.formattedCreatedAt}"`,
          `"${getStatusLabel(order.status)}"`,
          `"${getPaymentStatusLabel(order.paymentStatus)}"`,
          `"${order.formattedTotal}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `commandes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export CSV réussi');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PROCESSING': return 'En traitement';
      case 'SHIPPED': return 'Expédiée';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  // Obtenir le libellé du statut de paiement
  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'REFUNDED': return 'Remboursé';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir la couleur du badge selon le statut de paiement
  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 mr-1" />;
      case 'PROCESSING': return <RefreshCw className="h-4 w-4 mr-1" />;
      case 'SHIPPED': return <ShoppingBag className="h-4 w-4 mr-1" />;
      case 'DELIVERED': return <Check className="h-4 w-4 mr-1" />;
      case 'CANCELLED': return <X className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const filteredOrders = applyFilters(orders);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Veuillez vous connecter pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Gestion des Commandes" 
        subtitle={user.role === 'ADMIN' ? "Gérez toutes les commandes de la plateforme" : "Gérez vos commandes"}
      />
      
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={fetchOrders}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {orders.length} commandes
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrées: {filteredOrders.length} commandes
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status">Statut</label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="PROCESSING">En traitement</option>
                  <option value="SHIPPED">Expédiée</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="search">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="N° commande ou client..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFrom">Date de début</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateTo">Date de fin</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="md:col-span-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="flex items-center"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center">
                        Numéro
                        <ArrowUpDown 
                          className="ml-2 h-4 w-4 cursor-pointer" 
                          onClick={() => {
                            // Simple sorting logic could be implemented here
                            const sorted = [...filteredOrders].sort((a, b) => 
                              a.orderNumber.localeCompare(b.orderNumber)
                            );
                            setOrders(sorted);
                          }}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left">Client</th>
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Paiement</th>
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center">
                        Montant
                        <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Aucune commande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">{order.orderNumber}</td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.customer?.email || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4">{order.formattedCreatedAt}</td>
                        <td className="px-4 py-4">
                          <Badge className={getStatusBadgeClass(order.status)}>
                            <div className="flex items-center">
                              {getStatusIcon(order.status)}
                              {getStatusLabel(order.status)}
                            </div>
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={getPaymentStatusBadgeClass(order.paymentStatus)}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-medium">{order.formattedTotal}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="outline" size="icon" title="Voir les détails">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
