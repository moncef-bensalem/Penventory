import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Créer une nouvelle instance de PrismaClient directement
const prisma = new PrismaClient();

// GET: Récupère tous les produits
export async function GET(req) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const storeId = searchParams.get('storeId');
    const available = searchParams.get('available') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;
    
    // Construire les conditions de recherche
    const where = {};
    
    // Filtrer par catégorie si spécifié
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Filtrer par magasin si spécifié
    if (storeId) {
      where.storeId = storeId;
    }
    
    // Filtrer uniquement les produits disponibles si demandé
    if (available) {
      where.stock = { gt: 0 };
    }
    
    // Récupérer les produits avec les relations
    const products = await prisma.product.findMany({
      where,
      include: {
        store: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {})
    });

    // Convertir les BigInt en nombre pour la sérialisation JSON
    const serializedProducts = JSON.parse(
      JSON.stringify(products, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    // Utiliser exactement le même format que l'API qui fonctionne
    return NextResponse.json({ products: serializedProducts });
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return NextResponse.json({ error: `Erreur lors de la récupération des produits: ${error.message}` }, { status: 500 });
  }
}

// POST: Crée un nouveau produit
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, price, stock, categoryId, images, storeId } = body;

    if (!name || !description || !price || !categoryId || !storeId) {
      return NextResponse.json({ error: 'Informations manquantes' }, { status: 400 });
    }

    // Vérifier que le magasin existe
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        images: images || [],
        storeId,
        categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0.0 // Valeur par défaut pour le rating
      },
      include: {
        store: true,
        category: true
      }
    });

    // Convertir le BigInt en nombre pour la sérialisation JSON
    const serializedProduct = JSON.parse(
      JSON.stringify(product, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json({ product: serializedProduct });
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return NextResponse.json({ error: `Erreur lors de la création du produit: ${error.message}` }, { status: 500 });
  }
}

// PATCH: Met à jour un produit existant
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du produit manquant' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        store: true
      }
    });

    // Convertir les BigInt en nombre pour la sérialisation JSON
    const serializedProduct = JSON.parse(
      JSON.stringify(product, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json({ product: serializedProduct });
  } catch (error) {
    console.error('[PRODUCTS_PATCH]', error);
    return NextResponse.json({ error: `Erreur lors de la mise à jour du produit: ${error.message}` }, { status: 500 });
  }
}

// DELETE: Supprime un produit existant
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du produit manquant' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('[PRODUCTS_DELETE]', error);
    return NextResponse.json({ error: `Erreur lors de la suppression du produit: ${error.message}` }, { status: 500 });
  }
}
