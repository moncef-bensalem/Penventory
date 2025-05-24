'use client';

import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Users, Target, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  // Données de l'équipe
  const teamMembers = [
    {
      name: 'Moncef Ben Salem',
      role: t('founderCEO'),
      image: '/images/team/moncef.png',
      bio: t('ahmedBio')
    },
    {
      name: 'Ala ben marzoug',
      role: t('marketingDirector'),
      image: '/images/team/profile.jpg',
      bio: t('leilaBio')
    },
  
  ];

  // Valeurs de l'entreprise
  const values = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-orange-600" />,
      title: t('qualityValue'),
      description: t('qualityValueDescription')
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: t('customerValue'),
      description: t('customerValueDescription')
    },
    {
      icon: <Award className="h-8 w-8 text-orange-600" />,
      title: t('excellenceValue'),
      description: t('excellenceValueDescription')
    },
    {
      icon: <Target className="h-8 w-8 text-orange-600" />,
      title: t('innovationValue'),
      description: t('innovationValueDescription')
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: t('growthValue'),
      description: t('growthValueDescription')
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: t('reliabilityValue'),
      description: t('reliabilityValueDescription')
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('aboutUsTitle')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('aboutUsSubtitle')}
        </p>
      </section>

      {/* Notre Histoire */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('ourStoryTitle')}</h2>
            <div className="space-y-4 text-gray-600">
              <p>{t('ourStoryParagraph1')}</p>
              <p>{t('ourStoryParagraph2')}</p>
              <p>{t('ourStoryParagraph3')}</p>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl bg-gradient-to-r from-orange-100 to-orange-200">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-3xl font-bold text-orange-600 mb-4">Penventory</h3>
              <p className="text-gray-700 mb-4">{t('storeLocation')}</p>
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v18H3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18" />
                </svg>
              </div>
              <p className="text-gray-700 italic">"Excellence in Writing Instruments"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Mission et Vision */}
      <section className="mb-16 bg-gray-50 py-12 px-6 rounded-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('missionVisionTitle')}</h2>
          
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-orange-600 mb-4">{t('ourMissionTitle')}</h3>
            <p className="text-lg text-gray-700">{t('ourMissionDescription')}</p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-orange-600 mb-4">{t('ourVisionTitle')}</h3>
            <p className="text-lg text-gray-700">{t('ourVisionDescription')}</p>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('ourValuesTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 p-3 inline-block rounded-full mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('ourTeamTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/3 h-64 md:h-auto">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi Nous Choisir */}
      <section className="mb-16 bg-orange-50 py-12 px-6 rounded-xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('whyChooseUsTitle')}</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <ShieldCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('qualityProductsTitle')}</h3>
                <p className="text-gray-600">{t('qualityProductsDescription')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('expertiseTitle')}</h3>
                <p className="text-gray-600">{t('expertiseDescription')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-orange-100 p-2 rounded-full mr-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('customerServiceTitle')}</h3>
                <p className="text-gray-600">{t('customerServiceDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('joinUsTitle')}</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {t('joinUsDescription')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/products"
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            {t('exploreProducts')}
          </Link>
          <Link
            href="/contact"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-md transition-colors"
          >
            {t('contactUs')}
          </Link>
        </div>
      </section>
    </div>
  );
}
