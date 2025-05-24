import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

// GET - Récupérer toutes les associations de produits pour une liste scolaire
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Vérifier que la liste existe
    const listeScolaire = await prisma.listeScolaire.findUnique({
      where: { id }
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée" },
        { status: 404 }
      );
    }

    // Organiser les associations par besoin
    const besoinsWithAssociations = await prisma.besoin.findMany({
      where: {
        listeId: id
      },
      include: {
        produitAssociations: {
          include: {
            produit: {
              include: {
                store: {
                  select: {
                    name: true,
                    owner: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            },
            seller: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(besoinsWithAssociations));
  } catch (error) {
    console.error("Erreur lors de la récupération des associations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PATCH - Valider une association produit-besoin
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Vérifier que la liste existe
    const listeScolaire = await prisma.listeScolaire.findUnique({
      where: { id }
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée" },
        { status: 404 }
      );
    }

    // Valider les associations
    const { associationIds, validated } = body;
    
    if (!associationIds || !Array.isArray(associationIds)) {
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut des associations
    const updatedAssociations = await Promise.all(
      associationIds.map(async (associationId) => {
        return prisma.produitBesoin.update({
          where: { id: associationId },
          data: { validated: validated }
        });
      })
    );

    // Si toutes les associations sont validées, mettre à jour le statut du besoin
    if (validated) {
      for (const association of updatedAssociations) {
        await prisma.besoin.update({
          where: { id: association.besoinId },
          data: { statut: "COUVERT" }
        });
      }
    }

    return NextResponse.json(serializeBigInt(updatedAssociations));
  } catch (error) {
    console.error("Erreur lors de la validation des associations:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
