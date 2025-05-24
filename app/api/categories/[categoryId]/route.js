import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

// Middleware pour vérifier le rôle administrateur
async function checkAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// Route pour récupérer une catégorie spécifique
export async function GET(request, { params }) {
  try {
    console.log(`[CATEGORY_GET] Fetching category with ID: ${params.categoryId}`);
    
    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId
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
    
    if (!category) {
      console.log(`[CATEGORY_GET] Category with ID ${params.categoryId} not found`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }
    
    console.log('[CATEGORY_GET] Category found:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_GET] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la récupération de la catégorie: ${error.message}` }, { status: 500 });
  }
}

// Route pour mettre à jour une catégorie spécifique
export async function PATCH(request, { params }) {
  try {
    console.log('[CATEGORY_PATCH] Checking admin authorization...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[CATEGORY_PATCH] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const categoryId = params.categoryId;
    const body = await request.json();
    console.log(`[CATEGORY_PATCH] Updating category ID: ${categoryId} with data:`, body);
    
    const { name, description, image, storeId } = body;
    
    if (!name || !description) {
      console.log('[CATEGORY_PATCH] Validation failed: missing required fields');
      return NextResponse.json({ error: 'Nom et description sont requis' }, { status: 400 });
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      console.log(`[CATEGORY_PATCH] Category with ID ${categoryId} not found`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    // Vérifier que le storeId existe si fourni
    if (storeId) {
      const store = await prisma.store.findUnique({
        where: { id: storeId }
      });
      
      if (!store) {
        console.log(`[CATEGORY_PATCH] Store with ID ${storeId} not found`);
        return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
      }
    }

    const category = await prisma.category.update({
      where: {
        id: categoryId
      },
      data: {
        name,
        description,
        image: image || null,
        storeId: storeId || undefined
      }
    });

    console.log('[CATEGORY_PATCH] Category updated successfully:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('[CATEGORY_PATCH] Error:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà dans ce magasin' }, { status: 400 });
    }
    
    return NextResponse.json({ error: `Erreur lors de la mise à jour de la catégorie: ${error.message}` }, { status: 500 });
  }
}

// Route pour supprimer une catégorie spécifique
export async function DELETE(request, { params }) {
  try {
    console.log('[CATEGORY_DELETE] Checking admin authorization...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[CATEGORY_DELETE] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const categoryId = params.categoryId;
    console.log(`[CATEGORY_DELETE] Deleting category ID: ${categoryId}`);
    
    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      console.log(`[CATEGORY_DELETE] Category with ID ${categoryId} not found`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    // Vérifier si la catégorie est utilisée par des produits
    const productsCount = await prisma.product.count({
      where: { categoryId }
    });

    if (productsCount > 0) {
      console.log(`[CATEGORY_DELETE] Category has ${productsCount} products, cannot delete`);
      return NextResponse.json(
        { error: `Cette catégorie est utilisée par ${productsCount} produits. Veuillez d'abord supprimer ou déplacer ces produits.` },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: categoryId }
    });

    console.log(`[CATEGORY_DELETE] Category ID ${categoryId} deleted successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CATEGORY_DELETE] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la suppression de la catégorie: ${error.message}` }, { status: 500 });
  }
}
