"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error) => {
    switch (error) {
      case "OAuthSignin":
        return "Erreur lors de la connexion avec Google.";
      case "OAuthCallback":
        return "Erreur lors de la réponse de Google.";
      case "OAuthCreateAccount":
        return "Erreur lors de la création du compte.";
      case "EmailSignin":
        return "Erreur lors de l'envoi de l'email.";
      case "Callback":
        return "Erreur lors de la connexion.";
      case "OAuthAccountNotLinked":
        return "Cet email est déjà utilisé avec une autre méthode de connexion.";
      case "EmailCreateAccount":
        return "Erreur lors de la création du compte.";
      case "default":
        return "Une erreur est survenue lors de l'authentification.";
      default:
        return "Une erreur inattendue s'est produite.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600">
            Erreur d&apos;authentification
          </h2>
          <p className="mt-2 text-gray-600">{getErrorMessage(error)}</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Retour
          </Button>
          
          <Link href="/login" className="w-full">
            <Button className="w-full">
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
