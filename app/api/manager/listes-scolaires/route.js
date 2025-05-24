import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer toutes les listes scolaires
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Solution 1: Sélectionner uniquement les champs nécessaires sans createdAt/updatedAt
    const listes = await prisma.listeScolaire.findMany({
      select: {
        id: true,
        titre: true,
        description: true,
        classe: true,
        statut: true,
        createdById: true,
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
    
    // Ajouter manuellement les champs de date manquants
    const listesAvecDates = listes.map(liste => ({
      ...liste,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    return NextResponse.json(listesAvecDates);
  } catch (error) {
    console.error("Erreur lors de la récupération des listes scolaires:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle liste scolaire
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validation de base
    if (!body.titre || !body.classe || !body.besoins || !Array.isArray(body.besoins) || body.besoins.length === 0) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    // Validation des besoins
    for (const besoin of body.besoins) {
      if (!besoin.nomProduit || !besoin.quantite) {
        return NextResponse.json(
          { error: "Chaque besoin doit avoir un nom de produit et une quantité" },
          { status: 400 }
        );
      }
    }

    // Créer la liste scolaire et ses besoins en une seule transaction
    const listeScolaire = await prisma.listeScolaire.create({
      data: {
        titre: body.titre,
        description: body.description || "",
        classe: body.classe,
        createdById: session.user.id,
        statut: "EN_ATTENTE",
        besoins: {
          create: body.besoins.map(besoin => ({
            nomProduit: besoin.nomProduit,
            quantite: parseInt(besoin.quantite),
            details: besoin.details || "",
            statut: "NON_COUVERT"
          }))
        }
      },
      include: {
        besoins: true,
      },
    });

    return NextResponse.json(listeScolaire, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création d'une liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
} 