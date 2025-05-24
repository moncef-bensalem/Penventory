import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Route pour récupérer les détails d'une catégorie spécifique avec les produits associés (admin uniquement)
 */
export async function GET(request, { params }) {
  try {
    console.log(`[ADMIN_CATEGORY_GET] Récupération de la catégorie ID: ${params.categoryId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_CATEGORY_GET] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const categoryId = params.categoryId;
    
    // Récupérer la catégorie avec les informations sur le magasin et les produits associés
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        products: {
          include: {
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!category) {
      console.log(`[ADMIN_CATEGORY_GET] Catégorie avec l'ID ${categoryId} non trouvée`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }
    
    console.log(`[ADMIN_CATEGORY_GET] Catégorie ${category.name} récupérée avec ${category.products.length} produits`);
    return NextResponse.json({ category: category || {} });
  } catch (error) {
    console.error('[ADMIN_CATEGORY_GET] Erreur:', error);
    return NextResponse.json(
      { error: `Erreur lors de la récupération de la catégorie: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Route pour mettre à jour une catégorie spécifique (admin uniquement)
 */
export async function PATCH(request, { params }) {
  try {
    console.log(`[ADMIN_CATEGORY_PATCH] Mise à jour de la catégorie ID: ${params.categoryId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_CATEGORY_PATCH] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const categoryId = params.categoryId;
    const body = await request.json();
    
    const { name, description, image, storeId } = body;
    
    if (!name || !description) {
      console.log('[ADMIN_CATEGORY_PATCH] Validation échouée: champs requis manquants');
      return NextResponse.json({ error: 'Le nom et la description sont requis' }, { status: 400 });
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      console.log(`[ADMIN_CATEGORY_PATCH] Catégorie avec l'ID ${categoryId} non trouvée`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    // Vérifier que le magasin existe si fourni
    if (storeId) {
      const store = await prisma.store.findUnique({
        where: { id: storeId }
      });
      
      if (!store) {
        console.log(`[ADMIN_CATEGORY_PATCH] Magasin avec l'ID ${storeId} non trouvé`);
        return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
      }
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
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

    console.log(`[ADMIN_CATEGORY_PATCH] Catégorie ${updatedCategory.name} mise à jour avec succès`);
    return NextResponse.json({ category: updatedCategory || {} });
  } catch (error) {
    console.error('[ADMIN_CATEGORY_PATCH] Erreur:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Une catégorie avec ce nom existe déjà dans ce magasin' 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour de la catégorie: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Route pour supprimer une catégorie spécifique (admin uniquement)
 */
export async function DELETE(request, { params }) {
  try {
    console.log(`[ADMIN_CATEGORY_DELETE] Suppression de la catégorie ID: ${params.categoryId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_CATEGORY_DELETE] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const categoryId = params.categoryId;
    
    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      console.log(`[ADMIN_CATEGORY_DELETE] Catégorie avec l'ID ${categoryId} non trouvée`);
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    // Vérifier si la catégorie est utilisée par des produits
    const productsCount = await prisma.product.count({
      where: { categoryId }
    });

    if (productsCount > 0) {
      console.log(`[ADMIN_CATEGORY_DELETE] La catégorie a ${productsCount} produits, impossible de supprimer`);
      return NextResponse.json(
        { error: `Cette catégorie est utilisée par ${productsCount} produits. Veuillez d'abord supprimer ou déplacer ces produits.` },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: categoryId }
    });

    console.log(`[ADMIN_CATEGORY_DELETE] Catégorie ID ${categoryId} supprimée avec succès`);
    return NextResponse.json({ success: true, message: 'Catégorie supprimée avec succès' } || {});
  } catch (error) {
    console.error('[ADMIN_CATEGORY_DELETE] Erreur:', error);
    return NextResponse.json(
      { error: `Erreur lors de la suppression de la catégorie: ${error.message}` },
      { status: 500 }
    );
  }
}
