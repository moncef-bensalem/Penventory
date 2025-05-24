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
  CheckCircle,
  XCircle,
  Clock
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

export default function CouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les coupons
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching coupons...');
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log('Fetching coupons...');
      const response = await fetch('/api/coupons');
      console.log('Coupons response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des coupons');
      }
      
      const data = await response.json();
      console.log('Coupons fetched successfully:', data.length);
      
      // S'assurer que les données sont valides
      if (!data || !Array.isArray(data)) {
        console.error('Invalid coupons data format:', data);
        throw new Error('Format de données de coupons invalide');
      }
      
      // Transformer les données pour l'affichage
      const formattedCoupons = data.map(coupon => ({
        ...coupon,
        status: new Date(coupon.expiryDate) > new Date() ? 'active' : 'expired',
        formattedExpiryDate: format(new Date(coupon.expiryDate), 'dd MMMM yyyy', { locale: fr })
      }));
      
      setCoupons(formattedCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(error.message || 'Erreur lors de la récupération des coupons');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la suppression d'un coupon
  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coupon?')) {
      try {
        const response = await fetch(`/api/coupons?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erreur lors de la suppression du coupon');
        }

        setCoupons(coupons.filter(coupon => coupon.id !== id));
        toast.success('Coupon supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du coupon:', error);
        toast.error(error.message || 'Erreur lors de la suppression du coupon');
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
  const applyFilters = (coupons) => {
    return coupons.filter(coupon => {
      // Filtre par statut
      if (filters.status && coupon.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche
      if (filters.search && 
         !coupon.title.toLowerCase().includes(filters.search.toLowerCase()) && 
         !coupon.CouponCode.toLowerCase().includes(filters.search.toLowerCase())) {
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
      accessorKey: "CouponCode",
      header: "Code",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm font-mono">
          {row.original.CouponCode}
        </span>
      ),
    },
    {
      accessorKey: "discount",
      header: "Réduction",
      cell: ({ row }) => `${row.original.discount || 0}%`,
    },
    {
      accessorKey: "formattedExpiryDate",
      header: "Date d'expiration",
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/catalogue/coupons/update/${coupon.id}`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => handleDeleteCoupon(coupon.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredCoupons = applyFilters(coupons);

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
        title="Gestion des Coupons" 
        subtitle="Gérez tous les coupons de réduction sur la plateforme PENVENTORY"
      />
      
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
              onClick={fetchCoupons}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {coupons.length} coupons
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredCoupons.length} coupons
            </Badge>
            
            <Link href="/dashboard/catalogue/coupons/new">
              <Button className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter un coupon
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
                  <option value="expired">Expiré</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="search">Recherche</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Rechercher par titre ou code..."
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
            data={filteredCoupons}
            searchKey="title"
          />
        </div>
      </div>
    </div>
  );
}
