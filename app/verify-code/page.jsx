"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Logo } from '@/components/ui/logo';

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const email = searchParams.get('email');
  const isActivation = searchParams.get('activation') === 'true';
  const isPasswordReset = searchParams.get('reset') === 'true';

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || token.length !== 6) {
      toast.error('Veuillez entrer un code de vérification valide à 6 chiffres');
      return;
    }

    setLoading(true);
    
    try {
      // Déterminer quelle API appeler en fonction du type de vérification
      let apiEndpoint = '/api/auth/verify-account';
      let successMessage = 'Compte activé avec succès';
      let redirectPath = '/login';
      
      if (isPasswordReset) {
        apiEndpoint = '/api/auth/verify-reset-code';
        successMessage = 'Code vérifié avec succès';
      }
      
      console.log(`Envoi du code de vérification: ${token} pour ${isPasswordReset ? 'réinitialisation de mot de passe' : 'activation de compte'}`);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          token: token.toString()
        }),
      });

      const data = await response.json();
      console.log('Réponse API:', data);

      if (response.ok) {
        toast.success(successMessage);
        
        if (isPasswordReset) {
          // Si c'est une réinitialisation de mot de passe, rediriger vers la page de réinitialisation
          // avec le token récupéré de l'API
          toast.success('Vous allez être redirigé vers la page de réinitialisation de mot de passe');
          setTimeout(() => {
            router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.resetToken)}`);
          }, 2000);
        } else {
          // Si c'est une activation de compte, rediriger vers la page de connexion
          toast.success('Vous pouvez maintenant vous connecter avec votre compte');
          setTimeout(() => {
            router.push(redirectPath);
          }, 2000);
        }
      } else {
        toast.error(data.message || 'Erreur lors de la vérification du code');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de la vérification du code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="h-12 w-auto" />
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isPasswordReset ? 'Vérification du code' : 'Activation du compte'}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez le code de vérification envoyé à votre adresse email
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="token" className="sr-only">
                Code de vérification
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                maxLength={6}
                className="relative block w-full rounded-md border-0 p-3 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-lg"
                placeholder="123456"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-orange-600 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-orange-300"
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              href={isPasswordReset ? "/forgot-password" : "/register"}
              className="text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              Renvoyer un nouveau code
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VerifyCodeContent />
    </Suspense>
  );
}
