'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import ImageInput from '@/components/FormInputs/ImageInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextInput from '@/components/FormInputs/TextInput';
import { makePostRequest } from '@/lib/apiRequest';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

export default function NewBanner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, reset, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      link: '',
      isActive: true
    }
  });

  async function onSubmit(data) {
    if (!imageUrl) {
      toast.error('Veuillez télécharger une image de bannière avant de soumettre !');
      return;
    }

    data.imageUrl = imageUrl;
    console.log('Submitting banner data:', data);

    makePostRequest(
      setLoading,
      'api/banners',
      data,
      'Bannière',
      reset
    );
    
    setImageUrl('');
  }

  if (authLoading) {
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
        title="Ajouter une nouvelle bannière" 
        subtitle="Créez une bannière promotionnelle pour votre boutique en ligne"
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
              <TextInput
                label="Titre de la bannière"
                name="title"
                register={register}
                errors={errors}
                required={true}
                placeholder="Promotion d'été"
              />
              
              <TextInput
                label="Lien de la bannière"
                name="link"
                type="url"
                register={register}
                errors={errors}
                required={true}
                placeholder="https://example.com/promotion"
              />
              
              <div className="md:col-span-2">
                <ImageInput
                  label="Image de la bannière"
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  endpoint="bannerImageUploader"
                />
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
                    defaultChecked={true}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activer immédiatement cette bannière
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <SubmitButton
                  isLoading={loading}
                  buttonTitle="Créer la bannière"
                  loadingButtonTitle="Création en cours..."
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
