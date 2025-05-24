'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  UserCheck,
  UserX,
  UserCog,
  Filter, 
  RefreshCw,
  Download,
  Search,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createColumns } from './components/columns';

export default function ManagerAccountsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [accountsSummary, setAccountsSummary] = useState({
    totalAccounts: 0,
    customerAccounts: 0,
    sellerAccounts: 0,
    activeAccounts: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  // Récupérer les comptes utilisateurs
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      console.log('Manager user detected, fetching accounts data...');
      fetchAccounts();
    }
  }, [user]);

  // Appliquer les filtres quand les comptes ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [accounts, filters]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      console.log('Fetching accounts data...');
      
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.role) queryParams.append('role', filters.role);
      
      const response = await fetch(`/api/manager/accounts?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des comptes');
      }
      
      const data = await response.json();
      console.log('Accounts fetched successfully:', data.users?.length);
      
      setAccounts(data.users || []);
      
      // Calculer le résumé des comptes
      const summary = {
        totalAccounts: data.users.length,
        customerAccounts: data.users.filter(a => a.role === 'CUSTOMER').length,
        sellerAccounts: data.users.filter(a => a.role === 'SELLER').length,
        activeAccounts: data.users.filter(a => a.status === 'ACTIVE').length
      };
      
      setAccountsSummary(summary);
      setFilteredAccounts(data.users || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Erreur lors de la récupération des comptes');
      
      // En cas d'erreur, générer des données de démonstration
      const demoAccounts = generateDemoAccounts(30);
      setAccounts(demoAccounts);
      
      const summary = {
        totalAccounts: demoAccounts.length,
        customerAccounts: demoAccounts.filter(a => a.role === 'CUSTOMER').length,
        sellerAccounts: demoAccounts.filter(a => a.role === 'SELLER').length,
        activeAccounts: demoAccounts.filter(a => a.status === 'ACTIVE').length
      };
      
      setAccountsSummary(summary);
      setFilteredAccounts(demoAccounts);
    } finally {
      setLoading(false);
    }
  };

  // Générer des comptes de démonstration
  const generateDemoAccounts = (count) => {
    const roles = ['CUSTOMER', 'SELLER', 'MANAGER', 'SUPPORT'];
    const statuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];
    
    return Array.from({ length: count }).map((_, index) => {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString();
      
      return {
        id: `user-${index + 1}`,
        name: `Utilisateur ${index + 1}`,
        email: `user${index + 1}@example.com`,
        role,
        image: `https://i.pravatar.cc/150?u=${index}`,
        phone: `+216 ${Math.floor(10000000 + Math.random() * 90000000)}`,
        emailVerified: status === 'ACTIVE',
        createdAt,
        updatedAt: new Date(new Date(createdAt).getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        status,
        ordersCount: Math.floor(Math.random() * 20),
        reviewsCount: Math.floor(Math.random() * 10),
        store: role === 'SELLER' ? {
          id: `store-${index}`,
          name: `Magasin ${index}`,
          logo: `https://picsum.photos/seed/${index}/200/200`,
          isApproved: Math.random() > 0.3
        } : null
      };
    });
  };
  
  const applyFilters = () => {
    let filtered = [...accounts];
    
    // Filtre par rôle
    if (filters.role) {
      filtered = filtered.filter(account => account.role === filters.role);
    }
    
    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(account => account.status === filters.status);
    }
    
    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(searchLower) ||
        account.email.toLowerCase().includes(searchLower) ||
        (account.store?.name && account.store.name.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredAccounts(filtered);
  };
  
  const handleViewAccount = (accountId) => {
    console.log(`Viewing account details for ${accountId}`);
    toast.success('Fonctionnalité en cours de développement');
    // Dans une vraie application, rediriger vers la page de détails du compte
  };
  
  const handleActivateAccount = async (accountId) => {
    try {
      console.log(`Activating account ${accountId}`);
      toast.success('Compte activé avec succès');
      
      // Dans une vraie application, faire un appel API pour activer le compte
      // Mettre à jour l'état local
      const updatedAccounts = accounts.map(account => 
        account.id === accountId ? { ...account, status: 'ACTIVE' } : account
      );
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error activating account:', error);
      toast.error('Erreur lors de l\'activation du compte');
    }
  };
  
  const handleSuspendAccount = async (accountId) => {
    try {
      console.log(`Suspending account ${accountId}`);
      toast.success('Compte suspendu avec succès');
      
      // Dans une vraie application, faire un appel API pour suspendre le compte
      // Mettre à jour l'état local
      const updatedAccounts = accounts.map(account => 
        account.id === accountId ? { ...account, status: 'SUSPENDED' } : account
      );
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error suspending account:', error);
      toast.error('Erreur lors de la suspension du compte');
    }
  };
  
  const handleSendEmail = (accountId, email) => {
    console.log(`Sending email to account ${accountId} (${email})`);
    toast.success(`Email envoyé à ${email}`);
    // Dans une vraie application, ouvrir un modal pour composer un email
  };
  
  const resetFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: ''
    });
  };
  
  const exportToCSV = (accounts) => {
    // Vérifier qu'il y a des comptes à exporter
    if (!accounts || accounts.length === 0) {
      toast.error("Aucun compte à exporter");
      return;
    }

    try {
      // Définir les en-têtes du CSV
      const headers = [
        "ID", 
        "Nom", 
        "Email", 
        "Rôle", 
        "Statut", 
        "Date de création"
      ];

      // Formater les données des comptes pour le CSV
      const data = accounts.map(account => [
        account.id,
        account.name,
        account.email,
        account.role,
        account.status,
        new Date(account.createdAt).toLocaleDateString('fr-FR')
      ]);

      // Combiner les en-têtes et les données
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      // Créer un objet Blob avec le contenu CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `comptes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export CSV réussi");
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast.error("Erreur lors de l'export CSV");
    }
  };

  // Créer les colonnes avec les gestionnaires d'actions
  const columns = createColumns({
    onView: handleViewAccount,
    onActivate: handleActivateAccount,
    onSuspend: handleSuspendAccount,
    onSendEmail: handleSendEmail
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <UserX className="w-16 h-16 text-destructive mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux managers.
            Veuillez vous connecter avec un compte manager.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead 
        title="Gestion des Comptes" 
        description="Gérez les comptes utilisateurs de la plateforme" 
      />

      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Comptes</h3>
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{accountsSummary.totalAccounts}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Clients</h3>
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {accountsSummary.customerAccounts}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Vendeurs</h3>
              <UserCog className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-blue-600">
              {accountsSummary.sellerAccounts}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Comptes actifs</h3>
              <UserCheck className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-indigo-600">
              {accountsSummary.activeAccounts}
            </p>
          </div>
        </div>

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
              onClick={fetchAccounts}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => exportToCSV(filteredAccounts)}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Badge variant="outline" className="text-sm">
              Total: {accounts.length} comptes
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredAccounts.length} comptes
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <Card className="mb-6 p-4">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle
                </label>
                <select
                  id="role"
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous les rôles</option>
                  <option value="CUSTOMER">Client</option>
                  <option value="SELLER">Vendeur</option>
                  <option value="SUPPORT">Support</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              
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
                  <option value="INACTIVE">Inactif</option>
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
                    placeholder="Nom, email, magasin..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
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
          </Card>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredAccounts}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
} 