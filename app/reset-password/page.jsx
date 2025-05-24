"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Logo } from "@/components/ui/logo";
import PasswordStrengthMeter from "@/components/ui/password-strength-meter";
import { validatePassword, validatePasswordWithDetails, logPasswordEvent } from "@/lib/password-validator";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordIssues, setPasswordIssues] = useState([]);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!email || !token) {
      router.push("/forgot-password");
    }
  }, [email, token, router]);

  // Vérifier la validité du mot de passe à chaque changement
  useEffect(() => {
    if (password) {
      const issues = validatePasswordWithDetails(password);
      setPasswordIssues(issues);
      setIsPasswordValid(issues.length === 0);
    } else {
      setPasswordIssues([]);
      setIsPasswordValid(false);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier la validité du mot de passe
    if (!isPasswordValid) {
      toast.error("Le mot de passe ne respecte pas les critères de sécurité");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    
    // Journaliser l'événement de tentative de réinitialisation
    logPasswordEvent("password_reset_attempt", {
      email,
      isValid: isPasswordValid
    });

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Journaliser le succès
        logPasswordEvent("password_reset_success", { email });
        
        toast.success("Mot de passe réinitialisé avec succès");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Journaliser l'échec
        logPasswordEvent("password_reset_failed", { 
          email,
          reason: data.message || "Erreur inconnue"
        });
        
        toast.error(data.message || "Erreur lors de la réinitialisation du mot de passe");
      }
    } catch (error) {
      console.error("Erreur:", error);
      
      // Journaliser l'erreur
      logPasswordEvent("password_reset_error", { 
        email,
        error: error.message
      });
      
      toast.error("Une erreur est survenue lors de la réinitialisation du mot de passe");
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
            Réinitialisation du mot de passe
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Définissez votre nouveau mot de passe sécurisé
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Indicateur de force du mot de passe */}
              {password && <PasswordStrengthMeter password={password} className="mt-2" />}
              
              {/* Affichage des problèmes de mot de passe */}
              {passwordIssues.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 space-y-1">
                  {passwordIssues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isPasswordValid || password !== confirmPassword}
              className="group relative flex w-full justify-center rounded-md bg-orange-600 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 