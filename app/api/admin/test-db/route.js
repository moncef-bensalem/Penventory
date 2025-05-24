import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('[TEST_DB] Tentative de connexion à la base de données...');
    
    // Essayer de récupérer un magasin
    const stores = await prisma.store.findMany({
      take: 5,
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
    });
    
    console.log(`[TEST_DB] Connexion réussie, ${stores.length} magasins récupérés`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connexion à la base de données réussie',
      stores
    });
  } catch (error) {
    console.error('[TEST_DB] Erreur de connexion:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur de connexion à la base de données',
      error: error.message
    }, { status: 500 });
  }
} 