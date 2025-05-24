'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { Search, ChevronDown, ChevronUp, ShoppingBag, CreditCard, Truck, RotateCcw, User, HelpCircle, Book, Pen, Briefcase, Shield, Gift } from 'lucide-react';

// Fonction pour obtenir les catégories de FAQ traduites
const getFaqCategories = (t) => [
  {
    id: 'general',
    title: t('faqCategoryGeneral'),
    icon: <HelpCircle className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryGeneralDesc')
  },
  {
    id: 'orders',
    title: t('faqCategoryOrders'),
    icon: <ShoppingBag className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryOrdersDesc')
  },
  {
    id: 'shipping',
    title: t('faqCategoryShipping'),
    icon: <Truck className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryShippingDesc')
  },
  {
    id: 'payment',
    title: t('faqCategoryPayment'),
    icon: <CreditCard className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryPaymentDesc')
  },
  {
    id: 'returns',
    title: t('faqCategoryReturns'),
    icon: <RotateCcw className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryReturnsDesc')
  },
  {
    id: 'account',
    title: t('faqCategoryAccount'),
    icon: <User className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryAccountDesc')
  },
  {
    id: 'products',
    title: t('faqCategoryProducts'),
    icon: <Pen className="w-12 h-12 text-orange-500" />,
    description: t('faqCategoryProductsDesc')
  },
  {
    id: 'school',
    title: t('faqCategorySchool'),
    icon: <Book className="w-12 h-12 text-orange-500" />,
    description: t('faqCategorySchoolDesc')
  },
  {
    id: 'sellers',
    title: t('faqCategorySellers'),
    icon: <Briefcase className="w-12 h-12 text-orange-500" />,
    description: t('faqCategorySellersDesc')
  },
  {
    id: 'security',
    title: t('faqCategorySecurity'),
    icon: <Shield className="w-12 h-12 text-orange-500" />,
    description: t('faqCategorySecurityDesc')
  }
];

// Fonction pour obtenir la FAQ complète par catégorie
const getAllFaqs = (t) => ({
  general: [
    {
      question: t('faqGeneralQuestion1'),
      answer: t('faqGeneralAnswer1')
    },
    {
      question: t('faqGeneralQuestion2'),
      answer: t('faqGeneralAnswer2')
    },
    {
      question: t('faqGeneralQuestion3'),
      answer: t('faqGeneralAnswer3')
    },
    {
      question: t('faqGeneralQuestion4'),
      answer: t('faqGeneralAnswer4')
    }
  ],
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
    },
    {
      question: t('faqOrdersQuestion4'),
      answer: t('faqOrdersAnswer4')
    },
    {
      question: t('faqOrdersQuestion5'),
      answer: t('faqOrdersAnswer5')
    }
  ],
  shipping: [
    {
      question: t('faqShippingQuestion1'),
      answer: t('faqShippingAnswer1')
    },
    {
      question: t('faqShippingQuestion2'),
      answer: t('faqShippingAnswer2')
    },
    {
      question: t('faqShippingQuestion3'),
      answer: t('faqShippingAnswer3')
    },
    {
      question: t('faqShippingQuestion4'),
      answer: t('faqShippingAnswer4')
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
    },
    {
      question: t('faqPaymentQuestion4'),
      answer: t('faqPaymentAnswer4')
    },
    {
      question: t('faqPaymentQuestion5'),
      answer: t('faqPaymentAnswer5')
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
    },
    {
      question: t('faqReturnsQuestion3'),
      answer: t('faqReturnsAnswer3')
    },
    {
      question: t('faqReturnsQuestion4'),
      answer: t('faqReturnsAnswer4')
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
    },
    {
      question: t('faqAccountQuestion4'),
      answer: t('faqAccountAnswer4')
    }
  ],
  products: [
    {
      question: t('faqProductsQuestion1'),
      answer: t('faqProductsAnswer1')
    },
    {
      question: t('faqProductsQuestion2'),
      answer: t('faqProductsAnswer2')
    },
    {
      question: t('faqProductsQuestion3'),
      answer: t('faqProductsAnswer3')
    },
    {
      question: t('faqProductsQuestion4'),
      answer: t('faqProductsAnswer4')
    }
  ],
  school: [
    {
      question: t('faqSchoolQuestion1'),
      answer: t('faqSchoolAnswer1')
    },
    {
      question: t('faqSchoolQuestion2'),
      answer: t('faqSchoolAnswer2')
    },
    {
      question: t('faqSchoolQuestion3'),
      answer: t('faqSchoolAnswer3')
    },
    {
      question: t('faqSchoolQuestion4'),
      answer: t('faqSchoolAnswer4')
    }
  ],
  sellers: [
    {
      question: t('faqSellersQuestion1'),
      answer: t('faqSellersAnswer1')
    },
    {
      question: t('faqSellersQuestion2'),
      answer: t('faqSellersAnswer2')
    },
    {
      question: t('faqSellersQuestion3'),
      answer: t('faqSellersAnswer3')
    },
    {
      question: t('faqSellersQuestion4'),
      answer: t('faqSellersAnswer4')
    },
    {
      question: t('faqSellersQuestion5'),
      answer: t('faqSellersAnswer5')
    }
  ],
  security: [
    {
      question: t('faqSecurityQuestion1'),
      answer: t('faqSecurityAnswer1')
    },
    {
      question: t('faqSecurityQuestion2'),
      answer: t('faqSecurityAnswer2')
    },
    {
      question: t('faqSecurityQuestion3'),
      answer: t('faqSecurityAnswer3')
    },
    {
      question: t('faqSecurityQuestion4'),
      answer: t('faqSecurityAnswer4')
    }
  ]
});

// Fonction pour obtenir les questions populaires
const getPopularQuestions = (t) => [
  {
    id: 'popular1',
    category: 'orders',
    question: t('popularQuestion1'),
    answer: t('popularAnswer1')
  },
  {
    id: 'popular2',
    category: 'shipping',
    question: t('popularQuestion2'),
    answer: t('popularAnswer2')
  },
  {
    id: 'popular3',
    category: 'payment',
    question: t('popularQuestion3'),
    answer: t('popularAnswer3')
  },
  {
    id: 'popular4',
    category: 'returns',
    question: t('popularQuestion4'),
    answer: t('popularAnswer4')
  },
  {
    id: 'popular5',
    category: 'account',
    question: t('popularQuestion5'),
    answer: t('popularAnswer5')
  }
];

export default function FAQPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [isSearching, setIsSearching] = useState(false);

  // Obtenir les données traduites
  const faqCategories = getFaqCategories(t);
  const allFaqs = getAllFaqs(t);
  const popularQuestions = getPopularQuestions(t);

  // Fonction pour basculer l'état d'expansion d'une question
  const toggleQuestion = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Fonction pour vérifier si une question est développée
  const isQuestionExpanded = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`;
    return expandedQuestions[key] || false;
  };

  // Fonction de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Recherche dans toutes les catégories
    const results = [];
    
    Object.entries(allFaqs).forEach(([categoryId, questions]) => {
      questions.forEach((faq, index) => {
        if (
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push({
            categoryId,
            questionIndex: index,
            ...faq,
            categoryName: faqCategories.find(cat => cat.id === categoryId)?.title
          });
        }
      });
    });
    
    setSearchResults(results);
  };

  // Réinitialiser la recherche
  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('faqPageTitle')}</h1>
          <p className="text-xl mb-8">{t('faqPageSubtitle')}</p>
          
          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder={t('faqSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 pr-16 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <Search className="absolute left-4 top-4 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t('searchButton')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Résultats de recherche */}
        {isSearching && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">
                {searchResults.length > 0 
                  ? t('searchResultsFound').replace('{count}', searchResults.length) 
                  : t('noSearchResults')}
              </h2>
              <button 
                onClick={resetSearch}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                {t('backToAllFaqs')}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border-b dark:border-gray-700 pb-4">
                    <div className="text-sm text-orange-500 mb-1">{result.categoryName}</div>
                    <button
                      className="w-full text-left flex justify-between items-center py-2"
                      onClick={() => toggleQuestion(result.categoryId, result.questionIndex)}
                    >
                      <span className="font-medium text-lg dark:text-white">{result.question}</span>
                      {isQuestionExpanded(result.categoryId, result.questionIndex) ? (
                        <ChevronUp className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-orange-500" />
                      )}
                    </button>
                    {isQuestionExpanded(result.categoryId, result.questionIndex) && (
                      <div className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {result.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isSearching && (
          <>
            {/* Questions populaires */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">{t('popularQuestions')}</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
                {popularQuestions.map((faq, index) => (
                  <div key={index} className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <button
                      className="w-full text-left flex justify-between items-center py-2"
                      onClick={() => toggleQuestion('popular', index)}
                    >
                      <span className="font-medium text-lg dark:text-white">{faq.question}</span>
                      {isQuestionExpanded('popular', index) ? (
                        <ChevronUp className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-orange-500" />
                      )}
                    </button>
                    {isQuestionExpanded('popular', index) && (
                      <div className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Catégories de FAQ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  className={`p-4 rounded-lg transition-all ${
                    activeCategory === category.id 
                      ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500' 
                      : 'bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 border-2 border-transparent'
                  } flex flex-col items-center text-center`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.icon}
                  <h3 className="text-lg font-semibold mt-3 mb-1 dark:text-white">{category.title}</h3>
                </button>
              ))}
            </div>

            {/* Questions par catégorie */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-12">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                {faqCategories.find(cat => cat.id === activeCategory)?.title}
              </h2>
              <div className="space-y-4">
                {allFaqs[activeCategory].map((faq, index) => (
                  <div key={index} className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <button
                      className="w-full text-left flex justify-between items-center py-2"
                      onClick={() => toggleQuestion(activeCategory, index)}
                    >
                      <span className="font-medium text-lg dark:text-white">{faq.question}</span>
                      {isQuestionExpanded(activeCategory, index) ? (
                        <ChevronUp className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-orange-500" />
                      )}
                    </button>
                    {isQuestionExpanded(activeCategory, index) && (
                      <div className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Besoin de plus d'aide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <HelpCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 dark:text-white">{t('needMoreHelp')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('needMoreHelpDescription')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/contact" 
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t('contactUs')}
            </Link>
            <Link 
              href="/help" 
              className="bg-white dark:bg-gray-700 text-orange-500 dark:text-orange-400 border border-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t('helpCenter')}
            </Link>
            <button 
              onClick={() => {
                // Ouvrir le chat d'assistance
                const chatButton = document.querySelector('[data-chat-button]');
                if (chatButton) chatButton.click();
              }}
              className="bg-white dark:bg-gray-700 text-orange-500 dark:text-orange-400 border border-orange-500 px-6 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors"
            >
              {t('liveChat')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
