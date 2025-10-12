'use client';

import { useTranslation } from '@/hooks/useTranslation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PrivacyPolicy() {
  const { t, isLoading } = useTranslation();

  const getArrayFromTranslation = (key: string): string[] => {
    const value = t(key);
    return Array.isArray(value) ? value : [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('privacy.title')}</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>{t('privacy.lastUpdated')}</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. {t('privacy.sections.introduction.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('privacy.sections.introduction.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. {t('privacy.sections.dataCollection.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.dataCollection.noCollectionTitle')}</h3>
                <p className="mb-4">{t('privacy.sections.dataCollection.noCollectionContent')}</p>
                
                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.dataCollection.localStorageTitle')}</h3>
                <ul className="list-disc ml-6 mb-4">
                  {getArrayFromTranslation('privacy.sections.dataCollection.localStorageItems').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.dataCollection.thirdPartyTitle')}</h3>
                <ul className="list-disc ml-6">
                  {getArrayFromTranslation('privacy.sections.dataCollection.thirdPartyItems').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. {t('privacy.sections.dataUsage.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t('privacy.sections.dataUsage.noUsageContent')}</p>
              <p className="text-gray-700 leading-relaxed mb-2">{t('privacy.sections.dataUsage.browserProcessingContent')}</p>
              <ul className="list-disc ml-6 text-gray-700 leading-relaxed">
                {getArrayFromTranslation('privacy.sections.dataUsage.browserProcessingItems').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. {t('privacy.sections.thirdPartyServices.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.thirdPartyServices.googleAdsenseTitle')}</h3>
                <p className="mb-4">
                  {t('privacy.sections.thirdPartyServices.googleAdsenseContent')}
                </p>
                
                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.thirdPartyServices.noAnalyticsTitle')}</h3>
                <p>
                  {t('privacy.sections.thirdPartyServices.noAnalyticsContent')}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. {t('privacy.sections.cookies.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.cookies.ourStorageTitle')}</h3>
                <p className="mb-2">{t('privacy.sections.cookies.ourStorageContent')}</p>
                <ul className="list-disc ml-6 mb-4">
                  {getArrayFromTranslation('privacy.sections.cookies.ourStorageItems').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-medium mb-2">{t('privacy.sections.cookies.thirdPartyCookiesTitle')}</h3>
                <p>
                  {t('privacy.sections.cookies.thirdPartyCookiesContent')}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. {t('privacy.sections.dataSecurity.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('privacy.sections.dataSecurity.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. {t('privacy.sections.userRights.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">{t('privacy.sections.userRights.content')}</p>
                <ul className="list-disc ml-6 mb-4">
                  {getArrayFromTranslation('privacy.sections.userRights.controlItems').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p>
                  {t('privacy.sections.userRights.noTraditionalRights')}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. {t('privacy.sections.childrenPrivacy.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('privacy.sections.childrenPrivacy.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. {t('privacy.sections.policyChanges.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('privacy.sections.policyChanges.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. {t('privacy.sections.contact.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('privacy.sections.contact.content')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  {t('privacy.sections.contact.email')}<br />
                  {t('privacy.sections.contact.website')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 