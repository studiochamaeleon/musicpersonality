'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = []
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-indicator w-full max-w-4xl mx-auto mb-8">
      {/* 단계 정보 */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-700">
          {t('survey.questionProgress')} {currentStep} / {totalSteps}
        </div>
        <div className="text-sm text-gray-500">
          {Math.round(progressPercentage)}% {t('survey.percentComplete')}
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 단계별 라벨 (옵션) */}
      {stepLabels.length > 0 && (
        <div className="flex justify-between text-xs text-gray-500">
          {stepLabels.map((label, index) => (
            <span
              key={index}
              className={`
                ${index + 1 <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}
              `}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* MUSIC 모델 카테고리 진행도 */}
      <div className="mt-6 grid grid-cols-5 gap-2 text-xs">
        {[
          { key: 'MELLOW', ko: '침착', en: 'MEL' },
          { key: 'UNPRETENTIOUS', ko: '소탈', en: 'UNP' },
          { key: 'SOPHISTICATED', ko: '세련', en: 'SOP' },
          { key: 'INTENSE', ko: '강렬', en: 'INT' },
          { key: 'CONTEMPORARY', ko: '현대', en: 'CON' }
        ].map((category, categoryIndex) => {
            const categoryStart = categoryIndex * 8 + 1;
            const categoryEnd = (categoryIndex + 1) * 8;
            const isCategoryActive = currentStep >= categoryStart;
            const isCategoryComplete = currentStep > categoryEnd;
            
            return (
              <div
                key={category.key}
                className={`
                  text-center p-2 rounded-md border
                  ${isCategoryComplete 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : isCategoryActive 
                    ? 'bg-blue-100 border-blue-300 text-blue-800' 
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                  }
                `}
              >
                <div className="font-semibold">{language === 'ko' ? category.ko : category.en}</div>
                <div className="text-[10px] mt-1">
                  {Math.max(0, Math.min(8, currentStep - categoryStart + (categoryStart <= currentStep ? 1 : 0)))}/8
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;