'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Composant pour les sections de conditions
const TermsSection = ({ title, children, isOpen, onToggle }) => {
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

export default function TermsPage() {
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState({
    introduction: true,
    definitions: false,
    account: false,
    services: false,
    content: false,
    intellectual: false,
    privacy: false,
    termination: false,
    limitation: false,
    governing: false,
    changes: false,
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
          <h1 className="text-4xl font-bold mb-4">{t('termsOfUseTitle')}</h1>
          <p className="text-lg mb-2">{t('termsOfUseSubtitle')}</p>
          <p className="text-sm">{t('lastUpdated')} {lastUpdated}</p>
        </div>
      </div>

      {/* Table des matières */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('tableOfContents')}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li>
              <button 
                onClick={() => toggleSection('introduction')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                1. {t('termsSection1Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('definitions')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                2. {t('termsSection2Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('account')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                3. {t('termsSection3Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('services')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                4. {t('termsSection4Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('content')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                5. {t('termsSection5Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('intellectual')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                6. {t('termsSection6Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('privacy')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                7. {t('termsSection7Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('termination')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                8. {t('termsSection8Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('limitation')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                9. {t('termsSection9Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('governing')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                10. {t('termsSection10Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('changes')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                11. {t('termsSection11Title')}
              </button>
            </li>
            <li>
              <button 
                onClick={() => toggleSection('contact')}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-left"
              >
                12. {t('termsSection12Title')}
              </button>
            </li>
          </ul>
        </div>

        {/* Contenu des conditions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <TermsSection 
            title={`1. ${t('termsSection1Title')}`} 
            isOpen={openSections.introduction} 
            onToggle={() => toggleSection('introduction')}
          >
            <p>{t('termsSection1Para1')}</p>
            <p className="mt-4">{t('termsSection1Para2')}</p>
            <p className="mt-4">{t('termsSection1Para3')}</p>
          </TermsSection>

          <TermsSection 
            title={`2. ${t('termsSection2Title')}`} 
            isOpen={openSections.definitions} 
            onToggle={() => toggleSection('definitions')}
          >
            <p>{t('termsSection2Para1')}</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>{t('termsDefinition1Title')}:</strong> {t('termsDefinition1')}</li>
              <li><strong>{t('termsDefinition2Title')}:</strong> {t('termsDefinition2')}</li>
              <li><strong>{t('termsDefinition3Title')}:</strong> {t('termsDefinition3')}</li>
              <li><strong>{t('termsDefinition4Title')}:</strong> {t('termsDefinition4')}</li>
              <li><strong>{t('termsDefinition5Title')}:</strong> {t('termsDefinition5')}</li>
            </ul>
          </TermsSection>

          <TermsSection 
            title={`3. ${t('termsSection3Title')}`} 
            isOpen={openSections.account} 
            onToggle={() => toggleSection('account')}
          >
            <p>{t('termsSection3Para1')}</p>
            <p className="mt-4">{t('termsSection3Para2')}</p>
            <p className="mt-4">{t('termsSection3Para3')}</p>
            <p className="mt-4">{t('termsSection3Para4')}</p>
          </TermsSection>

          <TermsSection 
            title={`4. ${t('termsSection4Title')}`} 
            isOpen={openSections.services} 
            onToggle={() => toggleSection('services')}
          >
            <p>{t('termsSection4Para1')}</p>
            <p className="mt-4">{t('termsSection4Para2')}</p>
            <p className="mt-4">{t('termsSection4Para3')}</p>
          </TermsSection>

          <TermsSection 
            title={`5. ${t('termsSection5Title')}`} 
            isOpen={openSections.content} 
            onToggle={() => toggleSection('content')}
          >
            <p>{t('termsSection5Para1')}</p>
            <p className="mt-4">{t('termsSection5Para2')}</p>
            <p className="mt-4">{t('termsSection5Para3')}</p>
          </TermsSection>

          <TermsSection 
            title={`6. ${t('termsSection6Title')}`} 
            isOpen={openSections.intellectual} 
            onToggle={() => toggleSection('intellectual')}
          >
            <p>{t('termsSection6Para1')}</p>
            <p className="mt-4">{t('termsSection6Para2')}</p>
            <p className="mt-4">{t('termsSection6Para3')}</p>
          </TermsSection>

          <TermsSection 
            title={`7. ${t('termsSection7Title')}`} 
            isOpen={openSections.privacy} 
            onToggle={() => toggleSection('privacy')}
          >
            <p>{t('termsSection7Para1')}</p>
            <p className="mt-4">{t('termsSection7Para2')}</p>
            <p className="mt-4">
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline">
                {t('privacyPolicyLink')}
              </Link>
            </p>
          </TermsSection>

          <TermsSection 
            title={`8. ${t('termsSection8Title')}`} 
            isOpen={openSections.termination} 
            onToggle={() => toggleSection('termination')}
          >
            <p>{t('termsSection8Para1')}</p>
            <p className="mt-4">{t('termsSection8Para2')}</p>
          </TermsSection>

          <TermsSection 
            title={`9. ${t('termsSection9Title')}`} 
            isOpen={openSections.limitation} 
            onToggle={() => toggleSection('limitation')}
          >
            <p>{t('termsSection9Para1')}</p>
            <p className="mt-4">{t('termsSection9Para2')}</p>
            <p className="mt-4">{t('termsSection9Para3')}</p>
          </TermsSection>

          <TermsSection 
            title={`10. ${t('termsSection10Title')}`} 
            isOpen={openSections.governing} 
            onToggle={() => toggleSection('governing')}
          >
            <p>{t('termsSection10Para1')}</p>
            <p className="mt-4">{t('termsSection10Para2')}</p>
          </TermsSection>

          <TermsSection 
            title={`11. ${t('termsSection11Title')}`} 
            isOpen={openSections.changes} 
            onToggle={() => toggleSection('changes')}
          >
            <p>{t('termsSection11Para1')}</p>
            <p className="mt-4">{t('termsSection11Para2')}</p>
          </TermsSection>

          <TermsSection 
            title={`12. ${t('termsSection12Title')}`} 
            isOpen={openSections.contact} 
            onToggle={() => toggleSection('contact')}
          >
            <p>{t('termsSection12Para1')}</p>
            <p className="mt-4">
              <strong>{t('contactEmail')}:</strong> legal@penventory.com
            </p>
            <p className="mt-2">
              <strong>{t('contactAddress')}:</strong> {t('companyAddress')}
            </p>
          </TermsSection>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link 
            href="/privacy" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-center"
          >
            {t('viewPrivacyPolicy')}
          </Link>
          <Link 
            href="/contact" 
            className="bg-white dark:bg-gray-700 text-orange-500 dark:text-orange-400 border border-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors text-center"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}
