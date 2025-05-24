import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/seller-auth";
import { PrismaClient } from "@prisma/client";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

export async function GET() {
  try {
    console.log('[SELLER_CATEGORIES_GET] Checking seller authorization...');
    const sellerData = await getSellerStore();
    if (!sellerData) {
      console.log('[SELLER_CATEGORIES_GET] Unauthorized or store not found');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    console.log(`[SELLER_CATEGORIES_GET] Fetching categories for store ID: ${store.id}`);

    const categories = await prisma.category.findMany({
      where: {
        storeId: store.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`[SELLER_CATEGORIES_GET] Found ${categories.length} categories`);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[SELLER_CATEGORIES_GET] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('[SELLER_CATEGORIES_POST] Checking seller authorization...');
    const sellerData = await getSellerStore();
    if (!sellerData) {
      console.log('[SELLER_CATEGORIES_POST] Unauthorized or store not found');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    
    const body = await request.json();
    console.log('[SELLER_CATEGORIES_POST] Received data:', body);
    
    const { name, description, image } = body;
    
    if (!name || !description) {
      console.log('[SELLER_CATEGORIES_POST] Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Le nom et la description sont requis' },
        { status: 400 }
      );
    }

    console.log(`[SELLER_CATEGORIES_POST] Creating category for store ID: ${store.id}`);
    
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image: image || null,
        storeId: store.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('[SELLER_CATEGORIES_POST] Category created successfully:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('[SELLER_CATEGORIES_POST] Error:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà dans votre boutique' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log('[SELLER_CATEGORIES_PUT] Checking seller authorization...');
    const sellerData = await getSellerStore();
    if (!sellerData) {
      console.log('[SELLER_CATEGORIES_PUT] Unauthorized or store not found');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    
    const body = await request.json();
    console.log('[SELLER_CATEGORIES_PUT] Received data:', body);
    
    const { id, name, description, image } = body;
    
    if (!id || !name || !description) {
      console.log('[SELLER_CATEGORIES_PUT] Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'ID, nom et description sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie appartient bien au vendeur
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!existingCategory) {
      console.log('[SELLER_CATEGORIES_PUT] Category not found or does not belong to this seller');
      return NextResponse.json(
        { error: 'Catégorie non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    console.log(`[SELLER_CATEGORIES_PUT] Updating category ID: ${id}`);
    
    const category = await prisma.category.update({
      where: {
        id
      },
      data: {
        name,
        description,
        image: image || null
      }
    });

    console.log('[SELLER_CATEGORIES_PUT] Category updated successfully:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('[SELLER_CATEGORIES_PUT] Error:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà dans votre boutique' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    console.log('[SELLER_CATEGORIES_DELETE] Checking seller authorization...');
    const sellerData = await getSellerStore();
    if (!sellerData) {
      console.log('[SELLER_CATEGORIES_DELETE] Unauthorized or store not found');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      console.log('[SELLER_CATEGORIES_DELETE] Validation failed: missing ID');
      return NextResponse.json(
        { error: 'ID de catégorie requis' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie appartient bien au vendeur
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!existingCategory) {
      console.log('[SELLER_CATEGORIES_DELETE] Category not found or does not belong to this seller');
      return NextResponse.json(
        { error: 'Catégorie non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Vérifier si des produits utilisent cette catégorie
    const productsCount = await prisma.product.count({
      where: {
        categoryId: id
      }
    });

    if (productsCount > 0) {
      console.log(`[SELLER_CATEGORIES_DELETE] Cannot delete: ${productsCount} products using this category`);
      return NextResponse.json(
        { error: `Impossible de supprimer cette catégorie car elle est utilisée par ${productsCount} produit(s)` },
        { status: 400 }
      );
    }

    console.log(`[SELLER_CATEGORIES_DELETE] Deleting category ID: ${id}`);
    
    await prisma.category.delete({
      where: {
        id
      }
    });

    console.log('[SELLER_CATEGORIES_DELETE] Category deleted successfully');
    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('[SELLER_CATEGORIES_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie: ' + error.message },
      { status: 500 }
    );
  }
}
