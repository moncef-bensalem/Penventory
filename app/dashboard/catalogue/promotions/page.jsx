'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Search,
  Store,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PromotionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    seller: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les promotions
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching promotions...');
      fetchPromotions();
    }
  }, [user]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      console.log('Fetching promotions...');
      
      // Essayer la route API des promotions administrateur
      try {
        console.log('Trying promotions admin API route...');
        const response = await fetch('/api/admin/promotions-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.promotions)) {
          throw new Error('Format de données invalide');
        }
        
        // Transformer les données pour l'affichage
        const formattedPromotions = data.promotions.map(promotion => {
          try {
            const startDate = promotion.startDate ? new Date(promotion.startDate) : new Date();
            const endDate = promotion.endDate ? new Date(promotion.endDate) : new Date();
            
            return {
              ...promotion,
              status: promotion.status || (endDate > new Date() ? 'active' : 'expired'),
              formattedStartDate: format(startDate, 'dd MMM yyyy', { locale: fr }),
              formattedEndDate: format(endDate, 'dd MMM yyyy', { locale: fr }),
              sellerName: promotion.store?.seller?.name || 'Global',
              storeName: promotion.store?.name || 'Tous les magasins', 
              ordersCount: promotion.usage?.ordersCount || 0
            };
          } catch (formatError) {
            console.error('Error formatting promotion:', formatError, promotion);
            return {
              id: promotion.id || 'unknown',
              code: promotion.code || 'ERROR',
              type: promotion.type || 'UNKNOWN',
              status: 'error',
              formattedStartDate: 'N/A',
              formattedEndDate: 'N/A',
              sellerName: 'Erreur de format',
              storeName: 'Erreur de format',
              ordersCount: 0
            };
          }
        });
        
        setPromotions(formattedPromotions);
        
        // Stocker les statistiques si elles sont disponibles
        if (data.stats) {
          setStats(data.stats);
        }
        
        console.log('Promotions fetched successfully:', formattedPromotions.length);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        
        // Utiliser des données mockées en cas d'erreur
        console.log('Using mock data due to API error');
        const mockPromotions = [
          {
            id: 'mock-1',
            code: 'WELCOME10',
            type: 'PERCENTAGE',
            value: 10,
            minPurchase: 0,
            status: 'active',
            description: 'Promotion de bienvenue',
            formattedStartDate: format(new Date(), 'dd MMM yyyy', { locale: fr }),
            formattedEndDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd MMM yyyy', { locale: fr }),
            sellerName: 'Global',
            storeName: 'Tous les magasins',
            ordersCount: 15
          },
          {
            id: 'mock-2',
            code: 'SUMMER25',
            type: 'PERCENTAGE',
            value: 25,
            minPurchase: 100,
            status: 'active',
            description: 'Promotion d\'été',
            formattedStartDate: format(new Date(), 'dd MMM yyyy', { locale: fr }),
            formattedEndDate: format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'dd MMM yyyy', { locale: fr }),
            sellerName: 'Librairie Centrale',
            storeName: 'Librairie Centrale',
            ordersCount: 8
          },
          {
            id: 'mock-3',
            code: 'FIXED20',
            type: 'FIXED',
            value: 20,
            minPurchase: 150,
            status: 'expired',
            description: 'Remise fixe',
            formattedStartDate: format(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), 'dd MMM yyyy', { locale: fr }),
            formattedEndDate: format(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 'dd MMM yyyy', { locale: fr }),
            sellerName: 'Papeterie Express',
            storeName: 'Papeterie Express',
            ordersCount: 12
          }
        ];
        
        setPromotions(mockPromotions);
        setStats({
          total: mockPromotions.length,
          activeCount: mockPromotions.filter(p => p.status === 'active').length,
          expiredCount: mockPromotions.filter(p => p.status === 'expired').length,
          storeCount: 2
        });
        
        toast.error("Erreur de connexion à l'API. Affichage des données de démonstration.");
      }
    } catch (error) {
      console.error('Fatal error fetching promotions:', error);
      toast.error(error.message || 'Erreur lors de la récupération des promotions');
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      seller: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (promotions) => {
    return promotions.filter(promotion => {
      // Filtre par statut
      if (filters.status && promotion.status !== filters.status) {
        return false;
      }
      
      // Filtre par vendeur
      if (filters.seller && promotion.store?.seller?.id !== filters.seller) {
        return false;
      }
      
      // Filtre par recherche
      if (filters.search && 
         !promotion.code.toLowerCase().includes(filters.search.toLowerCase()) && 
         !promotion.description.toLowerCase().includes(filters.search.toLowerCase()) &&
         !promotion.sellerName.toLowerCase().includes(filters.search.toLowerCase()) &&
         !promotion.storeName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const columns = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-medium flex items-center">
          <Tag className="h-4 w-4 mr-2 text-orange-500" />
          <span className="font-mono">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant="outline">
            {type === 'PERCENTAGE' ? 'Pourcentage' : 'Montant fixe'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Valeur",
      cell: ({ row }) => {
        const type = row.original.type;
        const value = row.original.value;
        return type === 'PERCENTAGE' 
          ? `${value}%` 
          : `${value.toFixed(2)} DT`;
      },
    },
    {
      accessorKey: "storeName",
      header: "Magasin",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Store className="h-4 w-4 mr-2 text-orange-500" />
          <span>{row.original.storeName}</span>
        </div>
      ),
    },
    {
      accessorKey: "sellerName",
      header: "Vendeur",
      cell: ({ row }) => (
        <span>{row.original.sellerName}</span>
      ),
    },
    {
      accessorKey: "formattedEndDate",
      header: "Expiration",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span>{row.original.formattedEndDate}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return status === 'active' ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Actif</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <XCircle className="h-4 w-4 mr-1" />
            <span>Expiré</span>
          </div>
        );
      },
    },
    {
      accessorKey: "ordersCount",
      header: "Utilisations",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.ordersCount} commandes
        </Badge>
      ),
    }
  ];

  const filteredPromotions = applyFilters(promotions);

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
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <PageHead 
        title="Gestion des Promotions" 
        description="Visualiser toutes les promotions créées par les vendeurs"
      >
        <Button 
          onClick={fetchPromotions} 
          variant="outline" 
          size="sm" 
          className="ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </PageHead>
      
      {stats && (
        <div className="mt-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total des promotions</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Promotions actives</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeCount}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Promotions expirées</div>
            <div className="text-2xl font-bold text-orange-600">{stats.expiredCount}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Nombre de magasins</div>
            <div className="text-2xl font-bold text-blue-600">{stats.storeCount}</div>
          </div>
        </div>
      )}
      
      <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              Total: {promotions.length} promotions
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">
              Actives: {promotions.filter(p => p.status === 'active').length}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-normal">
              Expirées: {promotions.filter(p => p.status === 'expired').length}
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Code, description, vendeur..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
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
            data={filteredPromotions} 
            searchKey="code"
            loading={loading}
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              Total: {filteredPromotions.length} promotions
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                Actives: {filteredPromotions.filter(p => p.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">
                Expirées: {filteredPromotions.filter(p => p.status === 'expired').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 