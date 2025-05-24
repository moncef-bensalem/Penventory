import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

// GET - Récupérer une liste scolaire spécifique pour un vendeur
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
    
    // Vérifier que la liste existe et est publiée
    const listeScolaire = await prisma.listeScolaire.findFirst({
      where: {
        id,
        statut: "PUBLIEE"
      },
      include: {
        besoins: true,
      },
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée ou non publiée" },
        { status: 404 }
      );
    }

    // Utiliser la fonction utilitaire pour sérialiser tous les BigInt
    const serializedListe = serializeBigInt(listeScolaire);
    
    return NextResponse.json(serializedListe);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
