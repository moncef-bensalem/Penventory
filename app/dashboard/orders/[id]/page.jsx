'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
  Store,
  Calendar,
  FileText,
  Download,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const id = params.id;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des détails de la commande');
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRMEE': return 'Confirmée';
      case 'EN_PREPARATION': return 'En préparation';
      case 'PROCESSING': return 'En préparation';
      case 'EXPEDIEE': return 'Expédiée';
      case 'SHIPPED': return 'Expédiée';
      case 'LIVREE': return 'Livrée';
      case 'DELIVERED': return 'Livrée';
      case 'ANNULEE': return 'Annulée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
      case 'EN_ATTENTE':
        return <Clock className="h-5 w-5 mr-2" />;
      case 'CONFIRMEE':
      case 'EN_PREPARATION':
      case 'PROCESSING':
        return <Package className="h-5 w-5 mr-2" />;
      case 'EXPEDIEE':
      case 'SHIPPED':
        return <Truck className="h-5 w-5 mr-2" />;
      case 'LIVREE':
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'ANNULEE':
      case 'CANCELLED':
        return <Clock className="h-5 w-5 mr-2" />;
      default:
        return <Package className="h-5 w-5 mr-2" />;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMEE':
      case 'EN_PREPARATION':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPEDIEE':
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LIVREE':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ANNULEE':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Exporter la commande en PDF (simulation)
  const exportToPDF = () => {
    toast('Export PDF en cours de développement', {
      icon: '📄',
      duration: 3000
    });
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <PageHead 
          title="Détails de la commande" 
          subtitle="Erreur lors du chargement des détails"
        />
        
        <div className="p-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/orders')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux commandes
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-xl font-medium text-red-600 mb-2">Erreur</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/dashboard/orders')}
            >
              Retour aux commandes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <PageHead 
          title="Détails de la commande" 
          subtitle="Commande introuvable"
        />
        
        <div className="p-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/orders')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux commandes
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Commande introuvable</h3>
            <p className="text-gray-600 dark:text-gray-400">La commande que vous recherchez n'existe pas ou vous n'avez pas les droits pour y accéder.</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/dashboard/orders')}
            >
              Retour aux commandes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title={`Commande ${order.number}`} 
        subtitle="Détails de la commande"
      />
      
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/orders')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux commandes
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={exportToPDF}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Détails de la commande</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">Numéro de commande</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{order.number}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">Date de commande</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.createdAt ? 
                        format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr }) :
                        'Date inconnue'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Package className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">Statut</span>
                    </div>
                    <Badge className={getStatusBadgeClass(order.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">Paiement</span>
                    </div>
                    <Badge className={getPaymentStatusBadgeClass(order.paymentStatus)}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Badge>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Articles commandés</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Produit</th>
                        <th className="px-4 py-2 text-right">Prix unitaire</th>
                        <th className="px-4 py-2 text-right">Quantité</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                {item.product && item.product.image ? (
                                  <div className="w-12 h-12 relative mr-3 rounded overflow-hidden">
                                    <Image 
                                      src={item.product.image} 
                                      alt={item.product.name} 
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded mr-3 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{item.product?.name || 'Produit inconnu'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              {new Intl.NumberFormat('fr-FR', { 
                                style: 'currency', 
                                currency: 'TND' 
                              }).format(item.price || 0)}
                            </td>
                            <td className="px-4 py-4 text-right">{item.quantity || 1}</td>
                            <td className="px-4 py-4 text-right font-medium">
                              {new Intl.NumberFormat('fr-FR', { 
                                style: 'currency', 
                                currency: 'TND' 
                              }).format((item.price || 0) * (item.quantity || 1))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            Aucun article trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan="3" className="px-4 py-4 text-right font-medium">Total</td>
                        <td className="px-4 py-4 text-right font-bold">
                          {new Intl.NumberFormat('fr-FR', { 
                            style: 'currency', 
                            currency: 'TND' 
                          }).format(order.total || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informations client et livraison */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Informations client</h2>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Client</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.customer?.name || 'Nom non disponible'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.customer?.email || 'Email non disponible'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Téléphone</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.customer?.phone || 'Téléphone non disponible'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">Adresse de livraison</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shippingAddress?.address || 'Adresse non disponible'}<br />
                    {order.shippingAddress?.postalCode || ''} {order.shippingAddress?.city || ''}<br />
                    {order.shippingAddress?.country || 'Pays non disponible'}
                  </p>
                </div>
              </div>
            </div>
            
            {order.store && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Magasin</h2>
                  
                  <div className="flex items-center mb-4">
                    {order.store.logo ? (
                      <div className="w-12 h-12 relative mr-3 rounded overflow-hidden">
                        <Image 
                          src={order.store.logo} 
                          alt={order.store.name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded mr-3 flex items-center justify-center">
                        <Store className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{order.store.name || 'Magasin inconnu'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 