'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/auth-context";
import PageHead from "@/components/backoffice/PageHead";
import TextInput from "@/components/FormInputs/TextInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import { toast } from "react-hot-toast";
import { generateIsoFormattedDate } from "@/lib/generateIsoFormattedDate";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function UpdateCoupon({ params }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState(null);
  const { register, reset, handleSubmit, formState: { errors }, setValue } = useForm();

  // Récupérer les données du coupon
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      const fetchCoupon = async () => {
        try {
          setFetchLoading(true);
          const response = await fetch(`/api/coupons?id=${id}`);
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          setCoupon(data);
          
          // Formater la date pour l'affichage dans le formulaire
          const formattedDate = format(new Date(data.expiryDate), 'yyyy-MM-dd');
          
          // Pré-remplir le formulaire
          setValue('title', data.title);
          setValue('expireDate', formattedDate);
          setValue('discountPercentage', data.discount || 0);
          
          // Définir l'état actif
          setIsActive(data.isActive !== undefined ? data.isActive : true);
        } catch (err) {
          console.error('Erreur lors de la récupération du coupon:', err);
          setError(err.message);
          toast.error('Impossible de charger les données du coupon');
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchCoupon();
    }
  }, [id, setValue, user]);

  async function onSubmit(data) {
    if (!data.expireDate) {
      toast.error("La date d'expiration est requise");
      return;
    }

    try {
      setLoading(true);
      
      // Formater la date
      const isoFormattedDate = generateIsoFormattedDate(data.expireDate);
      
      if (!isoFormattedDate) {
        toast.error("Format de date invalide");
        return;
      }
      
      // Préparer les données pour l'API
      const couponData = {
        id,
        title: data.title,
        expiryDate: isoFormattedDate,
        discountPercentage: parseFloat(data.discountPercentage) || 0,
        isActive: isActive
      };
      
      console.log("Données du coupon à mettre à jour:", couponData);
      
      // Envoyer la requête à l'API
      const response = await fetch('/api/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour du coupon");
      }
      
      toast.success("Coupon mis à jour avec succès!");
      
      // Rediriger vers la liste des coupons
      router.push('/dashboard/catalogue/coupons');
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du coupon");
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Link href="/dashboard/catalogue/coupons">
            <Button>Retour à la liste des coupons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Modifier un coupon" 
        subtitle="Mettez à jour les informations du coupon"
      />
      
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard/catalogue/coupons">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste des coupons
            </Button>
          </Link>
        </div>
        
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="w-full max-w-4xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 mx-auto"
        >
          {coupon && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Code du coupon:</span> 
                <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-md font-mono">
                  {coupon.CouponCode}
                </span>
              </p>
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <TextInput
              label="Titre du coupon"
              name="title"
              register={register}
              errors={errors}
              required={true}
              className="w-full"
            />
            
            <TextInput
              label="Date d'expiration"
              name="expireDate"
              type="date"
              register={register}
              errors={errors}
              required={true}
              className="w-full"
            />
            
            <TextInput
              label="Pourcentage de réduction (%)"
              name="discountPercentage"
              type="number"
              min="0"
              max="100"
              register={register}
              errors={errors}
              className="w-full"
              defaultValue="0"
            />
            
            <div className="flex items-center space-x-2 pt-8">
              <Switch 
                id="isActive" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="isActive">Coupon actif</Label>
            </div>
            
            <div className="sm:col-span-2 mt-4">
              <SubmitButton
                isLoading={loading}
                buttonTitle="Mettre à jour le coupon"
                loadingButtonTitle="Mise à jour en cours..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
