'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useSearchParams } from 'next/navigation';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, 
  Loader2, 
  Store, 
  Upload, 
  Image,
  PlusCircle,
  Trash,
  Search,
  Check,
  X
} from 'lucide-react';
import { UploadButton } from '@/utils/uploadthing';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function StoreBannersContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const storeIdFromUrl = searchParams.get('storeId');
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState({});
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  // Récupérer les magasins avec leurs bannières
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchStores();
    }
  }, [user, pagination.page, pagination.limit]);

  // Fonction pour récupérer les bannières de magasins
  const fetchStores = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      console.log('Fetching store banners...');
      
      // Construire l'URL avec les paramètres
      let url = `/api/admin/store-banners?page=${page}&limit=${limit}`;
      if (storeIdFromUrl) {
        url += `&storeId=${storeIdFromUrl}`;
      }
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Store banners response status:', response.status);
      
      if (!response.ok) {
        let errorData = {};
        try {
          // Try to parse JSON response, if it fails, use a default error object
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { error: `HTTP error ${response.status}` };
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorData = { error: `HTTP error ${response.status}` };
        }
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Erreur lors de la récupération des bannières de magasins (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Store banners fetched successfully:', data);
      
      if (data.success && Array.isArray(data.storeBanners)) {
        setStores(data.storeBanners);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('Error fetching store banners:', error);
      toast.error(error.message || 'Erreur lors de la récupération des bannières de magasins');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour la bannière d'un magasin
  const updateStoreBanner = async (storeId, bannerUrl) => {
    try {
      setStoreLoading(prev => ({ ...prev, [storeId]: true }));
      
      console.log(`Updating banner for store ${storeId}`);
      const response = await fetch('/api/admin/store-banners', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          bannerUrl
        })
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          const errorText = await response.text();
          if (errorText) {
            errorData = JSON.parse(errorText);
          }
        } catch (error) {
          console.error('Error parsing error response:', error);
        }
        
        throw new Error(errorData.error || `Erreur lors de la mise à jour de la bannière (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Banner updated successfully:', data);
      
      if (data.success) {
        toast.success('Bannière mise à jour avec succès');
        fetchStores(); // Rafraîchir les données
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour de la bannière');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la bannière');
    } finally {
      setStoreLoading(prev => ({ ...prev, [storeId]: false }));
    }
  };

  // Fonction pour supprimer la bannière d'un magasin
  const deleteStoreBanner = async (storeId, storeName) => {
    try {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer la bannière du magasin "${storeName}" ?`)) {
        return;
      }
      
      setStoreLoading(prev => ({ ...prev, [storeId]: true }));
      
      console.log(`Deleting banner for store ${storeId}`);
      const response = await fetch('/api/admin/store-banners', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId
        })
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          const errorText = await response.text();
          if (errorText) {
            errorData = JSON.parse(errorText);
          }
        } catch (error) {
          console.error('Error parsing error response:', error);
        }
        
        throw new Error(errorData.error || `Erreur lors de la suppression de la bannière (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Banner deleted successfully:', data);
      
      if (data.success) {
        toast.success('Bannière supprimée avec succès');
        fetchStores(); // Rafraîchir les données
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression de la bannière');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la bannière');
    } finally {
      setStoreLoading(prev => ({ ...prev, [storeId]: false }));
    }
  };

  // Filtrer les magasins en fonction de la recherche
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    (store.seller?.name && store.seller.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Naviguer entre les pages
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHead 
        title="Gestion des bannières de magasins" 
        description="Gérez les bannières des magasins de la plateforme"
        icon={<Image className="h-6 w-6" />}
      />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un magasin..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchStores()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Rafraîchir
        </Button>
      </div>
      
      {loading && stores.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Chargement des bannières...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map(store => (
          <Card key={store.id} className="overflow-hidden">
            {store.hasBanner && (
              <div className="relative h-40 w-full">
                <img 
                  src={store.bannerUrl} 
                  alt={`Bannière de ${store.name}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-banner.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mr-2"
                    onClick={() => deleteStoreBanner(store.id, store.name)}
                    disabled={storeLoading[store.id]}
                  >
                    {storeLoading[store.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash className="h-4 w-4 mr-1" />
                        Supprimer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <CardContent className={store.hasBanner ? 'pt-4' : 'pt-6'}>
              <div className="flex items-center">
                {store.logoUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={store.logoUrl} 
                      alt={`Logo de ${store.name}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.className = 'hidden';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <Store className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{store.name}</h3>
                  <p className="text-sm text-gray-500">
                    {store.seller?.name || 'Vendeur inconnu'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex mb-2">
                  <Badge variant={store.hasBanner ? 'success' : 'outline'} className="mr-2">
                    {store.hasBanner ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {store.hasBanner ? 'Avec bannière' : 'Sans bannière'}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor={`upload-${store.id}`} className="text-sm font-medium mb-2 block">
                    Télécharger une bannière
                  </Label>
                  <UploadButton
                    endpoint="bannerImageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        console.log("Upload completed:", res[0]);
                        updateStoreBanner(store.id, res[0].url);
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Upload error:", error);
                      toast.error(`Erreur: ${error.message}`);
                    }}
                    className="w-full ut-button:bg-orange-500 ut-button:hover:bg-orange-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredStores.length === 0 && !loading && (
        <div className="text-center py-12">
          <Image className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Aucun magasin trouvé
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {search ? `Aucun résultat pour "${search}"` : "Aucun magasin disponible pour le moment"}
          </p>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <Button
              variant="outline"
              className="join-item"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              «
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === pagination.page ? 'default' : 'outline'}
                className="join-item"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              className="join-item"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              »
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
