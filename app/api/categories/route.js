import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

async function checkAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET(request) {
  try {
    console.log('[CATEGORIES_GET] Fetching categories...');
    
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    let whereClause = {};
    
    if (storeId) {
      console.log(`[CATEGORIES_GET] Filtering by storeId: ${storeId}`);
      whereClause.storeId = storeId;
    }
    
    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('[CATEGORIES_GET] Found categories:', categories.length);
    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('[CATEGORIES_GET] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la récupération des catégories: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('[CATEGORIES_POST] Checking admin authorization...');
    
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[CATEGORIES_POST] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('[CATEGORIES_POST] Received data:', body);
    
    const { name, description, image, storeId } = body;
    
    if (!name || !description || !storeId) {
      console.log('[CATEGORIES_POST] Validation failed: missing required fields');
      return NextResponse.json({ error: 'Nom, description et ID du magasin sont requis' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });
    
    if (!store) {
      console.log(`[CATEGORIES_POST] Store with ID ${storeId} not found`);
      return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        storeId
      }
    });
    
    if (existingCategory) {
      console.log(`[CATEGORIES_POST] Category with name "${name}" already exists in store ${storeId}`);
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà dans ce magasin' }, { status: 400 });
    }

    console.log('[CATEGORIES_POST] Creating category...');
    
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image: image || null,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('[CATEGORIES_POST] Category created successfully:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORIES_POST] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la création de la catégorie: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    console.log('[CATEGORIES_DELETE] Checking admin authorization...');
    
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[CATEGORIES_DELETE] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      console.log('[CATEGORIES_DELETE] Validation failed: missing category ID');
      return NextResponse.json({ error: 'ID de la catégorie non fourni' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      console.log(`[CATEGORIES_DELETE] Category with ID ${id} not found`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });
    
    if (productsCount > 0) {
      console.log(`[CATEGORIES_DELETE] Category has ${productsCount} products, cannot delete`);
      return NextResponse.json(
        { error: `Cette catégorie est utilisée par ${productsCount} produits. Veuillez d'abord supprimer ou déplacer ces produits.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    console.log('[CATEGORIES_DELETE] Category deleted successfully');
    return NextResponse.json({ success: true, message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('[CATEGORIES_DELETE] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la suppression de la catégorie: ${error.message}` }, { status: 500 });
  }
}
