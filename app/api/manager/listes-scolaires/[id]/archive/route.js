import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Archiver une liste scolaire (changer son statut à "ARCHIVEE")
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Vérifier si la liste existe
    const listeScolaire = await prisma.listeScolaire.findUnique({
      where: { id },
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si la liste est déjà archivée
    if (listeScolaire.statut === "ARCHIVEE") {
      return NextResponse.json(
        { error: "Cette liste est déjà archivée" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la liste
    const updatedListe = await prisma.listeScolaire.update({
      where: { id },
      data: {
        statut: "ARCHIVEE",
      },
      include: {
        besoins: true,
      },
    });

    return NextResponse.json(updatedListe);
  } catch (error) {
    console.error("Erreur lors de l'archivage de la liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
