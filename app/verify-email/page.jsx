"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/logo";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          toast.error("Token de vérification manquant");
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Échec de la vérification");
        }

        toast.success(result.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (error) {
        toast.error(error.message || "Erreur lors de la vérification de l'email");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <Logo className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vérification de l'email
          </h2>
          <div className="mt-4">
            {verifying ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Vérification en cours...
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Redirection vers la page de connexion...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
