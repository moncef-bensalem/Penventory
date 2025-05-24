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

    // Récupérer les détails de la liste scolaire
    const liste = await prisma.listeScolaire.findUnique({
      where: {
        id: id,
        statut: "PUBLIEE" // Seulement les listes publiées sont accessibles
      },
      include: {
        besoins: {
          include: {
            produitAssociations: {
              where: {
                validated: true // Seulement les associations validées sont visibles pour les clients
              },
              include: {
                produit: true,
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
        }
      }
    });

    if (!liste) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée ou non publiée" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(liste));
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails de la liste scolaire" },
      { status: 500 }
    );
  }
}
