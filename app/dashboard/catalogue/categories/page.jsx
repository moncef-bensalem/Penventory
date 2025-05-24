'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import TableActions from '@/components/backoffice/TableActions';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle,
  Pencil,
  Trash2,
  Filter, 
  RefreshCw,
  AlertTriangle,
  Store
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    store: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    storeId: '',
    image: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all categories and stores
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching data...');
      fetchCategories();
      fetchStores();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const response = await fetch('/api/admin/categories');
      console.log('Categories response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des catégories');
      }
      
      const data = await response.json();
      console.log('Categories data:', data);
      
      // S'assurer que les données sont valides
      if (!data.categories || !Array.isArray(data.categories)) {
        console.error('Invalid categories data format:', data);
        setCategories([]);
        throw new Error('Format de données de catégories invalide');
      }
      
      // Transformer les données pour l'affichage
      const formattedCategories = data.categories.map(category => ({
        ...category,
        storeName: category.store?.name || 'Magasin inconnu'
      }));
      
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Erreur lors de la récupération des catégories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      console.log('Fetching stores...');
      const response = await fetch('/api/admin/stores');
      console.log('Stores response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des magasins');
      }
      
      const data = await response.json();
      console.log('Stores data:', data);
      
      // Extraire le tableau de magasins de la réponse
      if (data.stores && Array.isArray(data.stores)) {
        setStores(data.stores);
      } else {
        console.error('Invalid stores data format:', data);
        setStores([]);
        throw new Error('Format de données de magasins invalide');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error(error.message || 'Erreur lors de la récupération des magasins');
      setStores([]);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name || !newCategory.description || !newCategory.storeId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la création de la catégorie');
      }
      
      toast.success('Catégorie créée avec succès');
      setNewCategory({
        name: '',
        description: '',
        storeId: '',
        image: ''
      });
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression de la catégorie');
      }
      
      toast.success('Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      store: '',
      search: ''
    });
  };

  const applyFilters = (categories) => {
    return categories.filter(category => {
      // Filtre par magasin
      if (filters.store && category.storeId !== filters.store) {
        return false;
      }
      
      // Filtre par recherche
      if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description;
        return description.length > 50 ? `${description.substring(0, 50)}...` : description;
      },
    },
    {
      accessorKey: "storeName",
      header: "Magasin",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.storeName}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date de création",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/catalogue/categories/update/${category.id}`}>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => handleDeleteCategory(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredCategories = applyFilters(categories);

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
        title="Gestion des Catégories" 
        subtitle="Gérez toutes les catégories de produits sur la plateforme PENVENTORY"
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
              onClick={fetchCategories}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {categories.length} catégories
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrées: {filteredCategories.length} catégories
            </Badge>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter une catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle catégorie pour un magasin spécifique.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCategory}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nom *
                      </Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description *
                      </Label>
                      <Input
                        id="description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="store" className="text-right">
                        Magasin *
                      </Label>
                      <Select
                        value={newCategory.storeId}
                        onValueChange={(value) => setNewCategory({...newCategory, storeId: value})}
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner un magasin" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image" className="text-right">
                        Image URL
                      </Label>
                      <Input
                        id="image"
                        value={newCategory.image || ''}
                        onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Création...' : 'Créer la catégorie'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {showFilters && (
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Magasin</label>
                <Select
                  value={filters.store}
                  onValueChange={(value) => handleFilterChange('store', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les magasins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les magasins</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Recherche</label>
                <Input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={resetFilters} className="mr-2">
                Réinitialiser
              </Button>
            </div>
          </Card>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredCategories}
            searchKey="name"
          />
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center p-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium">Aucune catégorie trouvée</h3>
            <p className="text-gray-500 mt-2">
              Aucune catégorie ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
