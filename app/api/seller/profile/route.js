import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

// Middleware pour vérifier le rôle vendeur
async function checkSellerRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SELLER') {
    return false;
  }
  return session.user;
}

export async function GET() {
  try {
    const user = await checkSellerRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        store: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await checkSellerRole();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si la requête contient des données JSON valides
    let data;
    try {
      data = await request.json();
      console.log("[PROFILE_PUT] Données JSON reçues:", JSON.stringify(data).substring(0, 100) + "...");
    } catch (error) {
      console.log("[PROFILE_PUT] Erreur de parsing JSON:", error.message);
      return NextResponse.json({ 
        error: "Format de données invalide: " + error.message
      }, { status: 400 });
    }
    
    // Vérifier que les données ne sont pas null
    if (!data) {
      console.log("[PROFILE_PUT] Aucune donnée fournie");
      return NextResponse.json({ 
        error: "Aucune donnée fournie"
      }, { status: 400 });
    }

    const { name, phone, image } = data;

    // Validation des données
    if (!name) {
      console.log("[PROFILE_PUT] Nom manquant");
      return NextResponse.json({ 
        error: "Le nom est obligatoire"
      }, { status: 400 });
    }

    try {
      console.log("[PROFILE_PUT] Mise à jour du profil pour l'utilisateur:", user.id);
      const updatedProfile = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone: phone || undefined,
          image: image || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          role: true,
        },
      });

      console.log("[PROFILE_PUT] Profil mis à jour avec succès");
      return NextResponse.json(updatedProfile);
    } catch (dbError) {
      console.error("[PROFILE_PUT] Erreur de base de données:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du profil: " + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[PROFILE_PUT] Erreur générale:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil: " + error.message },
      { status: 500 }
    );
  }
}
