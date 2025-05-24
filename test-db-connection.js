const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    // Test simple de connexion en récupérant le nombre de produits
    const count = await prisma.product.count();
    console.log(`Connexion réussie. Nombre de produits: ${count}`);
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
