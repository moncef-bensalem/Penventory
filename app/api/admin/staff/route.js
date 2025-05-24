import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Rôles considérés comme "staff" (personnel administratif)
const STAFF_ROLES = ['ADMIN', 'MANAGER', 'SUPPORT'];

export async function GET() {
  console.log('[ADMIN_STAFF_GET] Démarrage de la requête...');
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_STAFF_GET] Accès non autorisé');
      
      // En développement, permettre l'accès pour faciliter les tests
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      } else {
        console.warn('[ADMIN_STAFF_GET] Accès non autorisé ignoré en mode développement');
      }
    }

    // Récupérer tous les utilisateurs avec des rôles de personnel
    const staffMembers = await prisma.user.findMany({
      where: {
        role: {
          in: STAFF_ROLES
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`[ADMIN_STAFF_GET] Récupéré ${staffMembers.length} membres du personnel`);
    
    // Transformer les données pour inclure des informations additionnelles
    const transformedStaff = staffMembers.map(staff => {
      // Déterminer le département et le poste en fonction du rôle
      let department, position;
      
      switch(staff.role) {
        case 'ADMIN':
          department = 'Direction';
          position = 'Directeur Général';
          break;
        case 'MANAGER':
          if (staff.email.includes('vente') || staff.email.includes('sales')) {
            department = 'Ventes';
            position = 'Responsable des Ventes';
          } else if (staff.email.includes('catalogue') || staff.email.includes('product')) {
            department = 'Catalogue';
            position = 'Responsable Catalogue';
          } else if (staff.email.includes('vendeur') || staff.email.includes('seller')) {
            department = 'Relations Vendeurs';
            position = 'Responsable Partenariats';
          } else {
            department = 'Gestion';
            position = 'Responsable';
          }
          break;
        case 'SUPPORT':
          department = 'Support Client';
          position = 'Agent de Support';
          break;
        default:
          department = 'Autre';
          position = 'Membre';
      }
      
      // Simulation d'une date de dernière connexion (pour démo)
      const lastLogin = new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000);
      
      return {
        ...staff,
        status: staff.emailVerified ? 'ACTIVE' : 'PENDING',
        department,
        position,
        permissions: staff.role === 'ADMIN' ? ['all'] : 
                    staff.role === 'MANAGER' ? ['users_read', 'users_write', 'products_read', 'products_write', 'orders_read'] :
                    ['customers_read', 'orders_read', 'tickets_read', 'tickets_write'],
        lastLogin
      };
    });
    
    return NextResponse.json(transformedStaff);
  } catch (error) {
    console.error('[ADMIN_STAFF_GET] Erreur:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération du personnel" }, { status: 500 });
  }
} 