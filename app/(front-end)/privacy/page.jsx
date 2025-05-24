'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Composant pour les sections de la politique de confidentialité
const PrivacySection = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0 last:mb-0">
      <button
        className="flex justify-between items-center w-full py-3 text-left"
        onClick={onToggle}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-orange-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-orange-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600 dark:text-gray-300 prose prose-orange dark:prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default function PrivacyPage() {
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState({
    introduction: true,
    information: false,
    usage: false,
    cookies: false,
    sharing: false,
    security: false,
    children: false,
    changes: false,
    rights: false,
    contact: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const lastUpdated = "14 mai 2025";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-lg mb-2">Comment nous protégeons vos données personnelles</p>
          <p className="text-sm">Dernière mise à jour : {lastUpdated}</p>
        </div>
      </div>

      {/* Table des matières */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Table des matières</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li>
              <button 
                onClick={() => toggleSection('introduction')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                1. Introduction
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('information')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                2. Informations que nous collectons
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('usage')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                3. Comment nous utilisons vos informations
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('cookies')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                4. Cookies et technologies similaires
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('sharing')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                5. Partage de vos informations
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('security')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                6. Sécurité des données
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('children')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                7. Protection des mineurs
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('changes')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                8. Modifications de la politique
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('rights')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                9. Vos droits
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('contact')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                10. Nous contacter
              </button>
            </li>
          </ul>
        </div>

        {/* Contenu principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <PrivacySection 
            title="1. Introduction" 
            isOpen={openSections.introduction} 
            onToggle={() => toggleSection('introduction')}
          >
            <p>
              Chez PInventory, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
            </p>
            <p className="mt-4">
              En utilisant notre site, vous acceptez les pratiques décrites dans cette politique de confidentialité. Si vous n'acceptez pas cette politique, veuillez ne pas utiliser notre site.
            </p>
            <p className="mt-4">
              Cette politique s'applique à toutes les informations collectées via notre site web (www.penventory.com), nos applications mobiles, et tout autre site, application ou service qui renvoie à cette politique.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="2. Informations que nous collectons" 
            isOpen={openSections.information} 
            onToggle={() => toggleSection('information')}
          >
            <p>Nous collectons plusieurs types d'informations vous concernant, notamment :</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Informations personnelles :</strong> Nom, adresse e-mail, numéro de téléphone, adresse postale, informations de paiement lorsque vous créez un compte, effectuez un achat ou utilisez nos services.
              </li>
              <li>
                <strong>Informations de profil :</strong> Nom d'utilisateur, mot de passe, préférences d'achat, commentaires et avis sur les produits.
              </li>
              <li>
                <strong>Informations d'utilisation :</strong> Comment vous interagissez avec notre site, les pages que vous visitez, les produits que vous consultez, les fonctionnalités que vous utilisez.
              </li>
              <li>
                <strong>Informations techniques :</strong> Adresse IP, type et version du navigateur, système d'exploitation, résolution d'écran, fournisseur d'accès Internet.
              </li>
              <li>
                <strong>Informations de localisation :</strong> Informations générales sur votre localisation basées sur votre adresse IP.
              </li>
            </ul>
          </PrivacySection>

          <PrivacySection 
            title="3. Comment nous utilisons vos informations" 
            isOpen={openSections.usage} 
            onToggle={() => toggleSection('usage')}
          >
            <p>Nous utilisons vos informations pour :</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Fournir, maintenir et améliorer notre site et nos services.</li>
              <li>Traiter et gérer vos commandes, paiements et retours.</li>
              <li>Vous envoyer des confirmations de commande, des mises à jour et des alertes de sécurité.</li>
              <li>Vous fournir une assistance client et répondre à vos demandes.</li>
              <li>Personnaliser votre expérience et vous proposer des produits qui pourraient vous intéresser.</li>
              <li>Analyser comment notre site est utilisé afin de l'améliorer.</li>
              <li>Détecter, prévenir et résoudre les problèmes techniques et de sécurité.</li>
              <li>Respecter nos obligations légales et réglementaires.</li>
            </ul>
            <p className="mt-4">
              Nous conservons vos informations aussi longtemps que nécessaire pour fournir nos services, respecter nos obligations légales, résoudre les litiges et faire respecter nos accords.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="4. Cookies et technologies similaires" 
            isOpen={openSections.cookies} 
            onToggle={() => toggleSection('cookies')}
          >
            <p>
              Nous utilisons des cookies et des technologies similaires pour collecter des informations sur votre activité, votre navigateur et votre appareil. Les cookies sont de petits fichiers texte stockés sur votre navigateur qui nous permettent de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Mémoriser vos préférences et paramètres.</li>
              <li>Vous permettre de vous connecter à votre compte.</li>
              <li>Analyser comment notre site est utilisé.</li>
              <li>Personnaliser les publicités et le contenu en fonction de vos intérêts.</li>
              <li>Mesurer l'efficacité de nos campagnes marketing.</li>
            </ul>
            <p className="mt-4">
              Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour indiquer quand un cookie est envoyé. Cependant, certaines fonctionnalités de notre site peuvent ne pas fonctionner correctement sans cookies.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="5. Partage de vos informations" 
            isOpen={openSections.sharing} 
            onToggle={() => toggleSection('sharing')}
          >
            <p>Nous pouvons partager vos informations personnelles avec :</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Vendeurs sur notre plateforme :</strong> Lorsque vous achetez un produit, nous partageons les informations nécessaires (comme votre nom et adresse de livraison) avec le vendeur pour qu'il puisse traiter et expédier votre commande.
              </li>
              <li>
                <strong>Prestataires de services :</strong> Entreprises qui nous aident à exploiter notre site, traiter les paiements, fournir un service client, envoyer des communications ou analyser l'utilisation du site.
              </li>
              <li>
                <strong>Partenaires commerciaux :</strong> Avec votre consentement, nous pouvons partager vos informations avec des partenaires commerciaux sélectionnés pour vous proposer certains produits, services ou promotions.
              </li>
              <li>
                <strong>Autorités légales :</strong> Si nous sommes tenus de divulguer vos informations en raison d'une obligation légale, d'une procédure judiciaire, d'une demande gouvernementale ou pour protéger nos droits.
              </li>
            </ul>
            <p className="mt-4">
              Nous ne vendons pas vos données personnelles à des tiers.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="6. Sécurité des données" 
            isOpen={openSections.security} 
            onToggle={() => toggleSection('security')}
          >
            <p>
              Nous prenons la sécurité de vos données très au sérieux et mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre la perte, l'accès non autorisé, la divulgation, l'altération et la destruction.
            </p>
            <p className="mt-4">
              Ces mesures comprennent le chiffrement des données, des contrôles d'accès stricts, des pare-feu et des audits de sécurité réguliers. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée, et nous ne pouvons garantir une sécurité absolue.
            </p>
            <p className="mt-4">
              Nous limitons l'accès à vos informations personnelles aux employés, agents, contractants et tiers qui ont besoin de connaître ces informations pour traiter vos commandes ou fournir nos services. Ils sont soumis à des obligations strictes de confidentialité et peuvent être sanctionnés ou voir leur contrat résilié s'ils ne respectent pas ces obligations.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="7. Protection des mineurs" 
            isOpen={openSections.children} 
            onToggle={() => toggleSection('children')}
          >
            <p>
              Notre site n'est pas destiné aux enfants de moins de 16 ans et nous ne collectons pas sciemment des informations personnelles auprès d'enfants de moins de 16 ans. Si vous êtes parent ou tuteur et que vous pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter immédiatement. Si nous apprenons que nous avons collecté des informations personnelles d'un enfant sans vérification du consentement parental, nous prendrons des mesures pour supprimer ces informations de nos serveurs.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="8. Modifications de la politique" 
            isOpen={openSections.changes} 
            onToggle={() => toggleSection('changes')}
          >
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre pour refléter les changements dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires. La version la plus récente sera toujours disponible sur notre site avec la date de la dernière mise à jour.
            </p>
            <p className="mt-4">
              Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la façon dont nous protégeons vos informations. Votre utilisation continue de notre site après la publication des modifications constitue votre acceptation de ces modifications.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="9. Vos droits" 
            isOpen={openSections.rights} 
            onToggle={() => toggleSection('rights')}
          >
            <p>
              Selon les lois applicables en matière de protection des données, vous pouvez avoir certains droits concernant vos informations personnelles, notamment :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Le droit d'accéder à vos informations personnelles.</li>
              <li>Le droit de rectifier ou mettre à jour vos informations personnelles inexactes ou incomplètes.</li>
              <li>Le droit de supprimer vos informations personnelles dans certaines circonstances.</li>
              <li>Le droit de restreindre ou de vous opposer au traitement de vos informations personnelles.</li>
              <li>Le droit à la portabilité des données (recevoir une copie de vos informations personnelles dans un format structuré).</li>
              <li>Le droit de retirer votre consentement à tout moment lorsque nous traitons vos informations personnelles sur la base de votre consentement.</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, veuillez nous contacter en utilisant les coordonnées fournies ci-dessous. Nous répondrons à votre demande conformément aux lois applicables.
            </p>
          </PrivacySection>

          <PrivacySection 
            title="10. Nous contacter" 
            isOpen={openSections.contact} 
            onToggle={() => toggleSection('contact')}
          >
            <p>
              Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière de protection des données, veuillez nous contacter :
            </p>
            <p className="mt-4">
              <strong>Email :</strong> privacy@penventory.com
            </p>
            <p className="mt-2">
              <strong>Adresse :</strong> Rue de Carthage, Centre-ville de Tunis, Tunisie
            </p>
            <p className="mt-4">
              Nous nous efforçons de répondre à toutes les demandes dans un délai raisonnable, généralement dans les 30 jours.
            </p>
          </PrivacySection>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link 
            href="/terms" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-center"
          >
            Voir les conditions d'utilisation
          </Link>
          <Link 
            href="/contact" 
            className="bg-white dark:bg-gray-700 text-orange-500 dark:text-orange-400 border border-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
