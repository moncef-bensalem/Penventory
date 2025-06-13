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
  service: 'gmail',  // Utiliser le service prédéfini Gmail au lieu de la configuration manuelle
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'wkyl meph nbeq sddb',
  },
  tls: {
    rejectUnauthorized: false  // Aide à résoudre certains problèmes de certificat en production
  },
  // Désactiver la vérification du certificat pour éviter les problèmes en production
  ignoreTLS: false,
  requireTLS: true,
  debug: true, // Activer le debug pour voir les erreurs détaillées
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

    // Afficher les informations de configuration pour le débogage
    console.log('Configuration email:');
    console.log('- Mode:', isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT');
    console.log('- SEND_REAL_EMAILS:', process.env.SEND_REAL_EMAILS);
    console.log('- EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com');
    // Ne pas afficher le mot de passe complet pour des raisons de sécurité
    const passLength = (process.env.EMAIL_SERVER_PASSWORD || 'wkyl meph nbeq sddb').length;
    console.log('- EMAIL_SERVER_PASSWORD:', '*'.repeat(passLength) + ' (' + passLength + ' caractères)');

    // En production ou avec SEND_REAL_EMAILS activé, envoyer des emails réels
    if (isProduction || process.env.SEND_REAL_EMAILS === 'true') {
      console.log('Envoi d\'un email réel à:', to);
      
      // Vérifier la connexion au serveur SMTP avant d'envoyer
      try {
        await new Promise((resolve, reject) => {
          transporter.verify(function (error, success) {
            if (error) {
              console.error('Erreur de vérification SMTP:', error);
              reject(error);
            } else {
              console.log('Serveur SMTP prêt à recevoir des messages');
              resolve(success);
            }
          });
        });
      } catch (verifyError) {
        console.error('Impossible de se connecter au serveur SMTP:', verifyError);
        throw new Error(`Erreur de connexion SMTP: ${verifyError.message}`);
      }
      
      // Envoyer l'email
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
    console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
    console.error('Type d\'erreur:', error.name);
    console.error('Code d\'erreur:', error.code);
    console.error('Commande:', error.command);
    console.error('Réponse:', error.response);
    console.error('Message:', error.message);
    
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
  }
} 