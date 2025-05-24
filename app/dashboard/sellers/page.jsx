'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye,
  Filter, 
  RefreshCw,
  Download,
  Mail,
  User,
  Calendar,
  ArrowUpDown,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  Check,
  X,
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SellersPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Récupérer les vendeurs
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching sellers...');
      fetchSellers();
    }
  }, [user]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      console.log('Fetching sellers...');
      
      let mockDataUsed = false;
      
      try {
        console.log('Trying sellers admin API route...');
        const response = await fetch('/api/admin/sellers', {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        // Pour le debug uniquement
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body preview:', responseText.substring(0, 200) + '...');
        
        // Convertir le texte en JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing response as JSON:', parseError);
          throw new Error('Format de réponse invalide');
        }
        
        // Vérifier les données
        if (!data) {
          throw new Error('Données manquantes dans la réponse');
        }
        
        // Vérifier si le serveur a renvoyé une erreur dans la réponse 200
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Vérifier si sellers est présent et est un tableau
        if (!Array.isArray(data.sellers)) {
          console.warn('Sellers n\'est pas un tableau ou est manquant:', data);
          data.sellers = [];
        }
        
        // S'il n'y a pas de vendeurs, utiliser les données mockées
        if (data.sellers.length === 0) {
          throw new Error('Aucun vendeur trouvé');
        }
        
        // Transformer les données pour l'affichage
        const formattedSellers = data.sellers.map(seller => {
          try {
            return {
              id: seller.id || `id-${Math.random().toString(36).substr(2, 9)}`,
              name: seller.name || 'Sans nom',
              email: seller.email || '',
              phone: seller.phone || '',
              emailVerified: Boolean(seller.emailVerified),
              image: seller.image || '',
              createdAt: seller.createdAt || new Date(),
              formattedCreatedAt: format(new Date(seller.createdAt || new Date()), 'dd MMMM yyyy', { locale: fr }),
              storeStatus: seller.store?.status || 'PENDING',
              storeName: seller.store?.name || 'Aucun magasin',
              storeId: seller.store?.id || '',
              storeIsApproved: Boolean(seller.store?.isApproved),
              productsCount: Number(seller.store?.productsCount || 0),
              ordersCount: Number(seller.store?.orders || 0),
              completedOrdersCount: Number(seller.store?.completedOrders || 0),
              totalRevenue: Number(seller.store?.revenue || 0),
              formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(
                Number(seller.store?.revenue || 0)
              ),
              store: seller.store
            };
          } catch (formatError) {
            console.error('Error formatting seller:', formatError, seller);
            return {
              id: seller.id || `id-${Math.random().toString(36).substr(2, 9)}`,
              name: 'Erreur de formatage',
              email: '',
              formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
              storeStatus: 'ERROR',
              storeName: 'Erreur',
              productsCount: 0,
              totalRevenue: 0,
              formattedTotalRevenue: '0 TND',
              store: null
            };
          }
        });
        
        setSellers(formattedSellers);
        console.log('Sellers fetched successfully:', formattedSellers.length);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        mockDataUsed = true;
        
        // Utiliser des données mockées en cas d'erreur
        console.log('Using mock data due to API error');
        const mockSellers = [
          {
            id: 'mock-1',
            name: 'Ahmed Ben Ali',
            email: 'ahmed@example.com',
            phone: '+216 12 345 678',
            emailVerified: true,
            formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
            storeStatus: 'ACTIVE',
            storeName: 'Librairie Centrale',
            storeId: 'store-1',
            storeIsApproved: true,
            productsCount: 125,
            ordersCount: 48,
            completedOrdersCount: 43,
            totalRevenue: 12580,
            formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(12580),
            store: {
              id: 'store-1',
              name: 'Librairie Centrale',
              status: 'ACTIVE',
              isApproved: true
            }
          },
          {
            id: 'mock-2',
            name: 'Sonia Mansour',
            email: 'sonia@example.com',
            phone: '+216 23 456 789',
            emailVerified: true,
            formattedCreatedAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
            storeStatus: 'ACTIVE',
            storeName: 'Papeterie Express',
            storeId: 'store-2',
            storeIsApproved: true,
            productsCount: 78,
            ordersCount: 25,
            completedOrdersCount: 22,
            totalRevenue: 8450,
            formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(8450),
            store: {
              id: 'store-2',
              name: 'Papeterie Express',
              status: 'ACTIVE',
              isApproved: true
            }
          },
          {
            id: 'mock-3',
            name: 'Karim Mejri',
            email: 'karim@example.com',
            phone: '+216 34 567 890',
            emailVerified: false,
            formattedCreatedAt: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
            storeStatus: 'PENDING',
            storeName: 'Tech School Supplies',
            storeId: 'store-3',
            storeIsApproved: false,
            productsCount: 42,
            ordersCount: 0,
            completedOrdersCount: 0,
            totalRevenue: 0,
            formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(0),
            store: {
              id: 'store-3',
              name: 'Tech School Supplies',
              status: 'PENDING',
              isApproved: false
            }
          }
        ];
        
        setSellers(mockSellers);
        toast.error(`Erreur: ${error.message}. Affichage des données de démonstration.`);
      }
    } catch (error) {
      console.error('Fatal error in fetchSellers:', error);
      toast.error(`Erreur fatale: ${error.message}`);
      
      // Assurer qu'aucune erreur ne remonte plus haut
      setSellers([]);
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
  const applyFilters = (sellers) => {
    return sellers.filter(seller => {
      // Filtre par statut
      if (filters.status && seller.storeStatus !== filters.status) {
        return false;
      }
      
      // Filtre par recherche (nom, email ou téléphone)
      if (filters.search && 
         !(seller.name?.toLowerCase().includes(filters.search.toLowerCase()) || 
           seller.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
           seller.phone?.includes(filters.search))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const sellerDate = new Date(seller.createdAt);
        if (sellerDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const sellerDate = new Date(seller.createdAt);
        if (sellerDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les vendeurs en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Statut', 'Email vérifié', 'Date d\'inscription', 'Magasin', 'Produits', 'Chiffre d\'affaires'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredSellers.forEach(seller => {
        const row = [
          `"${seller.id}"`,
          `"${seller.name || ''}"`,
          `"${seller.email || ''}"`,
          `"${seller.phone || ''}"`,
          `"${getStatusLabel(seller.storeStatus)}"`,
          `"${seller.emailVerified ? 'Oui' : 'Non'}"`,
          `"${seller.formattedCreatedAt}"`,
          `"${seller.store?.name || 'Aucun magasin'}"`,
          `"${seller.store?.productsCount || 0}"`,
          `"${seller.formattedTotalRevenue}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vendeurs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      case 'ACTIVE': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'SUSPENDED': return 'Suspendu';
      case 'BANNED': return 'Banni';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-200';
      case 'BANNED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <Check className="h-4 w-4 mr-1" />;
      case 'PENDING': return <Calendar className="h-4 w-4 mr-1" />;
      case 'SUSPENDED': return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'BANNED': return <X className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const columns = [
    {
      id: "name",
      header: "Nom",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Statut",
      accessorKey: "store.status",
      cell: ({ row }) => {
        const status = row.original.store?.status || 'PENDING';
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusBadgeClass(status)}`} />
            <span className={getStatusBadgeClass(status)}>
              {getStatusLabel(status)}
            </span>
          </div>
        );
      },
    },
    {
      id: "emailVerified",
      header: "Email",
      accessorKey: "emailVerified",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.emailVerified ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Vérifié</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-500">Non vérifié</span>
            </>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Date d'inscription",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      id: "storeName",
      header: "Magasin",
      accessorKey: "store.name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.store?.name || 'Non créé'}
        </div>
      ),
    },
    {
      id: "productCount",
      header: "Produits",
      accessorKey: "store.products",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.store?.products?.length || 0} produits
        </div>
      ),
    },
    {
      id: "revenue",
      header: "Revenus",
      accessorKey: "store.revenue",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.store?.revenue?.toFixed(2) || '0.00'} TND
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSendEmail(row.original)}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleApprove(row.original)}
            disabled={row.original.store?.status === 'APPROVED'}
          >
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleReject(row.original)}
            disabled={row.original.store?.status === 'REJECTED'}
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredSellers = applyFilters(sellers);

  // Approuver un vendeur
  const handleApprove = async (seller) => {
    try {
      // Vérifier si le vendeur a un abonnement actif
      const response = await fetch(`/api/admin/sellers/${seller.id}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails du vendeur");
      }
      
      const data = await response.json();
      
      // Vérifier si l'abonnement est expiré
      const latestSubscription = data.subscriptions && data.subscriptions.length > 0 ? data.subscriptions[0] : null;
      if (latestSubscription) {
        const expirationDate = new Date(latestSubscription.expiresAt);
        const currentDate = new Date();
        const isExpired = expirationDate < currentDate;
        
        if (isExpired) {
          toast.error("Ce vendeur a un abonnement expiré. Il doit renouveler son abonnement avant de pouvoir être approuvé.");
          return;
        }
      } else {
        if (!confirm("Ce vendeur n'a pas d'abonnement actif. Voulez-vous vraiment l'approuver?")) {
          return;
        }
      }
      
      // Continuer avec l'approbation si l'abonnement est valide
      setSelectedSellerId(seller.id);
      setSelectedAction('approve');
      setDialogOpen(true);
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error);
      toast.error("Erreur lors de la vérification de l'abonnement. Veuillez réessayer.");
    }
  };
  
  // Rejeter un vendeur
  const handleReject = async (seller) => {
    if (confirm("Êtes-vous sûr de vouloir rejeter ce vendeur?")) {
      try {
        setIsLoading(true);
        console.log("Rejet du vendeur:", seller.id);
        
        // Implémenter l'API de rejet
        const response = await fetch(`/api/admin/reject-seller`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: seller.email }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Erreur lors du rejet du vendeur");
        }
        
        toast.success("Vendeur rejeté avec succès");
        // Rafraîchir les données
        fetchSellers();
      } catch (error) {
        console.error("Erreur lors du rejet:", error);
        toast.error(error.message || "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Envoyer un email
  const handleSendEmail = (seller) => {
    // Pour l'instant, ouvrir simplement l'application email par défaut
    window.location.href = `mailto:${seller.email}?subject=Information importante concernant votre compte vendeur`;
  };
  
  // Voir les détails
  const handleViewDetails = (seller) => {
    router.push(`/dashboard/sellers/${seller.id}`);
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

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Gestion des Vendeurs" 
        subtitle="Consultez et gérez les vendeurs de la plateforme"
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
              onClick={fetchSellers}
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
              Total: {sellers.length} vendeurs
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredSellers.length} vendeurs
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="PENDING">En attente</option>
                  <option value="SUSPENDED">Suspendu</option>
                  <option value="BANNED">Banni</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Nom, email ou téléphone..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'inscription depuis
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'inscription jusqu'à
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
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
          <DataTable 
            columns={columns} 
            data={filteredSellers}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
}
