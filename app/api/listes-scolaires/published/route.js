import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

export async function GET(request) {
  try {
    // Cette API est publique, pas besoin d'authentification

    // Récupérer toutes les listes scolaires publiées
    const listes = await prisma.listeScolaire.findMany({
      where: {
        statut: "PUBLIEE"
      },
      include: {
        besoins: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(serializeBigInt(listes));
  } catch (error) {
    console.error("Erreur lors de la récupération des listes scolaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des listes scolaires" },
      { status: 500 }
    );
  }
}
