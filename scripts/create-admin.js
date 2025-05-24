const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

// Identifiants administrateur sécurisés
// Ces valeurs peuvent être remplacées par des variables d'environnement
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@penventory.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Penventory2025';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrateur';

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    if (existingAdmin) {
      console.log('Un administrateur existe déjà dans la base de données.');
      return;
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('Administrateur créé avec succès:', admin.id);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
