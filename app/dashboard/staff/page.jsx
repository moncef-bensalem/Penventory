'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddStaffModal from './add-staff-modal';
import { 
  PlusCircle,
  Pencil,
  Trash2,
  Filter, 
  RefreshCw,
  Download,
  Mail,
  User,
  Calendar,
  ArrowUpDown,
  Phone,
  Shield,
  Check,
  X,
  AlertTriangle,
  Eye,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StaffPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Récupérer les membres du personnel
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching staff members...');
      fetchStaffMembers();
    }
  }, [user]);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      console.log('Fetching staff members...');
      
      const response = await fetch('/api/admin/staff');
      console.log('Staff response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération du personnel');
      }
      
      const data = await response.json();
      console.log('Staff members data:', data);
      
      // S'assurer que les données sont valides
      if (!data || !Array.isArray(data)) {
        console.error('Invalid staff data format:', data);
        throw new Error('Format de données du personnel invalide');
      }
      
      // Transformer les données pour l'affichage
      const formattedStaffMembers = data.map(staff => ({
        ...staff,
        formattedCreatedAt: format(new Date(staff.createdAt), 'dd MMMM yyyy', { locale: fr }),
        lastLoginFormatted: staff.lastLogin ? format(new Date(staff.lastLogin), 'dd MMMM yyyy HH:mm', { locale: fr }) : 'Jamais'
      }));
      
      setStaffMembers(formattedStaffMembers);
      console.log('Staff members processed:', formattedStaffMembers.length);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error(error.message || 'Erreur lors de la récupération du personnel');
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      const demoData = [
        {
          id: 'staff_123456',
          name: 'Ahmed Benali',
          email: 'ahmed.benali@penventory.com',
          phone: '+33 6 12 34 56 78',
          role: 'ADMIN',
          permissions: ['all'],
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: new Date(),
          formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures avant
          lastLoginFormatted: format(new Date(Date.now() - 2 * 60 * 60 * 1000), 'dd MMMM yyyy HH:mm', { locale: fr }),
          department: 'Direction',
          position: 'Directeur Général'
        },
        {
          id: 'staff_123457',
          name: 'Sophie Dupont',
          email: 'sophie.dupont@penventory.com',
          phone: '+33 6 23 45 67 89',
          role: 'MANAGER',
          permissions: ['users_read', 'users_write', 'products_read', 'products_write', 'orders_read', 'orders_write'],
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
          lastLoginFormatted: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy HH:mm', { locale: fr }),
          department: 'Ventes',
          position: 'Responsable des Ventes'
        },
        {
          id: 'staff_123458',
          name: 'Jean Martin',
          email: 'jean.martin@penventory.com',
          phone: '+33 6 34 56 78 90',
          role: 'MANAGER',
          permissions: ['products_read', 'products_write', 'categories_read', 'categories_write'],
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours avant
          lastLoginFormatted: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy HH:mm', { locale: fr }),
          department: 'Catalogue',
          position: 'Responsable Catalogue'
        },
        {
          id: 'staff_123459',
          name: 'Marie Leroy',
          email: 'marie.leroy@penventory.com',
          phone: '+33 6 45 67 89 01',
          role: 'SUPPORT',
          permissions: ['customers_read', 'orders_read', 'tickets_read', 'tickets_write'],
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          lastLogin: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // 12 heures avant
          lastLoginFormatted: format(new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy HH:mm', { locale: fr }),
          department: 'Support Client',
          position: 'Agent de Support'
        },
        {
          id: 'staff_123460',
          name: 'Thomas Bernard',
          email: 'thomas.bernard@penventory.com',
          phone: '+33 6 56 78 90 12',
          role: 'MANAGER',
          permissions: ['stores_read', 'stores_write', 'sellers_read', 'sellers_write'],
          status: 'SUSPENDED',
          emailVerified: true,
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours avant
          lastLoginFormatted: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy HH:mm', { locale: fr }),
          department: 'Relations Vendeurs',
          position: 'Responsable Partenariats'
        }
      ];
      
      setStaffMembers(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer l'ajout d'un nouveau membre
  const handleAddStaffSuccess = (newStaffMember) => {
    // Format the new staff member to match the structure of existing staff members
    const formattedStaff = {
      ...newStaffMember,
      formattedCreatedAt: format(new Date(newStaffMember.createdAt), 'dd MMMM yyyy', { locale: fr }),
      lastLoginFormatted: newStaffMember.lastLogin 
        ? format(new Date(newStaffMember.lastLogin), 'dd MMMM yyyy HH:mm', { locale: fr }) 
        : 'Jamais'
    };
    
    // Add the new staff member to the top of the list
    setStaffMembers([formattedStaff, ...staffMembers]);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (staffMembers) => {
    return staffMembers.filter(staff => {
      // Filtre par rôle
      if (filters.role && staff.role !== filters.role) {
        return false;
      }
      
      // Filtre par statut
      if (filters.status && staff.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche (nom, email ou téléphone)
      if (filters.search && 
         !(staff.name?.toLowerCase().includes(filters.search.toLowerCase()) || 
           staff.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
           staff.phone?.includes(filters.search) ||
           staff.department?.toLowerCase().includes(filters.search.toLowerCase()) ||
           staff.position?.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const staffDate = new Date(staff.createdAt);
        if (staffDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const staffDate = new Date(staff.createdAt);
        if (staffDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les membres du personnel en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Département', 'Poste', 'Statut', 'Email vérifié', 'Date d\'ajout', 'Dernière connexion'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredStaffMembers.forEach(staff => {
        const row = [
          `"${staff.id}"`,
          `"${staff.name || ''}"`,
          `"${staff.email || ''}"`,
          `"${staff.phone || ''}"`,
          `"${getRoleLabel(staff.role)}"`,
          `"${staff.department || ''}"`,
          `"${staff.position || ''}"`,
          `"${getStatusLabel(staff.status)}"`,
          `"${staff.emailVerified ? 'Oui' : 'Non'}"`,
          `"${staff.formattedCreatedAt}"`,
          `"${staff.lastLoginFormatted}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `personnel_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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

  // Obtenir le libellé du rôle
  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MANAGER': return 'Manager';
      case 'SUPPORT': return 'Support';
      case 'EDITOR': return 'Éditeur';
      default: return role;
    }
  };

  // Obtenir la couleur du badge selon le rôle
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUPPORT': return 'bg-green-100 text-green-800 border-green-200';
      case 'EDITOR': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'SUSPENDED': return 'Suspendu';
      case 'INACTIVE': return 'Inactif';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <Check className="h-4 w-4 mr-1" />;
      case 'PENDING': return <Calendar className="h-4 w-4 mr-1" />;
      case 'SUSPENDED': return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'INACTIVE': return <X className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Supprimer un membre du personnel
  const deleteStaffMember = async (staffId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression du membre du personnel');
      }
      
      toast.success('Membre du personnel supprimé avec succès');
      fetchStaffMembers(); // Rafraîchir la liste
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast.error(error.message || 'Erreur lors de la suppression du membre du personnel');
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
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge className={getRoleBadgeClass(role)}>
            <div className="flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              {getRoleLabel(role)}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Département",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.department || 'N/A'}</div>
          <div className="text-sm text-gray-500">{row.original.position || 'N/A'}</div>
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
          Date d'ajout
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      accessorKey: "lastLoginFormatted",
      header: ({ column }) => (
        <div className="flex items-center">
          Dernière connexion
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/staff/${staff.id}`}>
              <Button variant="outline" size="icon" title="Voir les détails">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/staff/update/${staff.id}`}>
              <Button variant="outline" size="icon" title="Modifier">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="icon" 
              title="Supprimer"
              onClick={() => deleteStaffMember(staff.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredStaffMembers = applyFilters(staffMembers);

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
        title="Gestion du Personnel" 
        linkTitle="Ajouter un membre"
        onActionClick={() => setIsAddModalOpen(true)}
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
              onClick={fetchStaffMembers}
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
              Total: {staffMembers.length} membres
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredStaffMembers.length} membres
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <option value="ADMIN">Administrateur</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPPORT">Support</option>
                  <option value="EDITOR">Éditeur</option>
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
                    placeholder="Nom, email, département..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'ajout depuis
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
                  Date d'ajout jusqu'à
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
              
              <div className="md:col-span-5 flex justify-end">
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
            data={filteredStaffMembers}
            searchKey="name"
          />
        </div>
      </div>

      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleAddStaffSuccess} 
      />
    </div>
  );
}
