'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Send,
  User,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

// Fonction pour obtenir les catégories de support traduites
const getSupportCategories = (t) => [
  { id: 'order', label: t('supportCategory1'), icon: '📦' },
  { id: 'account', label: t('supportCategory2'), icon: '👤' },
  { id: 'payment', label: t('supportCategory3'), icon: '💳' },
  { id: 'general', label: t('supportCategory4'), icon: '❓' },
  { id: 'order_related', label: t('supportCategory5'), icon: '🛒' },
];

// Fonction pour obtenir les questions fréquentes par catégorie traduites
const getFaqByCategory = (t) => ({
  order: [
    { id: 'order_1', question: t('chatFaqOrder1') },
    { id: 'order_2', question: t('chatFaqOrder2') },
  ],
  account: [
    { id: 'account_1', question: t('chatFaqAccount1') },
    { id: 'account_2', question: t('chatFaqAccount2') },
  ],
  payment: [
    { id: 'payment_1', question: t('chatFaqPayment1') },
    { id: 'payment_2', question: t('chatFaqPayment2') },
    { id: 'payment_3', question: t('chatFaqPayment3') },
  ],
  general: [
    { id: 'general_1', question: t('chatFaqGeneral1') },
    { id: 'general_2', question: t('chatFaqGeneral2') },
  ],
  order_related: [
    { id: 'order_related_1', question: t('chatFaqOrderRelated1') },
    { id: 'order_related_2', question: t('chatFaqOrderRelated2') },
    { id: 'order_related_3', question: t('chatFaqOrderRelated3') },
  ],
});

// Fonction pour obtenir les réponses prédéfinies traduites
const getPredefinedResponses = (t) => ({
  order_1: {
    type: 'text',
    content: t('predefinedResponseOrder1')
  },
  payment_3: {
    type: 'steps',
    content: [
      t('predefinedResponsePayment3Step1'),
      t('predefinedResponsePayment3Step2'),
      t('predefinedResponsePayment3Step3'),
      t('predefinedResponsePayment3Step4'),
      t('predefinedResponsePayment3Step5'),
      t('predefinedResponsePayment3Step6')
    ]
  },
  order_related_2: {
    type: 'steps',
    content: [
      t('predefinedResponseOrderRelated2Step1'),
      t('predefinedResponseOrderRelated2Step2'),
      t('predefinedResponseOrderRelated2Step3'),
      t('predefinedResponseOrderRelated2Step4'),
      t('predefinedResponseOrderRelated2Step5')
    ]
  }
});

export default function ChatSupport() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [chatStep, setChatStep] = useState('welcome'); // welcome, contact, category, questions, chat
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', email: '' });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Obtenir les données traduites
  const supportCategories = getSupportCategories(t);
  const faqByCategory = getFaqByCategory(t);
  const predefinedResponses = getPredefinedResponses(t);
  
  // Faire défiler automatiquement vers le bas lors de nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const resetChat = () => {
    setChatStep('welcome');
    setSelectedCategory(null);
    setMessages([]);
    setInputMessage('');
  };
  
  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier que tous les champs sont remplis
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email) {
      return;
    }
    
    // Ajouter un message de bienvenue
    addBotMessage(t('chatWelcomeMessage').replace('{firstName}', contactInfo.firstName));
    
    // Passer à l'étape suivante
    setChatStep('category');
  };
  
  const selectCategory = (category) => {
    setSelectedCategory(category);
    
    addBotMessage(t('chatCategoryMessage').replace('{categoryLabel}', category.label));
    setChatStep('questions');
  };
  
  const selectQuestion = (question) => {
    // Ajouter la question comme message utilisateur
    addUserMessage(question.question);
    
    // Simuler une réponse du bot
    setIsTyping(true);
    setTimeout(() => {
      const response = predefinedResponses[question.id];
      
      if (response) {
        if (response.type === 'text') {
          addBotMessage(response.content);
        } else if (response.type === 'steps') {
          response.content.forEach(step => {
            addBotMessage(step);
          });
        }
      } else {
        addBotMessage(t('chatNoPredefResponse'));
        addQuickReplies([t('quickReplyYesAgent'), t('quickReplyNoThanks')]);
      }
      
      setIsTyping(false);
      setChatStep('chat');
    }, 1000);
  };
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addUserMessage(inputMessage);
    setInputMessage('');
    
    // Simuler une réponse du bot
    setIsTyping(true);
    setTimeout(() => {
      addBotMessage(t('chatAgentSoon'));
      addBotMessage(t('chatHelpWithElse'));
      addQuickReplies([t('quickReplyAnotherQuestion'), t('quickReplyNoThanks')]);
      setIsTyping(false);
    }, 1500);
  };
  
  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
  };
  
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'bot', text }]);
  };
  
  const addQuickReplies = (replies) => {
    setMessages(prev => [...prev, { sender: 'bot', quickReplies: replies }]);
  };
  
  const handleQuickReply = (reply) => {
    addUserMessage(reply);
    
    if (reply === t('quickReplyYesAgent')) {
      setIsTyping(true);
      setTimeout(() => {
        addBotMessage(t('chatConnectAgent'));
        setIsTyping(false);
      }, 1000);
    } else if (reply === t('quickReplyNoThanks')) {
      setIsTyping(true);
      setTimeout(() => {
        addBotMessage(t('chatThanks'));
        addBotMessage(t('chatClosed'));
        addQuickReplies([t('quickReplyNewConversation')]);
        setIsTyping(false);
      }, 1000);
    } else if (reply === t('quickReplyNewConversation')) {
      resetChat();
    } else if (reply === t('quickReplyAnotherQuestion')) {
      setChatStep('category');
      setSelectedCategory(null);
    }
  };
  
  const handleInputChange = (e) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <>
      {/* Bouton de chat flottant */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          data-chat-button
          className={`rounded-full p-3 shadow-lg ${isOpen ? 'bg-gray-700' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </Button>
      </div>
      
      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col overflow-hidden max-h-[80vh]">
          {/* En-tête */}
          <div className="bg-orange-500 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              <span className="font-semibold">{t('chatSupportTitle')}</span>
            </div>
            <button onClick={toggleChat} className="text-white">
              <ChevronDown size={20} />
            </button>
          </div>
          
          {/* Corps du chat */}
          <div className="flex-1 overflow-y-auto p-3 max-h-[400px] min-h-[300px] bg-gray-50">
            {chatStep === 'welcome' && (
              <div className="text-center py-4">
                <div className="bg-orange-500 text-white rounded-full p-3 inline-flex mb-3">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('chatWelcomeTitle')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('chatWelcomeDescription')}</p>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium mb-3">{t('contactInfoTitle')}</h4>
                  <form onSubmit={handleContactSubmit}>
                    <div className="mb-3">
                      <label htmlFor="firstName" className="block text-xs text-gray-600 mb-1">
                        {t('firstName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={contactInfo.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-sm"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="lastName" className="block text-xs text-gray-600 mb-1">
                        {t('lastName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={contactInfo.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-sm"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="block text-xs text-gray-600 mb-1">
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md text-sm"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {t('validate')}
                    </Button>
                  </form>
                </div>
              </div>
            )}
            
            {chatStep === 'category' && (
              <div>
                <div className="mb-4">
                  {messages.map((msg, index) => (
                    <div key={index} className="mb-3">
                      {msg.sender === 'bot' && !msg.quickReplies && (
                        <div className="flex items-start">
                          <div className="bg-orange-500 text-white rounded-full p-1 mr-2">
                            <UserCheck size={16} />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      )}
                      {msg.sender === 'user' && (
                        <div className="flex items-start justify-end">
                          <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <div className="bg-blue-600 text-white rounded-full p-1 ml-2">
                            <User size={16} />
                          </div>
                        </div>
                      )}
                      {msg.quickReplies && (
                        <div className="my-2">
                          {msg.quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickReply(reply)}
                              className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm mr-2 mb-2 hover:bg-gray-100"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium mb-3">{t('chooseOption')}</h4>
                  <div className="space-y-2">
                    {supportCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => selectCategory(category)}
                        className="w-full text-left p-2 border rounded-md hover:bg-gray-50 flex items-center"
                      >
                        <span className="mr-2">{category.icon}</span>
                        <span className="text-sm">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {chatStep === 'questions' && selectedCategory && (
              <div>
                <div className="mb-4">
                  {messages.map((msg, index) => (
                    <div key={index} className="mb-3">
                      {msg.sender === 'bot' && !msg.quickReplies && (
                        <div className="flex items-start">
                          <div className="bg-orange-500 text-white rounded-full p-1 mr-2">
                            <UserCheck size={16} />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      )}
                      {msg.sender === 'user' && (
                        <div className="flex items-start justify-end">
                          <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <div className="bg-blue-600 text-white rounded-full p-1 ml-2">
                            <User size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    <button 
                      onClick={() => setChatStep('category')}
                      className="mr-2 text-blue-500 hover:underline flex items-center text-xs"
                    >
                      <ChevronUp size={16} />
                      <span>{t('back')}</span>
                    </button>
                    <h4 className="text-sm font-medium">
                      {selectedCategory.icon} {selectedCategory.label}
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    {faqByCategory[selectedCategory.id].map((question) => (
                      <button
                        key={question.id}
                        onClick={() => selectQuestion(question)}
                        className="w-full text-left p-2 border rounded-md hover:bg-gray-50 flex items-center"
                      >
                        <HelpCircle size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm">{question.question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {chatStep === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  {messages.map((msg, index) => (
                    <div key={index} className="mb-3">
                      {msg.sender === 'bot' && !msg.quickReplies && (
                        <div className="flex items-start">
                          <div className="bg-orange-500 text-white rounded-full p-1 mr-2">
                            <UserCheck size={16} />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      )}
                      {msg.sender === 'user' && (
                        <div className="flex items-start justify-end">
                          <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <div className="bg-blue-600 text-white rounded-full p-1 ml-2">
                            <User size={16} />
                          </div>
                        </div>
                      )}
                      {msg.quickReplies && (
                        <div className="my-2">
                          {msg.quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickReply(reply)}
                              className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm mr-2 mb-2 hover:bg-gray-100"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start">
                      <div className="bg-orange-500 text-white rounded-full p-1 mr-2">
                        <UserCheck size={16} />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>
          
          {/* Pied de page avec zone de saisie */}
          {chatStep === 'chat' && (
            <div className="border-t p-3 bg-white">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('typingPlaceholder')}
                  className="flex-1 p-2 border rounded-l-md focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-l-none bg-orange-500 hover:bg-orange-600"
                >
                  <Send size={18} />
                </Button>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">
                {t('cannotTypeNow')}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
