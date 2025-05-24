'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { 
  ShoppingBag, 
  TrendingUp, 
  CreditCard, 
  Truck, 
  Shield, 
  Users, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Étapes pour devenir vendeur
const getSellerSteps = (t) => [
  {
    id: 'account',
    title: t('sellerStep1Title'),
    description: t('sellerStep1Description'),
    icon: <CheckCircle className="w-6 h-6 text-orange-500" />
  },
  {
    id: 'profile',
    title: t('sellerStep2Title'),
    description: t('sellerStep2Description'),
    icon: <CheckCircle className="w-6 h-6 text-orange-500" />
  },
  {
    id: 'coordinates',
    title: t('sellerStep3Title'),
    description: t('sellerStep3Description'),
    icon: <CheckCircle className="w-6 h-6 text-orange-500" />
  },
  {
    id: 'products',
    title: t('sellerStep4Title'),
    description: t('sellerStep4Description'),
    icon: <CheckCircle className="w-6 h-6 text-orange-500" />
  },
  {
    id: 'sell',
    title: t('sellerStep5Title'),
    description: t('sellerStep5Description'),
    icon: <CheckCircle className="w-6 h-6 text-orange-500" />
  }
];

// Avantages de vendre sur PInventory
const getSellerBenefits = (t) => [
  {
    id: 'customers',
    title: t('benefit1Title'),
    description: t('benefit1Description'),
    icon: <Users className="w-12 h-12 text-orange-500" />
  },
  {
    id: 'payments',
    title: t('benefit2Title'),
    description: t('benefit2Description'),
    icon: <CreditCard className="w-12 h-12 text-orange-500" />
  },
  {
    id: 'badges',
    title: t('benefit3Title'),
    description: t('benefit3Description'),
    icon: <Shield className="w-12 h-12 text-orange-500" />
  },
  {
    id: 'profile',
    title: t('benefit4Title'),
    description: t('benefit4Description'),
    icon: <Users className="w-12 h-12 text-orange-500" />
  },
  {
    id: 'media',
    title: t('benefit5Title'),
    description: t('benefit5Description'),
    icon: <TrendingUp className="w-12 h-12 text-orange-500" />
  }
];

// Questions fréquentes
const getFaqs = (t) => [
  {
    question: t('faq1Question'),
    answer: t('faq1Answer')
  },
  {
    question: t('faq2Question'),
    answer: t('faq2Answer')
  },
  {
    question: t('faq3Question'),
    answer: t('faq3Answer')
  },
  {
    question: t('faq4Question'),
    answer: t('faq4Answer')
  },
  {
    question: t('faq5Question'),
    answer: t('faq5Answer')
  }
];

export default function BecomeSellerPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { t } = useLanguage();

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Utiliser les fonctions pour obtenir les données traduites
  const sellerSteps = getSellerSteps(t);
  const sellerBenefits = getSellerBenefits(t);
  const faqs = getFaqs(t);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-orange-500 py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('becomeSellerTitle')}</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t('becomeSellerSubtitle')}</h2>
            <p className="text-lg mb-8">
              {t('becomeSellerDescription')}
            </p>
            <Link 
              href="register/seller" 
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold inline-flex items-center hover:bg-gray-100 transition-colors"
            >
              {t('becomeSellerButton')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-80">
              <Image 
                src="/images/seller-hero.png" 
                alt="Devenir vendeur" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('sellerStepsTitle')}</h2>
          <div className="max-w-3xl mx-auto">
            {sellerSteps.map((step, index) => (
              <div key={step.id} className="flex items-start mb-8">
                <div className="mr-4 mt-1">{step.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('sellerBenefitsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellerBenefits.map((benefit) => (
              <div key={benefit.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('callToActionTitle')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('callToActionDescription')}
          </p>
          <Link 
            href="/register/seller" 
            className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg inline-flex items-center hover:bg-gray-100 transition-colors"
          >
            {t('signUpAsSeller')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('faqTitle')}</h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-6 border-b border-gray-200 pb-6">
                <button
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-xl font-medium">{faq.question}</h3>
                  <span className="text-orange-500">
                    {expandedFaq === index ? (
                      <span className="text-2xl">−</span>
                    ) : (
                      <span className="text-2xl">+</span>
                    )}
                  </span>
                </button>
                {expandedFaq === index && (
                  <div className="mt-4 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Besoin d'aide */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center text-orange-500 mb-4">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-semibold">{t('helpSectionTitle')}</h3>
          </div>
          <p className="text-gray-600 mb-6">
            {t('helpSectionDescription')}
          </p>
          <div className="flex justify-center">
            <Link 
              href="/help" 
              className="text-orange-500 border border-orange-500 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors mr-4"
            >
              {t('helpCenter')}
            </Link>
            <button 
              onClick={() => {
                // Ouvrir le chat d'assistance
                const chatButton = document.querySelector('[data-chat-button]');
                if (chatButton) chatButton.click();
              }}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              {t('liveChat')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
