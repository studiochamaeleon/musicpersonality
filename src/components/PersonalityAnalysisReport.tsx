import { PersonalityAnalysisReport as PersonalityAnalysisReportType, CompatiblePersonalityType } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface PersonalityAnalysisReportProps {
  analysis: PersonalityAnalysisReportType;
  compatibleTypes?: CompatiblePersonalityType[];
}

export default function PersonalityAnalysisReport({ analysis, compatibleTypes = [] }: PersonalityAnalysisReportProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {analysis.typeTitle}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          {analysis.description}
        </p>
      </div>

      {/* Core Traits */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('analysisReport.coreTraits')}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {analysis.coreTraits.map((trait, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{trait.traitName}</h4>
                <span className="text-blue-600 font-bold">{trait.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${trait.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{trait.description}</p>
              <p className="text-xs text-blue-600 font-medium">{trait.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lifestyle Insights */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('analysisReport.lifestyleInsights')}</h3>
        <div className="bg-blue-50 rounded-lg p-6">
          <ul className="space-y-3">
            {analysis.lifestyleInsights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <h3 className="text-2xl font-semibold text-green-700 mb-4">{t('analysisReport.strengths')}</h3>
          <div className="bg-green-50 rounded-lg p-6">
            <ul className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-orange-700 mb-4">{t('analysisReport.challenges')}</h3>
          <div className="bg-orange-50 rounded-lg p-6">
            <ul className="space-y-3">
              {analysis.challenges.map((challenge, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1">⚠</span>
                  <span className="text-gray-700">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Relationship Compatibility */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-pink-700 mb-4">{t('analysisReport.relationshipCompatibility')}</h3>
        <div className="bg-pink-50 rounded-lg p-6 mb-4">
          <p className="text-gray-700">{analysis.relationshipCompatibility}</p>
        </div>
        
        {/* Compatible Personality Types Display */}
        {compatibleTypes.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-pink-600 mb-4">
              🎵 {t('analysisReport.compatibleTypes')}
            </h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {compatibleTypes.map((compatibleType, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    index === 0 
                      ? 'border-pink-400 shadow-md' 
                      : 'border-pink-200 hover:border-pink-300'
                  }`}
                >
                  {/* 성격 유형 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-gray-800 text-sm">
                      {compatibleType.personalityType}
                    </h5>
                    {index === 0 && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                        {t('analysisReport.bestMatch')}
                      </span>
                    )}
                  </div>
                  
                  {/* 대표 장르 뱃지 */}
                  <div className="mb-3">
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                      index === 0 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      <span className="mr-2">🎶</span>
                      <span>{compatibleType.representativeGenre.nameKo}</span>
                      <span className="ml-2 text-xs opacity-90">
                        {compatibleType.representativeGenre.compatibility}%
                      </span>
                    </div>
                  </div>
                  
                  {/* 설명 */}
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {compatibleType.description}
                  </p>
                  
                  {/* 호환성 이유 */}
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-700">
                      <span className="text-pink-600 font-medium">{t('analysisReport.compatibilityReason')}</span>
                      <br />
                      {compatibleType.compatibilityReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 호환성 안내 */}
            <div className="mt-4 text-center">
              <p className="text-sm text-pink-600 bg-pink-50 rounded-lg p-3 border border-pink-200">
{t('analysisReport.compatibilityDescription')}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Music Preferences */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-purple-700 mb-4">{t('analysisReport.musicPreferences')}</h3>
        <div className="bg-purple-50 rounded-lg p-6">
          <ul className="space-y-3">
            {analysis.musicPreferences.map((preference, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-3 mt-1">♪</span>
                <span className="text-gray-700">{preference}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recommended Activities */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-indigo-700 mb-4">{t('analysisReport.recommendedActivities')}</h3>
        <div className="bg-indigo-50 rounded-lg p-6">
          <div className="grid gap-3 md:grid-cols-2">
            {analysis.recommendedActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <span className="text-indigo-600 mr-3 mt-1">→</span>
                <span className="text-gray-700">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Engagement Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <h3 className="text-2xl font-semibold text-purple-700 mb-4 text-center">
          {t('analysisReport.socialSharing.description')}
        </h3>
        <p className="text-gray-700 text-center mb-6">
          {t('analysisReport.socialSharing.subtitle')}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              const resultText = t('analysisReport.socialSharing.resultText')
                .replace('{typeTitle}', analysis.typeTitle)
                .replace('{description}', analysis.description)
                .replace('{url}', window.location.origin);
              
              if (navigator.share) {
                navigator.share({
                  title: t('analysisReport.socialSharing.shareTitle'),
                  text: resultText
                });
              } else {
                navigator.clipboard.writeText(resultText);
                alert(t('analysisReport.resultsCopied'));
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg"
          >
{t('analysisReport.shareButton')}
          </button>
        </div>
        
        <p className="text-sm text-gray-600 text-center mt-4">
          {t('analysisReport.socialSharing.instructions')}
        </p>
      </section>
    </div>
  );
}