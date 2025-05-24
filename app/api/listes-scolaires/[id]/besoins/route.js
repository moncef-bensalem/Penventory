import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

export async function GET(request, { params }) {
  try {
    // S'assurer que params est bien attendu avant d'accéder à ses propriétés
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de liste scolaire non fourni" },
        { status: 400 }
      );
    }

    // Vérifier si la liste existe et est publiée
    const liste = await prisma.listeScolaire.findUnique({
      where: {
        id: id,
        statut: "PUBLIEE"
      }
    });

    if (!liste) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée ou non publiée" },
        { status: 404 }
      );
    }

    // Récupérer tous les besoins avec leurs produits associés
    const besoins = await prisma.besoin.findMany({
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
                    id: true,
                    name: true,
                    owner: {
                      select: {
                        id: true,
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
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(besoins));
  } catch (error) {
    console.error("Erreur lors de la récupération des besoins:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des besoins" },
      { status: 500 }
    );
  }
}
