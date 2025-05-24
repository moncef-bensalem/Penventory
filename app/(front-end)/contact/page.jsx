'use client';

import { useState } from 'react';
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
  User
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
    category: 'OTHER',
    priority: 'MEDIUM',
    message: '',
    orderNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données du ticket
      const ticketData = {
        subject: formData.subject,
        description: formData.message,
        category: formData.category,
        priority: formData.priority,
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
    }
  };

  const resetForm = () => {
    setFormData({
      name: user ? user.name : '',
      email: user ? user.email : '',
      subject: '',
      category: 'OTHER',
      priority: 'MEDIUM',
      message: '',
      orderNumber: ''
    });
    setSubmitted(false);
    setTicketId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">{t('contactPageTitle')}</h1>
          <p className="text-center text-gray-600 mb-8">
            {t('contactPageSubtitle')}
          </p>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    <h2 className="text-xl font-semibold mb-6">{t('sendMessageTitle')}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fullNameLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('emailLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('subjectLabel')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('orderNumberLabel')}
                      </label>
                      <input
                        type="text"
                        id="orderNumber"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('categoryLabel')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        >
                          {supportCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('priorityLabel')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        >
                          {supportPriorities.map(priority => (
                            <option key={priority.id} value={priority.id}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('messageLabel')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      ></textarea>
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">{t('thankYouTitle')}</h2>
                    <p className="text-gray-600 mb-6">
                      {t('thankYouMessage')}
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg mb-6 inline-block">
                      <p className="text-gray-700 font-medium">{t('referenceNumberLabel')}</p>
                      <p className="text-orange-600 font-mono font-bold">{ticketId}</p>
                    </div>
                    <p className="text-gray-600 mb-6">
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
            <h2 className="text-2xl font-bold text-center mb-8">{t('faqTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold">{t('trackOrderQuestion')}</h3>
                </div>
                <p className="text-gray-600">
                  {t('trackOrderAnswer')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold">{t('returnPolicyQuestion')}</h3>
                </div>
                <p className="text-gray-600">
                  {t('returnPolicyAnswer')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold">{t('paymentMethodsQuestion')}</h3>
                </div>
                <p className="text-gray-600">
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
