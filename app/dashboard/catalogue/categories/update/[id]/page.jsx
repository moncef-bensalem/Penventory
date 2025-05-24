'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UpdateCategory({ params }) {
  // Utiliser React.use pour déballer les paramètres
  const id = React.use(params).id;
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(null);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    storeId: '',
    image: ''
  });
  const [error, setError] = useState(null);

  // Fetch category and stores data
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchCategory();
      fetchStores();
    }
  }, [user, id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      console.log(`Fetching category with ID: ${id}`);
      const response = await fetch(`/api/categories/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la récupération de la catégorie');
      }
      
      const data = await response.json();
      console.log('Category fetched successfully:', data);
      
      setCategory(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        storeId: data.storeId || '',
        image: data.image || ''
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      console.log('Fetching stores...');
      const response = await fetch('/api/admin/stores');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la récupération des magasins');
      }
      
      const data = await response.json();
      console.log('Stores data fetched:', data);
      
      // Vérifier si data est un tableau ou s'il contient une propriété stores
      if (Array.isArray(data)) {
        setStores(data);
        console.log('Stores fetched successfully:', data.length);
      } else if (data.stores && Array.isArray(data.stores)) {
        setStores(data.stores);
        console.log('Stores fetched successfully:', data.stores.length);
      } else {
        console.error('Invalid stores data format:', data);
        setStores([]);
        toast.error('Format de données des magasins invalide');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setSubmitting(true);
      console.log(`Updating category ID: ${id} with data:`, formData);
      
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la catégorie');
      }
      
      toast.success('Catégorie mise à jour avec succès');
      router.push('/dashboard/catalogue/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-3xl mx-auto">
          <PageHead 
            title="Erreur" 
            subtitle="Une erreur est survenue lors du chargement de la catégorie"
          />
          
          <Card className="p-6 mt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Impossible de charger la catégorie</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link href="/dashboard/catalogue/categories">
              <Button variant="default" className="flex items-center mx-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste des catégories
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        <PageHead 
          title="Modifier une catégorie" 
          subtitle="Mettez à jour les informations de la catégorie"
        />
        
        <div className="mb-6">
          <Link href="/dashboard/catalogue/categories">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </Link>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="block mb-2">
                  Nom de la catégorie *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nom de la catégorie"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="block mb-2">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description de la catégorie"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="store" className="block mb-2">
                  Magasin *
                </Label>
                <Select
                  value={formData.storeId}
                  onValueChange={(value) => handleSelectChange('storeId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un magasin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(stores) && stores.length > 0 ? (
                      stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-stores" disabled>
                        Aucun magasin disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="image" className="block mb-2">
                  URL de l'image
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Aperçu de l'image" 
                      className="h-32 w-auto object-contain border rounded-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Image+non+disponible';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Link href="/dashboard/catalogue/categories">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
