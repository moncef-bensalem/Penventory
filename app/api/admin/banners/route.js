import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer toutes les bannières
    const banners = await prisma.banner.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Retourner les bannières dans un format cohérent
    return NextResponse.json({ banners });
  } catch (error) {
    console.error('[ADMIN_BANNERS_GET]', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des bannières" }, { status: 500 });
  }
} 