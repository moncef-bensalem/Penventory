import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les produits (sans filtre de stock) avec leurs relations
    const rawProducts = await prisma.product.findMany({
      include: {
        category: true,
        store: {
          include: {
            owner: true // Inclure les informations du vendeur (owner)
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
      stock: product.stock,
      // Utiliser directement les URLs d'images telles qu'elles sont stockées
      images: product.images || [],
      rating: product.rating,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryId: product.categoryId,
      storeId: product.storeId,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description,
        // Utiliser directement l'URL de l'image de catégorie
        image: product.category.image || null
      } : null,
      store: product.store ? {
        id: product.store.id,
        name: product.store.name,
        // Utiliser directement l'URL du logo du magasin
        logo: product.store.logo || null,
        rating: product.store.rating,
        description: product.store.description,
        address: product.store.address,
        city: product.store.city,
        phone: product.store.phone,
        email: product.store.email,
        website: product.store.website,
        facebook: product.store.facebook,
        instagram: product.store.instagram,
        owner: product.store.owner ? {
          id: product.store.owner.id,
          name: product.store.owner.name,
          email: product.store.owner.email,
          // Utiliser directement l'URL de l'image du vendeur
          image: product.store.owner.image || null,
          phone: product.store.owner.phone
        } : null
      } : null
    }));
    
    // Retourner les produits dans un format cohérent
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[AVAILABLE_PRODUCTS_GET]', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des produits disponibles" }, { status: 500 });
  }
}
