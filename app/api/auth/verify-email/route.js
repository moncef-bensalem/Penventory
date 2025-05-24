import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Vérification email - données reçues:", body);

    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { message: "Code de vérification et email requis" },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur avec cet email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    console.log("Utilisateur trouvé:", user ? user.id : "non trouvé");
    console.log("Token stocké:", user?.verificationToken);
    console.log("Token reçu:", token);

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier le code de vérification - comparaison directe du token
    if (!user.verificationToken || user.verificationToken.toString() !== token) {
      console.log("Code invalide - Attendu:", user.verificationToken, "Reçu:", token);
      return NextResponse.json(
        { message: "Code de vérification invalide" },
        { status: 400 }
      );
    }

    // Vérifier si l'email n'est pas déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email déjà vérifié" },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    console.log("Utilisateur mis à jour:", updatedUser);

    return NextResponse.json({ 
      message: "Email vérifié avec succès! Vous pouvez maintenant vous connecter.",
      user: updatedUser
    }, { status: 200 });
    
  } catch (error) {
    console.error("Erreur de vérification d'email:", error);
    return NextResponse.json({ 
      message: "Erreur lors de la vérification de l'email",
      error: error.message 
    }, { status: 500 });
  }
}
