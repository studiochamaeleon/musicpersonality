'use client';

import { useTranslation } from '@/hooks/useTranslation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('terms.title')}</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>{t('terms.lastUpdated')}</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. {t('terms.sections.acceptance.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.acceptance.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. {t('terms.sections.serviceDescription.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.serviceDescription.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. {t('terms.sections.userResponsibilities.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">{t('terms.sections.userResponsibilities.content')}</p>
                <ul className="list-disc ml-6">
                  {getArrayFromTranslation('terms.sections.userResponsibilities.responsibilities').map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. {t('terms.sections.privacyData.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.privacyData.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. {t('terms.sections.intellectualProperty.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.intellectualProperty.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. {t('terms.sections.warranties.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">{t('terms.sections.warranties.content')}</p>
                <ul className="list-disc ml-6">
                  {getArrayFromTranslation('terms.sections.warranties.disclaimers').map((disclaimer, index) => (
                    <li key={index}>{disclaimer}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. {t('terms.sections.liability.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.liability.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. {t('terms.sections.assessmentDisclaimer.title')}</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">{t('terms.sections.assessmentDisclaimer.content')}</p>
                <ul className="list-disc ml-6">
                  {getArrayFromTranslation('terms.sections.assessmentDisclaimer.disclaimers').map((disclaimer, index) => (
                    <li key={index}>{disclaimer}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. {t('terms.sections.advertising.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.advertising.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. {t('terms.sections.termination.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.termination.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. {t('terms.sections.changes.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.changes.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. {t('terms.sections.governingLaw.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.governingLaw.content')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. {t('terms.sections.contact.title')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {t('terms.sections.contact.content')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  {t('terms.sections.contact.email')}<br />
                  {t('terms.sections.contact.website')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}