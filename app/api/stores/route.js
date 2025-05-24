import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

export async function POST(request) {
  try {
    const { name, description, logo, ownerId } = await request.json();
    
    if (!name || !description || !ownerId) {
      return NextResponse.json(
        { error: "Le nom, la description et l'ID du propriétaire sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const owner = await prisma.user.findUnique({
      where: { id: ownerId }
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a déjà un magasin
    const existingStore = await prisma.store.findUnique({
      where: { ownerId }
    });

    if (existingStore) {
      return NextResponse.json(existingStore);
    }

    // Créer le magasin
    const store = await prisma.store.create({
      data: {
        name,
        description,
        logo,
        ownerId
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('[STORES_POST]', error);
    return NextResponse.json(
      { error: "Erreur lors de la création du magasin" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("[STORES_GET] Récupération des magasins...");
    
    // Récupérer tous les magasins approuvés
    const stores = await prismaClient.store.findMany({
      where: {
        isApproved: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        banner: true,
        isApproved: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`[STORES_GET] ${stores.length} magasins trouvés`);
    
    return NextResponse.json({ stores });
  } catch (error) {
    console.error("[STORES_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des magasins" },
      { status: 500 }
    );
  }
}