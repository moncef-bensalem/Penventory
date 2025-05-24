'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import ImageInput from '@/components/FormInputs/ImageInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextInput from '@/components/FormInputs/TextInput';
import { makePutRequest } from '@/lib/apiRequest';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

export default function UpdateBanner() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState(null);
  
  const { register, reset, handleSubmit, formState: { errors } } = useForm();

  // Récupérer les détails de la bannière
  useEffect(() => {
    if (user && user.role === 'ADMIN' && id) {
      fetchBanner();
    }
  }, [user, id]);

  const fetchBanner = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/banners?id=${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la récupération de la bannière');
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('Bannière non trouvée');
      }
      
      setBanner(data);
      setImageUrl(data.imageUrl || '');
      
      // Préremplir le formulaire
      reset({
        title: data.title || '',
        link: data.link || '',
        isActive: data.isActive || false
      });
      
    } catch (error) {
      console.error('Erreur lors de la récupération de la bannière:', error);
      setError(error.message || 'Erreur lors de la récupération de la bannière');
      toast.error(error.message || 'Erreur lors de la récupération de la bannière');
    } finally {
      setFetchLoading(false);
    }
  };

  async function onSubmit(data) {
    if (!imageUrl) {
      toast.error('Veuillez télécharger une image de bannière avant de soumettre !');
      return;
    }

    data.imageUrl = imageUrl;
    console.log('Updating banner data:', data);

    makePutRequest(
      setLoading,
      `api/banners?id=${id}`,
      data,
      'Bannière',
      () => {
        // Redirection après mise à jour réussie
        router.push('/dashboard/catalogue/banners');
      }
    );
  }

  if (authLoading || fetchLoading) {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erreur
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Link href="/dashboard/catalogue/banners">
            <Button variant="default">
              Retour aux bannières
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Modifier la bannière" 
        subtitle="Mettez à jour les informations de votre bannière promotionnelle"
      />
      
      <div className="p-6">
        <Link href="/dashboard/catalogue/banners">
          <Button variant="outline" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux bannières
          </Button>
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="grid gap-6 mb-6 md:grid-cols-2">
              {banner && banner.id && (
                <div className="md:col-span-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ID de la bannière</p>
                  <p className="font-mono text-gray-800 dark:text-gray-200">{banner.id}</p>
                </div>
              )}
              
              <TextInput
                label="Titre de la bannière"
                name="title"
                register={register}
                errors={errors}
                required={true}
              />
              
              <TextInput
                label="Lien de la bannière"
                name="link"
                type="url"
                register={register}
                errors={errors}
                required={true}
              />
              
              <div className="md:col-span-2">
                <ImageInput
                  label="Image de la bannière"
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  endpoint="bannerImageUploader"
                />
                {imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Image actuelle</p>
                    <div className="relative h-40 w-full overflow-hidden rounded-md">
                      <img 
                        src={imageUrl} 
                        alt={banner?.title || 'Bannière'} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Format recommandé : 1200 x 400 pixels, JPG ou PNG
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <Label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bannière active
                  </Label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <SubmitButton
                  isLoading={loading}
                  buttonTitle="Mettre à jour la bannière"
                  loadingButtonTitle="Mise à jour en cours..."
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
