import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SELLER') {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    const { title, description, image, link, isActive } = await request.json();
    
    // Vérification des données requises
    if (!title || !image) {
      return NextResponse.json(
        { message: "Le titre et l'image sont requis" },
        { status: 400 }
      );
    }

    // Récupérer le magasin du vendeur
    const store = await prisma.store.findFirst({
      where: {
        ownerId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json(
        { message: "Magasin non trouvé" },
        { status: 404 }
      );
    }
    
    // Création de la bannière dans la base de données
    const newBanner = await prisma.banner.create({
      data: {
        title,
        description,
        image,
        link: link || "",
        isActive: isActive === undefined ? true : isActive,
        storeId: store.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bannière créée avec succès",
      banner: newBanner
    });
  } catch (error) {
    console.error("Banner creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "La création de la bannière a échoué",
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("[BANNERS_GET] Récupération des bannières actives...");
    
    // Récupérer toutes les bannières actives des magasins approuvés
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        store: {
          isApproved: true
        }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`[BANNERS_GET] ${banners.length} bannières trouvées`);
    
    return NextResponse.json({ banners });
  } catch (error) {
    console.error("[BANNERS_GET] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des bannières" },
      { status: 500 }
    );
  }
}