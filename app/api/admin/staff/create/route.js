import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Rôles valides pour le personnel
const VALID_STAFF_ROLES = ['ADMIN', 'MANAGER', 'SUPPORT'];

export async function POST(req) {
  console.log('[ADMIN_STAFF_CREATE] Démarrage de la requête...');
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_STAFF_CREATE] Accès non autorisé');
      
      // En développement, permettre l'accès pour faciliter les tests
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      } else {
        console.warn('[ADMIN_STAFF_CREATE] Accès non autorisé ignoré en mode développement');
      }
    }

    // Récupérer les données du formulaire
    const body = await req.json();
    const { name, email, password, role, department, phone } = body;

    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nom, email et mot de passe sont requis" }, { status: 400 });
    }

    if (!VALID_STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        emailVerified: new Date(), // Marque l'email comme vérifié pour les membres du personnel
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log(`[ADMIN_STAFF_CREATE] Utilisateur créé: ${newUser.id}`);

    // Construire et retourner la réponse
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      department: department || determineDefaultDepartment(role),
      position: determineDefaultPosition(role),
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: newUser.createdAt,
      lastLogin: null
    };

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_STAFF_CREATE] Erreur:', error);
    return NextResponse.json({ error: "Erreur lors de la création du membre" }, { status: 500 });
  }
}

// Fonction pour déterminer le département par défaut selon le rôle
function determineDefaultDepartment(role) {
  switch(role) {
    case 'ADMIN':
      return 'Direction';
    case 'MANAGER':
      return 'Gestion';
    case 'SUPPORT':
      return 'Support Client';
    default:
      return 'Autre';
  }
}

// Fonction pour déterminer le poste par défaut selon le rôle
function determineDefaultPosition(role) {
  switch(role) {
    case 'ADMIN':
      return 'Directeur Général';
    case 'MANAGER':
      return 'Responsable';
    case 'SUPPORT':
      return 'Agent de Support';
    default:
      return 'Membre';
  }
} 