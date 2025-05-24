import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// PATCH - Approuver ou rejeter un produit
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { productId } = params;
    const { approved } = await request.json();

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Mettre à jour le statut d'approbation du produit
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        approved: approved,
      },
      include: {
        category: true,
        store: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du produit:', error);
    return NextResponse.json({ error: `Erreur lors de la mise à jour du statut du produit: ${error.message}` }, { status: 500 });
  }
}
