'use client';

import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import { Truck, Package, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

export default function LivraisonPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('deliveryTitle')}
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          {t('deliverySubtitle')}
        </p>
      </div>

      {/* Image de livraison */}
      <div className="relative h-72 md:h-96 mb-12 rounded-lg overflow-hidden">
        <Image
          src="/images/delivery-illustration.jpg"
          alt="Livraison"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          {t('deliveryInfoTitle')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('deliveryInfoDescription')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-orange-100 p-3 rounded-full mb-4">
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('standardDelivery')}</h3>
            <p className="text-gray-600 text-sm">{t('standardDeliveryDescription')}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-orange-100 p-3 rounded-full mb-4">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('expressDelivery')}</h3>
            <p className="text-gray-600 text-sm">{t('expressDeliveryDescription')}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-orange-100 p-3 rounded-full mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('deliveryTime')}</h3>
            <p className="text-gray-600 text-sm">{t('deliveryTimeDescription')}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-orange-100 p-3 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('secureDelivery')}</h3>
            <p className="text-gray-600 text-sm">{t('secureDeliveryDescription')}</p>
          </div>
        </div>
      </div>

      {/* Tarifs de livraison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          {t('deliveryRatesTitle')}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {t('deliveryZone')}
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {t('standardRate')}
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {t('expressRate')}
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {t('deliveryTime')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                  {t('greaterTunis')}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">7 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">12 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">24-48h</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                  {t('northTunisia')}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">8 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">14 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">48-72h</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                  {t('centralTunisia')}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">9 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">16 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">48-72h</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                  {t('southTunisia')}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">10 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">18 DT</td>
                <td className="py-4 px-6 text-sm text-gray-500">72-96h</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          * {t('deliveryRatesNote')}
        </p>
      </div>

      {/* Livraison gratuite */}
      <div className="bg-orange-50 p-6 rounded-lg mb-12 border border-orange-100">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          {t('freeDeliveryTitle')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('freeDeliveryDescription')}
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>{t('freeDeliveryCondition1')}</li>
          <li>{t('freeDeliveryCondition2')}</li>
          <li>{t('freeDeliveryCondition3')}</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 flex items-center">
          <HelpCircle className="h-6 w-6 mr-2" />
          {t('deliveryFaqTitle')}
        </h2>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h3 className="font-medium text-gray-900">
                {t('deliveryFaq1Question')}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                {t('deliveryFaq1Answer')}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h3 className="font-medium text-gray-900">
                {t('deliveryFaq2Question')}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                {t('deliveryFaq2Answer')}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h3 className="font-medium text-gray-900">
                {t('deliveryFaq3Question')}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                {t('deliveryFaq3Answer')}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <h3 className="font-medium text-gray-900">
                {t('deliveryFaq4Question')}
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                {t('deliveryFaq4Answer')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact pour questions */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('deliveryContactTitle')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('deliveryContactDescription')}
        </p>
        <a
          href="/contact"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          {t('contactUs')}
        </a>
      </div>
    </div>
  );
}
