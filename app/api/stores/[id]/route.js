import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`[STORE_GET] Fetching store details for ID: ${id}`);
    
    // Récupérer les détails du magasin, mais seulement s'il est approuvé
    const store = await prisma.store.findFirst({
      where: {
        id: id,
        isApproved: true // Important: Ne récupérer que les magasins approuvés
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    if (!store) {
      console.log(`[STORE_GET] Store not found or not approved: ${id}`);
      return NextResponse.json({ 
        error: "Magasin non trouvé ou non approuvé" 
      }, { status: 404 });
    }
    
    console.log(`[STORE_GET] Store details found for ID: ${id}`);
    
    // Récupérer les produits associés à ce magasin
    const products = await prisma.product.findMany({
      where: {
        storeId: id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8 // Limiter à 8 produits pour performance
    });
    
    // Récupérer le nombre total de produits pour ce magasin
    const productsCount = await prisma.product.count({
      where: {
        storeId: id
      }
    });
    
    // Sérialiser les données pour gérer les BigInt
    const serializedData = JSON.parse(
      JSON.stringify({
        store,
        products,
        productsCount
      }, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );
    
    return NextResponse.json(serializedData);
    
  } catch (error) {
    console.error(`[STORE_GET] Error fetching store details for ID: ${params.id}`, error);
    
    return NextResponse.json({ 
      error: `Erreur lors de la récupération des détails du magasin: ${error.message}` 
    }, { status: 500 });
  }
} 