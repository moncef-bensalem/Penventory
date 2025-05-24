'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui/logo';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez saisir votre adresse email");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }
      
      setIsSubmitted(true);
      toast.success("Un code de vérification a été envoyé à votre adresse email");
      
      // Rediriger vers la page de vérification du code
      setTimeout(() => {
        router.push(`/verify-code?email=${encodeURIComponent(email)}&reset=true`);
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isSubmitted 
              ? "Vérifiez votre email pour le code de vérification" 
              : "Entrez votre email pour recevoir un code de vérification"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le code de vérification'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-600 dark:text-green-400 mb-4">
                Un code de vérification a été envoyé à votre adresse email.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Vérifiez votre boîte de réception et saisissez le code sur la page suivante.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Si vous ne trouvez pas l'email, vérifiez votre dossier spam.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-4">
                Redirection en cours...
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 