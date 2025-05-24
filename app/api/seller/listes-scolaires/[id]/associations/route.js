import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

// GET - Récupérer les associations existantes pour une liste scolaire
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sellerId = session.user.id;
    
    // Vérifier que la liste existe et est publiée
    const listeScolaire = await prisma.listeScolaire.findFirst({
      where: {
        id,
        statut: "PUBLIEE"
      },
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée ou non publiée" },
        { status: 404 }
      );
    }

    // Récupérer les associations existantes pour ce vendeur et cette liste
    const associations = await prisma.produitBesoin.findMany({
      where: {
        besoin: {
          listeId: id
        },
        sellerId
      },
      include: {
        besoin: true,
        produit: true
      }
    });

    // Utiliser la fonction utilitaire pour sérialiser tous les BigInt
    const serializedAssociations = serializeBigInt(associations);
    
    return NextResponse.json(serializedAssociations);
  } catch (error) {
    console.error("Erreur lors de la récupération des associations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour les associations pour une liste scolaire
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sellerId = session.user.id;
    const body = await request.json();
    
    // Vérifier que la liste existe et est publiée
    const listeScolaire = await prisma.listeScolaire.findFirst({
      where: {
        id,
        statut: "PUBLIEE"
      },
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée ou non publiée" },
        { status: 404 }
      );
    }

    // Vérifier que les données sont valides
    if (!body.associations || !Array.isArray(body.associations)) {
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    // Supprimer les associations existantes pour ce vendeur et cette liste
    await prisma.produitBesoin.deleteMany({
      where: {
        besoin: {
          listeId: id
        },
        sellerId
      }
    });

    // Créer les nouvelles associations
    const newAssociations = [];
    
    for (const assoc of body.associations) {
      // Vérifier que le besoin appartient bien à cette liste
      const besoin = await prisma.besoin.findFirst({
        where: {
          id: assoc.besoinId,
          listeId: id
        }
      });

      if (!besoin) {
        continue; // Ignorer ce besoin s'il n'appartient pas à la liste
      }

      // Vérifier que le produit appartient bien à ce vendeur
      const produit = await prisma.product.findFirst({
        where: {
          id: assoc.produitId,
          store: {
            ownerId: sellerId
          }
        }
      });

      if (!produit) {
        continue; // Ignorer ce produit s'il n'appartient pas au vendeur
      }

      // Créer l'association
      const newAssoc = await prisma.produitBesoin.create({
        data: {
          besoinId: assoc.besoinId,
          produitId: assoc.produitId,
          sellerId,
          prix: assoc.prix,
          quantiteDisponible: assoc.quantiteDisponible
        }
      });

      newAssociations.push(newAssoc);

      // Mettre à jour le statut du besoin si nécessaire
      if (besoin.statut === "NON_COUVERT") {
        await prisma.besoin.update({
          where: { id: besoin.id },
          data: { statut: "PARTIELLEMENT_COUVERT" }
        });
      }
    }

    // Utiliser la fonction utilitaire pour sérialiser tous les BigInt
    const serializedAssociations = serializeBigInt(newAssociations);
    
    return NextResponse.json(serializedAssociations, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création des associations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
