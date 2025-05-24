import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les utilisateurs avec leurs relations
    const rawUsers = await prisma.user.findMany({
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            isApproved: true
          }
        },
        orders: {
          select: {
            id: true
          }
        },
        reviews: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transformer les utilisateurs pour éviter les références circulaires
    const users = rawUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ordersCount: user.orders.length,
      reviewsCount: user.reviews.length,
      store: user.store ? {
        id: user.store.id,
        name: user.store.name,
        logo: user.store.logo,
        isApproved: user.store.isApproved
      } : null
    }));
    
    // Retourner les utilisateurs dans un format cohérent
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[ADMIN_USERS_GET]', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 });
  }
} 