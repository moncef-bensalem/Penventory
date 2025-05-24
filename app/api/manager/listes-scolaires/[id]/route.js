import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer une liste scolaire spécifique
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = params;
    
    const listeScolaire = await prisma.listeScolaire.findUnique({
      where: {
        id,
      },
      include: {
        besoins: true,
      },
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(listeScolaire);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une liste scolaire
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    // Vérification de l'existence de la liste
    const listeScolaire = await prisma.listeScolaire.findUnique({
      where: { id },
      include: { besoins: true },
    });

    if (!listeScolaire) {
      return NextResponse.json(
        { error: "Liste scolaire non trouvée" },
        { status: 404 }
      );
    }

    // Validation de base
    if (!body.titre || !body.classe || !body.besoins || !Array.isArray(body.besoins)) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    // Mise à jour de la liste scolaire
    const updatedListe = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les informations de base
      const updated = await tx.listeScolaire.update({
        where: { id },
        data: {
          titre: body.titre,
          description: body.description || "",
          classe: body.classe,
        },
      });

      // 2. Supprimer les besoins existants
      await tx.besoin.deleteMany({
        where: { listeId: id },
      });

      // 3. Créer les nouveaux besoins
      const newBesoins = [];
      for (const besoin of body.besoins) {
        const newBesoin = await tx.besoin.create({
          data: {
            listeId: id,
            nomProduit: besoin.nomProduit,
            quantite: parseInt(besoin.quantite),
            details: besoin.details || "",
            statut: "NON_COUVERT"
          },
        });
        newBesoins.push(newBesoin);
      }

      // 4. Récupérer la liste mise à jour avec ses nouveaux besoins
      return await tx.listeScolaire.findUnique({
        where: { id },
        include: { besoins: true },
      });
    });

    return NextResponse.json(updatedListe);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une liste scolaire
export async function DELETE(request, { params }) {
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

    // Supprimer d'abord les besoins associés, puis la liste elle-même
    await prisma.$transaction([
      prisma.besoin.deleteMany({
        where: { listeId: id },
      }),
      prisma.listeScolaire.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json(
      { message: "Liste scolaire supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la liste scolaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
} 