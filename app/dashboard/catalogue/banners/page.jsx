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
  Image,
  Store
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BannersPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les bannières
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching banners...');
      fetchBanners();
    }
  }, [user]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      console.log('Fetching banners...');
      const response = await fetch('/api/banners');
      console.log('Banners response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des bannières');
      }
      
      const data = await response.json();
      console.log('Banners fetched successfully:', data.length);
      
      // S'assurer que les données sont valides
      if (!data || !Array.isArray(data)) {
        console.error('Invalid banners data format:', data);
        throw new Error('Format de données de bannières invalide');
      }
      
      // Transformer les données pour l'affichage
      const formattedBanners = data.map(banner => ({
        ...banner,
        status: banner.isActive ? 'active' : 'inactive',
        formattedCreatedAt: format(new Date(banner.createdAt), 'dd MMMM yyyy', { locale: fr })
      }));
      
      setBanners(formattedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(error.message || 'Erreur lors de la récupération des bannières');
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      const demoData = [
        {
          id: '1',
          title: 'Promotion Été',
          imageUrl: '/images/banners/summer.jpg',
          link: '/promotions/summer',
          isActive: true,
          status: 'active',
          createdAt: new Date(),
          formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr })
        },
        {
          id: '2',
          title: 'Rentrée Scolaire',
          imageUrl: '/images/banners/school.jpg',
          link: '/promotions/school',
          isActive: true,
          status: 'active',
          createdAt: new Date(),
          formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr })
        }
      ];
      setBanners(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la suppression d'une bannière
  const handleDeleteBanner = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette bannière?')) {
      try {
        const response = await fetch(`/api/banners?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erreur lors de la suppression de la bannière');
        }

        setBanners(banners.filter(banner => banner.id !== id));
        toast.success('Bannière supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de la bannière:', error);
        toast.error(error.message || 'Erreur lors de la suppression de la bannière');
      }
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      search: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (banners) => {
    return banners.filter(banner => {
      // Filtre par statut
      if (filters.status && banner.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche
      if (filters.search && 
         !banner.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Titre",
    },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => (
        <div className="relative h-16 w-32 overflow-hidden rounded-md">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <Image className="h-6 w-6" />
          </div>
          {row.original.imageUrl && (
            <img 
              src={row.original.imageUrl} 
              alt={row.original.title} 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
      ),
    },
    {
      accessorKey: "link",
      header: "Lien",
      cell: ({ row }) => (
        <span className="text-blue-600 hover:underline">
          {row.original.link}
        </span>
      ),
    },
    {
      accessorKey: "formattedCreatedAt",
      header: "Date de création",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return status === 'active' ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Actif
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Inactif
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/catalogue/banners/update/${banner.id}`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => handleDeleteBanner(banner.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredBanners = applyFilters(banners);

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
        title="Bannières" 
        description="Gérer les bannières sur la plateforme"
      >
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/dashboard/catalogue/store-banners">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Store className="w-4 h-4" />
              Bannières Magasins
            </Button>
          </Link>
          <Button 
            onClick={() => fetchBanners()} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Link href="/dashboard/catalogue/banners/create">
            <Button 
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nouvelle Bannière
            </Button>
          </Link>
        </div>
      </PageHead>
      
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
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
              onClick={fetchBanners}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {banners.length} bannières
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrées: {filteredBanners.length} bannières
            </Badge>
            
            <Link href="/dashboard/catalogue/banners/new">
              <Button className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter une bannière
              </Button>
            </Link>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="search">Recherche</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Rechercher par titre..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="mt-1"
                />
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
            data={filteredBanners}
            searchKey="title"
          />
        </div>
      </div>
    </div>
  );
}
