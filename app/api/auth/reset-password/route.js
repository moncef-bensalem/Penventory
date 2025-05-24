import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { validatePasswordWithDetails, logPasswordEvent } from "@/lib/password-validator";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token, password } = body;

    if (!email || !token || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier la force du mot de passe
    const passwordIssues = validatePasswordWithDetails(password);
    if (passwordIssues.length > 0) {
      logPasswordEvent("password_reset_validation_failed", {
        email,
        issues: passwordIssues.length
      });
      
      return NextResponse.json(
        { 
          message: "Le mot de passe ne respecte pas les critères de sécurité",
          issues: passwordIssues 
        },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le token existe
    if (!user.verificationToken) {
      return NextResponse.json(
        { message: "Aucun token de réinitialisation trouvé pour cet utilisateur" },
        { status: 400 }
      );
    }

    // Parser le token JSON
    let verificationData;
    try {
      verificationData = JSON.parse(user.verificationToken);
    } catch (error) {
      console.error("Erreur de parsing du token:", error);
      return NextResponse.json(
        { message: "Format de token invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le token est pour la réinitialisation de mot de passe
    if (verificationData.type !== "reset_password_validated") {
      return NextResponse.json(
        { message: "Type de token de réinitialisation invalide" },
        { status: 400 }
      );
    }

    // Vérifier le token
    if (verificationData.token !== token) {
      return NextResponse.json(
        { message: "Token de réinitialisation invalide" },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    const expiresAt = new Date(verificationData.expires);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Le token de réinitialisation a expiré" },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe avec un coût plus élevé pour plus de sécurité
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null
      }
    });

    // Journaliser la réinitialisation réussie
    logPasswordEvent("password_reset_completed", {
      userId: user.id,
      email: user.email
    });

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    
    logPasswordEvent("password_reset_error", {
      error: error.message
    });
    
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
} 