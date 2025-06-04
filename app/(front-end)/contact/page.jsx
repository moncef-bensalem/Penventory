  'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Package,
  CreditCard,
  User,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Fonction pour obtenir les catégories de support traduites
const getSupportCategories = (t) => [
  { id: 'PAYMENT', label: t('contactCategoryPayment'), icon: <CreditCard className="h-5 w-5" /> },
  { id: 'SHIPPING', label: t('contactCategoryShipping'), icon: <Package className="h-5 w-5" /> },
  { id: 'PRODUCT', label: t('contactCategoryProduct'), icon: <Package className="h-5 w-5" /> },
  { id: 'ACCOUNT', label: t('contactCategoryAccount'), icon: <User className="h-5 w-5" /> },
  { id: 'OTHER', label: t('contactCategoryOther'), icon: <HelpCircle className="h-5 w-5" /> }
];

// Fonction pour obtenir les priorités de support traduites
const getSupportPriorities = (t) => [
  { id: 'LOW', label: t('contactPriorityLow'), color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'MEDIUM', label: t('contactPriorityMedium'), color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'HIGH', label: t('contactPriorityHigh'), color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'URGENT', label: t('contactPriorityUrgent'), color: 'bg-red-100 text-red-800 border-red-200' }
];

export default function ContactPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Obtenir les catégories et priorités traduites
  const supportCategories = getSupportCategories(t);
  const supportPriorities = getSupportPriorities(t);
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    subject: '',
    category: '', // Catégorie optionnelle maintenant
    priority: '', // Priorité optionnelle maintenant
    message: '',
    orderNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const captchaRef = useRef(null);
  
  // Générer un nouveau CAPTCHA
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaAnswer((num1 + num2).toString());
    return `${num1} + ${num2}`;
  };
  
  // Initialiser le CAPTCHA au chargement de la page
  useEffect(() => {
    setCaptchaValue(generateCaptcha());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier le CAPTCHA
    if (captchaRef.current.value !== captchaAnswer) {
      setCaptchaError(true);
      // Générer un nouveau CAPTCHA
      setCaptchaValue(generateCaptcha());
      captchaRef.current.value = '';
      toast.error(t('captchaError') || 'Le code de sécurité est incorrect');
      return;
    }
    
    setCaptchaError(false);
    setIsSubmitting(true);

    try {
      // Préparer les données du ticket
      const ticketData = {
        subject: formData.subject,
        description: formData.message,
        // Utiliser des valeurs par défaut si les champs sont vides
        category: formData.category || 'OTHER',
        priority: formData.priority || 'MEDIUM',
        orderNumber: formData.orderNumber || undefined
      };
      
      // Envoyer la demande à l'API
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du ticket');
      }
      
      const ticket = await response.json();
      
      // Utiliser l'ID du ticket retourné par l'API
      setTicketId(ticket.id);
      
      // Réinitialiser le formulaire et afficher un message de succès
      setSubmitted(true);
      toast.success(t('contactSuccessMessage'));
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      
      if (error.message === 'Non autorisé') {
        toast.error(t('contactErrorAuth'));
      } else {
        toast.error(t('contactErrorGeneral'));
      }
    } finally {
      setIsSubmitting(false);
      // Générer un nouveau CAPTCHA
      setCaptchaValue(generateCaptcha());
      if (captchaRef.current) captchaRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      name: user ? user.name : '',
      email: user ? user.email : '',
      subject: '',
      category: '',
      priority: '',
      message: '',
      orderNumber: ''
    });
    setSubmitted(false);
    setTicketId('');
    setCaptchaValue(generateCaptcha());
    setCaptchaError(false);
    if (captchaRef.current) captchaRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">{t('contactPageTitle')}</h1>
          <p className="text-center text-gray-600 mb-8 dark:text-gray-300">
            {t('contactPageSubtitle')}
          </p>

          <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Informations de contact */}
              <div className="bg-orange-600 text-white p-8">
                <h2 className="text-xl font-semibold mb-6">{t('contactInfoTitle')}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium">{t('emailLabel')}</h3>
                      <p className="text-orange-100">support@penventory.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-6 w-6 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium">{t('phoneLabel')}</h3>
                      <p className="text-orange-100">+216 71 123 456</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium">{t('addressLabel')}</h3>
                      <p className="text-orange-100">
                        123 Rue de Commerce<br />
                        Tunis, Tunisie 1000
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12">
                  <h3 className="font-medium mb-4">{t('openingHoursTitle')}</h3>
                  <p className="text-orange-100">
                    {t('openingHoursContent').split('\n').map((line, index) => (
                      <span key={index}>
                        {line}<br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              
              {/* Formulaire de contact */}
              <div className="col-span-2 p-8">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t('sendMessageTitle')}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                          {t('fullNameLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                          {t('emailLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                        {t('subjectLabel')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                        {t('orderNumberLabel')}
                      </label>
                      <input
                        type="text"
                        id="orderNumber"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                      />
                    </div>
                    
                    {/* Catégorie et Priorité (optionnels) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-900 font-medium mb-2 dark:text-gray-300">
                          {t('categoryLabel')} ({t('optional') || 'Optionnel'}):
                        </label>
                        <div className="relative">
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">{t('selectCategory') || 'Sélectionner une catégorie'}</option>
                            {supportCategories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Priorité */}
                      <div>
                        <label className="block text-gray-900 font-medium mb-2 dark:text-gray-300">
                          {t('priorityLabel')} ({t('optional') || 'Optionnel'}):
                        </label>
                        <div className="relative">
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">{t('selectPriority') || 'Sélectionner une priorité'}</option>
                            {supportPriorities.map(priority => (
                              <option key={priority.id} value={priority.id}>
                                {priority.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                        {t('messageLabel')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        required
                      ></textarea>
                    </div>
                    
                    {/* CAPTCHA */}
                    <div className="mb-4">
                      <label className="block text-gray-900 font-medium mb-2 dark:text-gray-300">
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-orange-600" />
                          {t('securityCode') || 'Code de sécurité'} <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono font-bold text-lg min-w-[100px] text-center">
                          {captchaValue}
                        </div>
                        <input
                          type="text"
                          ref={captchaRef}
                          placeholder={t('enterResult') || 'Entrez le résultat'}
                          className={`flex-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${captchaError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setCaptchaValue(generateCaptcha());
                            if (captchaRef.current) captchaRef.current.value = '';
                          }}
                          className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          title={t('refreshCaptcha') || 'Actualiser le code'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                      {captchaError && (
                        <p className="mt-1 text-sm text-red-500">
                          {t('captchaError') || 'Le code de sécurité est incorrect'}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('captchaHelp') || 'Cette vérification nous aide à protéger notre site contre les robots spammeurs.'}
                      </p>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-orange-600 text-white py-3 px-6 rounded-md font-medium hover:bg-orange-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? t('sendingButton') : t('sendButton')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 dark:bg-green-900">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('thankYouTitle')}</h2>
                    <p className="text-gray-600 mb-6 dark:text-gray-300">
                      {t('thankYouMessage')}
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg mb-6 inline-block dark:bg-gray-800">
                      <p className="text-gray-700 font-medium dark:text-gray-200">{t('referenceNumberLabel')}</p>
                      <p className="text-orange-600 font-mono font-bold">{ticketId}</p>
                    </div>
                    <p className="text-gray-600 mb-6 dark:text-gray-300">
                      {t('keepReferenceMessage')}
                    </p>
                    <button
                      onClick={resetForm}
                      className="bg-orange-600 text-white py-3 px-6 rounded-md font-medium hover:bg-orange-700 transition-colors"
                    >
                      {t('submitAnotherRequest')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* FAQ rapide */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">{t('faqTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('trackOrderQuestion')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('trackOrderAnswer')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('returnPolicyQuestion')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('returnPolicyAnswer')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('paymentMethodsQuestion')}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('paymentMethodsAnswer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
