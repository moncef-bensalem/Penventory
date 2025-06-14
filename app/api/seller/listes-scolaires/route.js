import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

// GET - Récupérer toutes les listes scolaires publiées pour les vendeurs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer uniquement les listes publiées
    const listes = await prisma.listeScolaire.findMany({
      where: {
        statut: "PUBLIEE"
      },
      select: {
        id: true,
        titre: true,
        description: true,
        classe: true,
        statut: true,
        createdAt: true,
        updatedAt: true,
        besoins: {
          select: {
            id: true,
            nomProduit: true,
            quantite: true,
            details: true,
            statut: true,
          }
        }
      }
    });
    
    // Utiliser la fonction utilitaire pour sérialiser tous les BigInt
    const serializedListes = serializeBigInt(listes);
    
    return NextResponse.json(serializedListes);
  } catch (error) {
    console.error("Erreur lors de la récupération des listes scolaires:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
