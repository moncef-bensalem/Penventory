import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { message: "Email et code de vérification requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (!user.verificationToken) {
      return NextResponse.json(
        { message: "Aucune demande de réinitialisation de mot de passe en cours" },
        { status: 400 }
      );
    }

    try {
      // Parser le token JSON
      const storedToken = JSON.parse(user.verificationToken);
      
      // Vérifier que c'est bien un token de réinitialisation de mot de passe
      if (storedToken.type !== "reset_password") {
        return NextResponse.json(
          { message: "Type de token invalide" },
          { status: 400 }
        );
      }
      
      // Vérifier que le token n'a pas expiré
      if (new Date(storedToken.expires) < new Date()) {
        return NextResponse.json(
          { message: "Le code de vérification a expiré" },
          { status: 400 }
        );
      }
      
      // Vérifier que le token correspond
      if (storedToken.token !== token) {
        return NextResponse.json(
          { message: "Code de vérification invalide" },
          { status: 400 }
        );
      }

      // Générer un UUID sécurisé pour la réinitialisation du mot de passe
      const resetToken = uuidv4();
      
      // Mettre à jour le token avec le nouveau UUID et un nouveau délai d'expiration
      const newTokenData = {
        type: "reset_password_validated",
        token: resetToken,
        expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes supplémentaires
      };
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: JSON.stringify(newTokenData)
        },
      });

      return NextResponse.json(
        { 
          message: "Code vérifié avec succès",
          resetToken: resetToken
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors du parsing du token:", error);
      return NextResponse.json(
        { message: "Format de token invalide" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du code:", error);
    
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la vérification du code" },
      { status: 500 }
    );
  }
} 