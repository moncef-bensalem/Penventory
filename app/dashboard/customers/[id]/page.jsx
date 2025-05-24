'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  CreditCard, 
  Download,
  User,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);
  const id = params.id;

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/customers/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des détails du client');
        }
        
        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMEE': 'bg-blue-100 text-blue-800',
      'EN_PREPARATION': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'EXPEDIEE': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'LIVREE': 'bg-green-100 text-green-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'ANNULEE': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-gray-100 text-gray-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusLabel = (status) => {
    const statusLabels = {
      'PAID': 'Payée',
      'PENDING': 'En attente',
      'FAILED': 'Échouée',
      'REFUNDED': 'Remboursée'
    };
    
    return statusLabels[status] || status;
  };

  const handleBack = () => {
    router.push('/dashboard/customers');
  };

  const handleSendEmail = () => {
    if (customer?.email) {
      window.location.href = `mailto:${customer.email}`;
    } else {
      toast.error('Adresse email non disponible');
    }
  };

  const handleExportPDF = () => {
    toast('Export PDF en cours de développement', { icon: '📄', duration: 3000 });
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-red-500 text-xl mb-4">Accès non autorisé</div>
        <div className="text-gray-600 dark:text-gray-400 mb-4">Cette page est réservée aux administrateurs.</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retour
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-red-500 text-xl mb-4">Erreur</div>
        <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retour
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400 text-xl mb-4">Client introuvable</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* En-tête de la page */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold dark:text-white">Détails du client</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" />
            Envoyer un email
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Download className="h-4 w-4" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Informations du client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Informations personnelles</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Nom</div>
                <div className="font-medium dark:text-white">{customer.name}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                <div className="font-medium dark:text-white">{customer.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Téléphone</div>
                <div className="font-medium dark:text-white">{customer.phone}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Date d'inscription</div>
                <div className="font-medium dark:text-white">{formatDate(customer.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Statistiques</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Nombre de commandes</div>
                <div className="font-medium dark:text-white">{customer.orders.length}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total dépensé</div>
                <div className="font-medium dark:text-white">
                  {formatPrice(customer.orders.reduce((total, order) => total + Number(order.total), 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des commandes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Historique des commandes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customer.orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="text-primary hover:text-primary/80 dark:hover:text-primary/60"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
              {customer.orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 