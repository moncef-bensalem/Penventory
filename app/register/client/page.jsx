"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Logo } from "@/components/ui/logo";
import PasswordStrengthMeter from "@/components/ui/password-strength-meter";
import { validatePassword, logPasswordEvent } from "@/lib/password-validator";
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // Observer la valeur du mot de passe pour mettre à jour l'indicateur
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password") {
        setPassword(value.password || "");
        setIsPasswordValid(validatePassword(value.password || ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data) => {
    try {
      // Vérifier encore une fois la validité du mot de passe
      if (!validatePassword(data.password)) {
        toast.error("Votre mot de passe ne respecte pas les critères de sécurité");
        return;
      }
      
      setIsLoading(true);
      
      // Journalisation de l'événement (sans le mot de passe)
      logPasswordEvent("password_creation_attempt", {
        email: data.email,
        isValid: isPasswordValid,
        userType: "client"
      });
      
      const response = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      
      // Analyser la réponse JSON
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        throw new Error("Erreur lors de l'analyse de la réponse du serveur");
      }

      if (!response.ok) {
        logPasswordEvent("password_creation_failed", {
          email: data.email,
          reason: result.message || "Erreur inconnue",
          userType: "client"
        });
        throw new Error(result.message || "Une erreur est survenue lors de l'inscription");
      }

      // Journalisation du succès
      logPasswordEvent("password_creation_success", {
        email: data.email,
        userType: "client"
      });

      toast.success(result.message || "Compte créé avec succès! Vérifiez votre email.");
      
      // Rediriger vers la page de vérification avec l'email et le paramètre d'activation
      router.push(`/verify-code?email=${encodeURIComponent(data.email)}&activation=true`);
      
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { 
      callbackUrl: "/api/auth/redirect-by-role?role=CUSTOMER",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Créer un compte client
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Rejoignez-nous pour accéder à notre boutique en ligne
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Le nom est requis" })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email invalide",
                  },
                })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Le mot de passe est requis",
                    validate: (value) => validatePassword(value) || "Ce mot de passe ne répond pas aux critères de sécurité"
                  })}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
              
              {/* Indicateur de force du mot de passe */}
              <PasswordStrengthMeter 
                password={password} 
                className="mt-3"
              />
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <FcGoogle className="w-5 h-5" />
                Continuer avec Google
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà inscrit ?{" "}
              <Link
                href="/login"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 