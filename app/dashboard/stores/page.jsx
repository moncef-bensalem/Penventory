'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle,
  Pencil,
  Trash2,
  Filter, 
  RefreshCw,
  Download,
  Store,
  Search,
  Calendar,
  ArrowUpDown,
  MapPin,
  Phone,
  Mail,
  User,
  Check,
  X,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StoresPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les magasins
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching stores...');
      fetchStores();
    }
  }, [user]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      console.log('Fetching stores...');
      
      let mockDataUsed = false;
      
      try {
        console.log('Trying stores admin API route...');
        const response = await fetch('/api/admin/stores', {
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
        
        // Vérifier si stores est présent et est un tableau
        if (!Array.isArray(data.stores)) {
          console.warn('Stores n\'est pas un tableau ou est manquant:', data);
          data.stores = [];
        }
        
        // S'il n'y a pas de magasins, utiliser les données mockées
        if (data.stores.length === 0) {
          throw new Error('Aucun magasin trouvé');
        }
        
        // Transformer les données pour l'affichage
        const formattedStores = data.stores.map(store => {
          try {
            return {
              id: store.id || `id-${Math.random().toString(36).substr(2, 9)}`,
              name: store.name || 'Sans nom',
              description: store.description || '',
              logo: store.logo || '',
              banner: store.banner || '',
              address: store.address || '',
              phone: store.phone || '',
              email: store.email || '',
              website: store.website || '',
              facebook: store.facebook || '',
              instagram: store.instagram || '',
              rating: store.rating || 0,
              isApproved: store.isApproved ?? false,
              createdAt: store.createdAt || new Date(),
              updatedAt: store.updatedAt || new Date(),
              formattedCreatedAt: format(new Date(store.createdAt || new Date()), 'dd MMMM yyyy', { locale: fr }),
              productsCount: store.productsCount || 0,
              categoriesCount: store.categoriesCount || 0,
              ordersCount: store.ordersCount || 0,
              totalRevenue: store.totalRevenue || 0,
              formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(store.totalRevenue || 0),
              owner: store.owner ? {
                id: store.owner.id || '',
                name: store.owner.name || 'Propriétaire inconnu',
                email: store.owner.email || '',
                image: store.owner.image || '',
                role: store.owner.role || 'USER'
              } : null
            };
          } catch (formatError) {
            console.error('Error formatting store:', formatError, store);
            return {
              id: store.id || `id-${Math.random().toString(36).substr(2, 9)}`,
              name: 'Erreur de formatage',
              description: '',
              formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
              productsCount: 0,
              categoriesCount: 0,
              ordersCount: 0,
              totalRevenue: 0,
              formattedTotalRevenue: '0 TND',
              owner: null
            };
          }
        });
        
        setStores(formattedStores);
        console.log('Stores fetched successfully:', formattedStores.length);
      } catch (error) {
        console.error('Error fetching stores:', error);
        mockDataUsed = true;
        
        // Utiliser des données mockées en cas d'erreur
        console.log('Using mock data due to API error');
        const mockStores = [
          {
            id: 'mock-1',
            name: 'Librairie Centrale',
            description: 'Magasin spécialisé dans les livres et fournitures scolaires',
            logo: '',
            address: '123 Rue des Livres, Tunis',
            phone: '+216 12 345 678',
            email: 'contact@librairie-centrale.tn',
            isApproved: true,
            formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
            productsCount: 125,
            categoriesCount: 8,
            ordersCount: 43,
            totalRevenue: 12580,
            formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(12580),
            owner: {
              id: 'user-1',
              name: 'Ahmed Ben Ali',
              email: 'ahmed@example.com'
            }
          },
          {
            id: 'mock-2',
            name: 'Papeterie Express',
            description: 'Fournitures de bureau et papeterie pour professionnels et particuliers',
            logo: '',
            address: '45 Avenue Habib Bourguiba, Sousse',
            phone: '+216 23 456 789',
            email: 'info@papeterie-express.tn',
            isApproved: true,
            formattedCreatedAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
            productsCount: 78,
            categoriesCount: 5,
            ordersCount: 22,
            totalRevenue: 8450,
            formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(8450),
            owner: {
              id: 'user-2',
              name: 'Sonia Mansour',
              email: 'sonia@example.com'
            }
          },
          {
            id: 'mock-3',
            name: 'Tech School Supplies',
            description: 'Matériel informatique et fournitures technologiques pour étudiants',
            logo: '',
            address: '78 Rue de la Technologie, Sfax',
            phone: '+216 34 567 890',
            email: 'contact@techschool.tn',
            isApproved: false,
            formattedCreatedAt: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
            productsCount: 42,
            categoriesCount: 3,
            ordersCount: 0,
            totalRevenue: 0,
            formattedTotalRevenue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(0),
            owner: {
              id: 'user-3',
              name: 'Karim Mejri',
              email: 'karim@example.com'
            }
          }
        ];
        
        setStores(mockStores);
        toast.error(`Erreur: ${error.message}. Affichage des données de démonstration.`);
      }
    } catch (error) {
      console.error('Fatal error in fetchStores:', error);
      toast.error(`Erreur fatale: ${error.message}`);
      
      // Assurer qu'aucune erreur ne remonte plus haut
      setStores([]);
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
  const applyFilters = (stores) => {
    return stores.filter(store => {
      // Filtre par statut
      if (filters.status && store.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche (nom, description, email ou téléphone)
      if (filters.search && 
         !(store.name?.toLowerCase().includes(filters.search.toLowerCase()) || 
           store.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
           store.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
           store.phone?.includes(filters.search))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const storeDate = new Date(store.createdAt);
        if (storeDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const storeDate = new Date(store.createdAt);
        if (storeDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les magasins en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Nom', 'Description', 'Propriétaire', 'Email', 'Téléphone', 'Adresse', 'Statut', 'Date de création', 'Produits', 'Commandes', 'Chiffre d\'affaires'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredStores.forEach(store => {
        const row = [
          `"${store.id}"`,
          `"${store.name || ''}"`,
          `"${store.description || ''}"`,
          `"${store.owner?.name || ''}"`,
          `"${store.email || ''}"`,
          `"${store.phone || ''}"`,
          `"${store.address || ''}"`,
          `"${getStatusLabel(store.status)}"`,
          `"${store.formattedCreatedAt}"`,
          `"${store.productsCount}"`,
          `"${store.ordersCount}"`,
          `"${store.formattedTotalRevenue}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `magasins_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <Check className="h-4 w-4 mr-1" />;
      case 'PENDING': return <Calendar className="h-4 w-4 mr-1" />;
      case 'SUSPENDED': return <X className="h-4 w-4 mr-1" />;
      case 'CLOSED': return <X className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Supprimer un magasin
  const handleDeleteStore = async (storeId, storeName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible.
      Nom du magasin: ${storeName}`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression du magasin');
      }
      
      toast.success('Magasin supprimé avec succès');
      fetchStores(); // Rafraîchir la liste
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error(error.message || 'Erreur lors de la suppression du magasin');
    }
  };

  // Changer le statut d'approbation d'un magasin
  const handleToggleApproval = async (storeId, currentStatus, storeName) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'approuver' : 'désapprouver';
    
    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} ce magasin ?
      Nom du magasin: ${storeName}`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: newStatus
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur lors de la modification du statut du magasin`);
      }
      
      toast.success(`Magasin ${newStatus ? 'approuvé' : 'désapprouvé'} avec succès`);
      fetchStores(); // Rafraîchir la liste
    } catch (error) {
      console.error('Error toggling store approval:', error);
      toast.error(error.message || `Erreur lors de la modification du statut du magasin`);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center">
          Nom
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center">
            <Store className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-gray-500 max-w-xs truncate">{row.original.description}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "owner.name",
      header: "Propriétaire",
      cell: ({ row }) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          <div>
            <div>{row.original.owner?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{row.original.owner?.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={getStatusBadgeClass(status)}>
            <div className="flex items-center">
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "formattedCreatedAt",
      header: ({ column }) => (
        <div className="flex items-center">
          Création
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      accessorKey: "productsCount",
      header: ({ column }) => (
        <div className="flex items-center">
          Produits
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.productsCount}
        </Badge>
      ),
    },
    {
      accessorKey: "formattedTotalRevenue",
      header: ({ column }) => (
        <div className="flex items-center">
          Chiffre d'affaires
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.formattedTotalRevenue}</div>
      ),
    },
    {
      accessorKey: "isApproved",
      header: "Approbation",
      cell: ({ row }) => {
        const isApproved = row.original.isApproved;
        return (
          <Badge className={isApproved 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-yellow-100 text-yellow-800 border-yellow-200"
          }>
            <div className="flex items-center">
              {isApproved 
                ? <Check className="h-4 w-4 mr-1" /> 
                : <X className="h-4 w-4 mr-1" />
              }
              {isApproved ? 'Approuvé' : 'En attente'}
            </div>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const store = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/stores/${store.id}`}>
              <Button variant="outline" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/stores/update/${store.id}`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant={store.isApproved ? "destructive" : "success"} 
              size="icon"
              onClick={() => handleToggleApproval(store.id, store.isApproved, store.name)}
              title={store.isApproved ? "Désapprouver" : "Approuver"}
            >
              {store.isApproved 
                ? <X className="h-4 w-4" /> 
                : <Check className="h-4 w-4" />
              }
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => handleDeleteStore(store.id, store.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredStores = applyFilters(stores);

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
        title="Gestion des Magasins" 
        subtitle="Consultez et gérez les magasins de la plateforme"
        linkTitle="Nouveau magasin"
        route="/dashboard/stores/new"
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
              onClick={fetchStores}
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
              Total: {stores.length} magasins
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredStores.length} magasins
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
                  <option value="CLOSED">Fermé</option>
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
                    placeholder="Nom, description, email..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de création depuis
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
                  Date de création jusqu'à
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
            data={filteredStores}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
}
