'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { Search, ChevronDown, ChevronUp, ShoppingBag, CreditCard, Truck, RotateCcw, User, HelpCircle } from 'lucide-react';

// Fonction pour obtenir les catégories d'aide traduites
const getHelpCategories = (t) => [
  {
    id: 'orders',
    title: t('helpCategory1Title'),
    icon: <ShoppingBag className="w-12 h-12 text-orange-500" />,
    description: t('helpCategory1Description')
  },
  {
    id: 'tracking',
    title: t('helpCategory2Title'),
    icon: <Truck className="w-12 h-12 text-orange-500" />,
    description: t('helpCategory2Description')
  },
  {
    id: 'payment',
    title: t('helpCategory3Title'),
    icon: <CreditCard className="w-12 h-12 text-orange-500" />,
    description: t('helpCategory3Description')
  },
  {
    id: 'returns',
    title: t('helpCategory4Title'),
    icon: <RotateCcw className="w-12 h-12 text-orange-500" />,
    description: t('helpCategory4Description')
  },
  {
    id: 'account',
    title: t('helpCategory5Title'),
    icon: <User className="w-12 h-12 text-orange-500" />,
    description: t('helpCategory5Description')
  }
];

// Fonction pour obtenir la FAQ par catégorie traduite
const getFaqByCategory = (t) => ({
  orders: [
    {
      question: t('faqOrder1Question'),
      answer: t('faqOrder1Answer')
    },
    {
      question: t('faqOrder2Question'),
      answer: t('faqOrder2Answer')
    },
    {
      question: t('faqOrder3Question'),
      answer: t('faqOrder3Answer')
    }
  ],
  tracking: [
    {
      question: t('faqTracking1Question'),
      answer: t('faqTracking1Answer')
    },
    {
      question: t('faqTracking2Question'),
      answer: t('faqTracking2Answer')
    },
    {
      question: t('faqTracking3Question'),
      answer: t('faqTracking3Answer')
    }
  ],
  payment: [
    {
      question: t('faqPayment1Question'),
      answer: t('faqPayment1Answer')
    },
    {
      question: t('faqPayment2Question'),
      answer: t('faqPayment2Answer')
    },
    {
      question: t('faqPayment3Question'),
      answer: t('faqPayment3Answer')
    }
  ],
  returns: [
    {
      question: t('faqReturns1Question'),
      answer: t('faqReturns1Answer')
    },
    {
      question: t('faqReturns2Question'),
      answer: t('faqReturns2Answer')
    }
  ],
  account: [
    {
      question: t('faqAccount1Question'),
      answer: t('faqAccount1Answer')
    },
    {
      question: t('faqAccount2Question'),
      answer: t('faqAccount2Answer')
    },
    {
      question: t('faqAccount3Question'),
      answer: t('faqAccount3Answer')
    }
  ]
});

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { t } = useLanguage();
  
  // Utiliser les fonctions pour obtenir les données traduites
  const helpCategories = getHelpCategories(t);
  const faqByCategory = getFaqByCategory(t);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Réinitialiser les résultats précédents
    setSearchResults([]);
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    
    // Rechercher dans toutes les catégories et questions
    const results = [];
    
    Object.entries(faqByCategory).forEach(([categoryId, questions]) => {
      const categoryName = helpCategories.find(cat => cat.id === categoryId)?.title || categoryId;
      
      questions.forEach((faq, index) => {
        // Vérifier si la question ou la réponse contient le terme de recherche
        const questionLower = faq.question.toLowerCase();
        const answerLower = faq.answer.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        
        if (questionLower.includes(searchLower) || answerLower.includes(searchLower)) {
          results.push({
            categoryId,
            categoryName,
            questionIndex: index,
            question: faq.question,
            answer: faq.answer,
            // Calculer un score simple basé sur le nombre d'occurrences
            score: (questionLower.split(searchLower).length - 1) * 2 + 
                   (answerLower.split(searchLower).length - 1)
          });
        }
      });
    });
    
    // Trier les résultats par score (du plus élevé au plus bas)
    results.sort((a, b) => b.score - a.score);
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    // Réinitialiser les questions ouvertes lors du changement de catégorie
    setExpandedQuestions({});
  };

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('helpPageTitle')}</h1>
          <p className="text-xl mb-8">{t('helpPageSubtitle')}</p>
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-32 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-4 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                disabled={isSearching}
              >
                {isSearching ? t('searching') || 'Recherche...' : t('searchButton')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Catégories d'aide */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {helpCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center dark:bg-gray-800"
              onClick={() => toggleCategory(category.id)}
            >
              {category.icon}
              <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">{category.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
            </div>
          ))}
        </div>

        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12 dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('searchResults')} "{searchQuery}" ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.map((result, resultIndex) => (
                <div key={resultIndex} className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-orange-500 mb-1">{result.categoryName}</div>
                  <button
                    className="w-full text-left flex justify-between items-center py-2"
                    onClick={() => toggleQuestion(`search_${resultIndex}`)}
                  >
                    <span className="font-medium text-lg text-gray-900 dark:text-white">{result.question}</span>
                    {expandedQuestions[`search_${resultIndex}`] ? (
                      <ChevronUp className="h-5 w-5 text-orange-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-orange-500" />
                    )}
                  </button>
                  {expandedQuestions[`search_${resultIndex}`] && (
                    <div className="mt-2 text-gray-600 whitespace-pre-line dark:text-gray-300">
                      {result.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* FAQ Section */}
        {expandedCategory && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12 dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {helpCategories.find(cat => cat.id === expandedCategory)?.title}
            </h2>
            <div className="space-y-4">
              {faqByCategory[expandedCategory].map((faq, index) => (
                <div key={index} className="border-b pb-4 border-gray-200 dark:border-gray-700">
                  <button
                    className="w-full text-left flex justify-between items-center py-2"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span className="font-medium text-lg text-gray-900 dark:text-white">{faq.question}</span>
                    {expandedQuestions[index] ? (
                      <ChevronUp className="h-5 w-5 text-orange-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-orange-500" />
                    )}
                  </button>
                  {expandedQuestions[index] && (
                    <div className="mt-2 text-gray-600 whitespace-pre-line dark:text-gray-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Besoin de plus d'aide */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center dark:bg-gray-800">
          <HelpCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('needMoreHelp')}</h2>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            {t('needMoreHelpDescription')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/contact" 
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t('contactUs')}
            </Link>
            <button 
              onClick={() => {
                // Ouvrir le chat d'assistance
                const chatButton = document.querySelector('[data-chat-button]');
                if (chatButton) chatButton.click();
              }}
              className="bg-white text-orange-500 border border-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors dark:bg-gray-900 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-gray-800"
            >
              {t('liveChat')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
