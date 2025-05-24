'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/auth-context";
import PageHead from "@/components/backoffice/PageHead";
import TextInput from "@/components/FormInputs/TextInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import { toast } from "react-hot-toast";
import { generateCouponCode } from "@/lib/generateCouponCode";
import { generateIsoFormattedDate } from "@/lib/generateIsoFormattedDate";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewCoupon() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const { register, reset, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit(data) {
    if (!data.expireDate) {
      toast.error("La date d'expiration est requise");
      return;
    }

    try {
      setLoading(true);
      
      // Générer le code de coupon et formater la date
      const couponCode = generateCouponCode(data.title, data.expireDate);
      const isoFormattedDate = generateIsoFormattedDate(data.expireDate);
      
      if (!isoFormattedDate) {
        toast.error("Format de date invalide");
        return;
      }
      
      // Préparer les données pour l'API
      const couponData = {
        title: data.title,
        couponCode: couponCode,
        expiryDate: isoFormattedDate,
        discountPercentage: parseFloat(data.discountPercentage) || 0,
        isActive: isActive
      };
      
      console.log("Données du coupon à envoyer:", couponData);
      
      // Envoyer la requête à l'API
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création du coupon");
      }
      
      // Réinitialiser le formulaire et afficher un message de succès
      reset();
      toast.success("Coupon créé avec succès!");
      
      // Rediriger vers la liste des coupons
      router.push('/dashboard/catalogue/coupons');
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.message || "Erreur lors de la création du coupon");
    } finally {
      setLoading(false);
    }
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
        title="Ajouter un nouveau coupon" 
        subtitle="Créez un nouveau code de réduction pour vos clients"
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
                buttonTitle="Créer le coupon"
                loadingButtonTitle="Création en cours..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
