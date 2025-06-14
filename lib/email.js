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
let transporter;

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
  console.error('ERREUR: Variables d\'environnement EMAIL_SERVER_USER ou EMAIL_SERVER_PASSWORD non définies');
  console.error('Veuillez configurer ces variables dans votre fichier .env ou dans votre environnement de production');
}

// Détecter si nous sommes en environnement de production
const isProd = process.env.NODE_ENV === 'production';
console.log(`Environnement détecté: ${isProd ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);

// Configuration spécifique pour la production
if (isProd) {
  console.log('Utilisation de la configuration SMTP sécurisée pour la production');
  
  // Configuration Gmail avec OAuth2 pour une meilleure sécurité
  // Voir: https://nodemailer.com/smtp/oauth2/
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com',
      // IMPORTANT: Utiliser un nouveau mot de passe d'application généré depuis votre compte Google
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,  // Activer le debug pour voir les erreurs détaillées
  });
  
  // Vérifier immédiatement la connexion
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Erreur avec la configuration service Gmail:', error);
      console.log('Tentative avec une configuration SMTP manuelle...');
      
      // Si la première configuration échoue, essayer avec une configuration manuelle
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com',
          pass: process.env.EMAIL_SERVER_PASSWORD || 'bkab egva uenf ctkp',
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: true
      });
    } else {
      console.log('Connexion SMTP Gmail établie avec succès');
    }
  });
} else {
  // Configuration pour le développement local
  console.log('Utilisation de la configuration SMTP standard pour le développement');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com',
      pass: process.env.EMAIL_SERVER_PASSWORD || 'wkyl meph nbeq sddb',
    },
    debug: true  // Activer le debug pour voir les erreurs détaillées
  });
}

// Vérifier la connexion au serveur SMTP
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de connexion au serveur SMTP:', error);
  } else {
    console.log('Serveur SMTP prêt à recevoir des messages');
  }
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
    
    // Vérifier si les variables d'environnement sont définies
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error('ATTENTION: Variables d\'environnement EMAIL_SERVER_USER ou EMAIL_SERVER_PASSWORD non définies');
    } else {
      console.log('- EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER);
      // Ne pas afficher le mot de passe pour des raisons de sécurité
      const passLength = process.env.EMAIL_SERVER_PASSWORD.length;
      console.log('- EMAIL_SERVER_PASSWORD:', '*'.repeat(passLength) + ' (' + passLength + ' caractères)');
    }

    // En production ou avec SEND_REAL_EMAILS activé, envoyer des emails réels
    if (isProduction || process.env.SEND_REAL_EMAILS === 'true') {
      console.log('Envoi d\'un email réel à:', to);
      console.log('Variables d\'environnement disponibles:', {
        NODE_ENV: process.env.NODE_ENV,
        EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER ? 'Défini' : 'Non défini',
        EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? 'Défini (longueur: ' + process.env.EMAIL_SERVER_PASSWORD.length + ')' : 'Non défini',
        EMAIL_FROM: process.env.EMAIL_FROM || 'Non défini (utilisant valeur par défaut)',
      });
      
      // Vérifier la connexion au serveur SMTP avant d'envoyer
      try {
        await new Promise((resolve, reject) => {
          transporter.verify(function (error, success) {
            if (error) {
              console.error('Erreur de vérification SMTP:', error);
              console.error('Détails de l\'erreur:', JSON.stringify(error, null, 2));
              reject(error);
            } else {
              console.log('Serveur SMTP prêt à recevoir des messages');
              resolve(success);
            }
          });
        });
      } catch (verifyError) {
        console.error('Impossible de se connecter au serveur SMTP:', verifyError);
        console.error('Détails de l\'erreur de connexion:', JSON.stringify(verifyError, null, 2));
        
        // Essayer une configuration alternative en cas d'échec
        console.log('Tentative avec une configuration alternative...');
        try {
          const alternativeTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_SERVER_USER || 'moncefbensalem222@gmail.com',
              pass: process.env.EMAIL_SERVER_PASSWORD || 'bkab egva uenf ctkp',
            },
          });
          
          console.log('Envoi avec la configuration alternative');
          const info = await alternativeTransporter.sendMail(mailOptions);
          console.log('Email envoyé avec succès (configuration alternative):', info.messageId);
          return {
            success: true,
            id: info.messageId,
            message: 'Email envoyé avec succès (configuration alternative)'
          };
        } catch (alternativeError) {
          console.error('L\'envoi avec la configuration alternative a également échoué:', alternativeError);
          throw new Error(`Erreur lors de l'envoi de l'email: ${verifyError.message}. Alternative également échouée: ${alternativeError.message}`);
        }
      }
      
      // Envoyer l'email avec la configuration principale
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.messageId);
        return {
          success: true,
          id: info.messageId,
          message: 'Email envoyé avec succès'
        };
      } catch (sendError) {
        console.error('Erreur lors de l\'envoi de l\'email:', sendError);
        throw sendError;
      }
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