/**
 * Module de simulation d'envoi d'email
 * 
 * En mode développement, cette fonction simule l'envoi d'emails en
 * affichant les détails dans la console.
 * 
 * En production, vous devrez remplacer cette implémentation par un
 * véritable service d'envoi d'emails comme:
 * - Nodemailer avec SMTP
 * - SendGrid
 * - Mailgun
 * - Amazon SES
 */

import nodemailer from 'nodemailer';

// Configuration pour l'environnement
const isProduction = process.env.NODE_ENV === 'production';

// Créer un transporteur pour l'envoi d'emails
let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: parseInt(process.env.EMAIL_SERVER_PORT || '587') === 465, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'pqgj cilj wmxk acpa',
  },
});

/**
 * Fonction d'envoi d'email
 * @param {Object} params Paramètres d'envoi
 * @param {string} params.to Adresse email du destinataire
 * @param {string} params.subject Sujet de l'email
 * @param {string} params.text Contenu texte de l'email
 * @param {string} params.html Contenu HTML de l'email
 * @returns {Promise} Promesse résolue après l'envoi
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    // Préparer les options d'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'moncefbensalem222@gmail.com',
      to,
      subject,
      text,
      html,
    };

    // En production ou avec SEND_REAL_EMAILS activé, envoyer des emails réels
    if (isProduction || process.env.SEND_REAL_EMAILS === 'true') {
      console.log('Envoi d\'un email réel à:', to);
      const info = await transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès:', info.messageId);
      return {
        success: true,
        id: info.messageId,
        message: 'Email envoyé avec succès'
      };
    } 
    // Sinon, simuler l'envoi en développement
    else {
      // Afficher les détails de l'email dans la console
      console.log('');
      console.log('=====================================================');
      console.log('🚀 SIMULATION D\'ENVOI D\'EMAIL');
      console.log('-----------------------------------------------------');
      console.log('📧 De: ' + mailOptions.from);
      console.log('📧 À: ' + to);
      console.log('📋 Sujet: ' + subject);
      console.log('📝 Contenu:');
      console.log(text);
      console.log('-----------------------------------------------------');
      console.log('⚠️ EMAIL SIMULÉ - Pour envoyer des emails réels, ajoutez SEND_REAL_EMAILS=true à votre fichier .env');
      console.log('=====================================================');
      console.log('');
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        id: `simulated-${Date.now()}`,
        message: 'Email simulé avec succès'
      };
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
  }
} 