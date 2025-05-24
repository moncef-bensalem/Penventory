'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
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
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Récupérer les clients
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching customers...');
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers...');
      
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Customers response status:', response.status);
      
      // Gérer les cas d'erreur HTTP
      if (response.status === 403) {
        throw new Error('Vous n\'êtes pas autorisé à accéder à cette ressource');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Erreur inconnue' };
        }
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des clients');
      }
      
      // Récupérer le texte brut de la réponse pour vérifier
      const responseText = await response.text();
      console.log('Response text length:', responseText.length);
      
      let data;
      try {
        // Essayer de parser la réponse JSON
        data = JSON.parse(responseText);
        console.log('Customers parsed successfully:', Array.isArray(data) ? data.length : 'not an array');
      } catch (error) {
        console.error('JSON parsing error:', error);
        throw new Error(`Erreur de format de données: ${error.message}`);
      }
      
      // S'assurer que les données sont valides
      if (!data) {
        console.error('No data received');
        throw new Error('Aucune donnée reçue');
      }
      
      if (!Array.isArray(data)) {
        console.error('Invalid customers data format (not an array):', data);
        // Si les données sont un objet avec une propriété contenante des données
        if (data.customers && Array.isArray(data.customers)) {
          data = data.customers;
          console.log('Using nested customers array, length:', data.length);
        } else {
          throw new Error('Format de données de clients invalide (pas un tableau)');
        }
      }
      
      // Transformer les données pour l'affichage
      const formattedCustomers = data.map(customer => ({
        ...customer,
        formattedCreatedAt: format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: fr }),
        ordersCount: customer.orders?.length || 0,
        totalSpent: customer.orders?.reduce((total, order) => total + (order.totalAmount || 0), 0) || 0,
        formattedTotalSpent: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(
          customer.orders?.reduce((total, order) => total + (order.totalAmount || 0), 0) || 0
        )
      }));
      
      console.log('Formatted customers:', formattedCustomers.length);
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error(error.message || 'Erreur lors de la récupération des clients');
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      const demoData = [
        {
          id: 'cus_123456',
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          phone: '+33 6 12 34 56 78',
          address: '123 Rue de Paris, 75001 Paris',
          createdAt: new Date(),
          formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
          ordersCount: 5,
          totalSpent: 349.95,
          formattedTotalSpent: '349,95 DT'
        },
        {
          id: 'cus_123457',
          name: 'Marie Martin',
          email: 'marie.martin@example.com',
          phone: '+33 6 23 45 67 89',
          address: '456 Avenue des Champs-Élysées, 75008 Paris',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          ordersCount: 3,
          totalSpent: 199.97,
          formattedTotalSpent: '199,97 DT'
        },
        {
          id: 'cus_123458',
          name: 'Pierre Dubois',
          email: 'pierre.dubois@example.com',
          phone: '+33 6 34 56 78 90',
          address: '789 Boulevard Saint-Michel, 75006 Paris',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          ordersCount: 1,
          totalSpent: 59.99,
          formattedTotalSpent: '59,99 DT'
        },
        {
          id: 'cus_123459',
          name: 'Sophie Leroy',
          email: 'sophie.leroy@example.com',
          phone: '+33 6 45 67 89 01',
          address: '101 Rue de Rivoli, 75001 Paris',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          ordersCount: 8,
          totalSpent: 599.92,
          formattedTotalSpent: '599,92 DT'
        },
        {
          id: 'cus_123460',
          name: 'Thomas Bernard',
          email: 'thomas.bernard@example.com',
          phone: '+33 6 56 78 90 12',
          address: '202 Avenue Montaigne, 75008 Paris',
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          ordersCount: 2,
          totalSpent: 129.98,
          formattedTotalSpent: '129,98 DT'
        }
      ];
      
      setCustomers(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (customers) => {
    return customers.filter(customer => {
      // Filtre par recherche (nom, email ou téléphone)
      if (filters.search && 
         !(customer.name?.toLowerCase().includes(filters.search.toLowerCase()) || 
           customer.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
           customer.phone?.includes(filters.search))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const customerDate = new Date(customer.createdAt);
        if (customerDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const customerDate = new Date(customer.createdAt);
        if (customerDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les clients en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Date d\'inscription', 'Commandes', 'Montant total'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredCustomers.forEach(customer => {
        const row = [
          `"${customer.id}"`,
          `"${customer.name || ''}"`,
          `"${customer.email || ''}"`,
          `"${customer.phone || ''}"`,
          `"${customer.address || ''}"`,
          `"${customer.formattedCreatedAt}"`,
          `"${customer.ordersCount}"`,
          `"${customer.formattedTotalSpent}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-gray-400" />
          {row.original.phone || 'Non renseigné'}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Adresse",
      cell: ({ row }) => (
        <div className="flex items-center max-w-xs truncate">
          <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="truncate">{row.original.address || 'Non renseignée'}</span>
        </div>
      ),
    },
    {
      accessorKey: "formattedCreatedAt",
      header: ({ column }) => (
        <div className="flex items-center">
          Inscription
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      accessorKey: "ordersCount",
      header: ({ column }) => (
        <div className="flex items-center">
          Commandes
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="flex items-center">
          <ShoppingBag className="h-3 w-3 mr-1" />
          {row.original.ordersCount}
        </Badge>
      ),
    },
    {
      accessorKey: "formattedTotalSpent",
      header: ({ column }) => (
        <div className="flex items-center">
          Total dépensé
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.formattedTotalSpent}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full"
              title="Voir détails"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => window.location.href = `mailto:${customer.email}`}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full"
              title="Envoyer un email"
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>
        );
      }
    },
  ];

  const filteredCustomers = applyFilters(customers);

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
        title="Gestion des Clients" 
        subtitle="Consultez et gérez les clients de la plateforme"
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
              onClick={fetchCustomers}
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
              Total: {customers.length} clients
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredCustomers.length} clients
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              <div className="md:col-span-3 flex justify-end">
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
            data={filteredCustomers}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
}
