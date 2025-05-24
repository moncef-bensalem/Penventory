import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token } = body;

    console.log("Vérification de compte pour:", email, "Code:", token);

    if (!email || !token) {
      return NextResponse.json(
        { message: "Email et code de vérification requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("Utilisateur non trouvé:", email);
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le token existe
    if (!user.verificationToken) {
      console.log("Pas de token de vérification pour:", email);
      return NextResponse.json(
        { message: "Aucun code de vérification trouvé pour cet utilisateur" },
        { status: 400 }
      );
    }

    console.log("Token trouvé:", user.verificationToken);

    // Vérifier si le code correspond
    if (user.verificationToken !== token) {
      console.log("Code invalide, attendu:", user.verificationToken, "reçu:", token);
      return NextResponse.json(
        { message: "Code de vérification invalide" },
        { status: 400 }
      );
    }

    // Activer le compte en mettant à jour emailVerified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Supprimer le token après utilisation
      },
    });

    console.log("Compte activé pour:", email);

    return NextResponse.json(
      { 
        message: "Compte activé avec succès", 
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la vérification du compte:", error);
    
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la vérification du compte" },
      { status: 500 }
    );
  }
} 