import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les produits avec leurs relations
    const rawProducts = await prisma.product.findMany({
      include: {
        category: true,
        store: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transformer les produits pour éviter les références circulaires
    const products = rawProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: typeof product.stock === 'bigint' ? Number(product.stock) : product.stock,
      images: product.images,
      rating: product.rating,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description,
        image: product.category.image
      } : null,
      store: product.store ? {
        id: product.store.id,
        name: product.store.name,
        logo: product.store.logo,
        rating: product.store.rating,
        seller: product.store.owner ? {
          id: product.store.owner.id,
          name: product.store.owner.name,
          email: product.store.owner.email,
          image: product.store.owner.image
        } : null
      } : null
    }));
    
    // Sérialiser les produits pour gérer les BigInt
    const serializedProducts = JSON.parse(
      JSON.stringify(products, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );
    
    // Retourner les produits dans un format cohérent
    return NextResponse.json({ products: serializedProducts });
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des produits" }, { status: 500 });
  }
} 