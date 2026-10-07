'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number; answeredCount: number }> = ({ currentStep, totalSteps, answeredCount }) => {
  const { language } = useTranslation();
  const rawPercentage = totalSteps ? (answeredCount / totalSteps) * 100 : 0;
  const percentage = answeredCount < totalSteps ? Math.min(99, Math.round(rawPercentage)) : Math.round(rawPercentage);
  const progressDescription = language === 'ko' ? `${totalSteps}개 질문 중 ${answeredCount}개 응답 · 현재 ${currentStep}번째 질문` : language === 'ja' ? `${totalSteps}問中${answeredCount}問に回答済み · 現在${currentStep}問目` : `${answeredCount} of ${totalSteps} questions answered · question ${currentStep}`;
  return (
    <div className="mx-auto w-full max-w-2xl pt-3" aria-label={`${percentage}%`}>
      <div className="mb-3 flex items-baseline justify-between gap-3 text-xs font-semibold sm:mb-4">
        <span className="score-tabular text-lg tracking-[-0.04em] text-white/90">{String(currentStep).padStart(2, '0')} <span className="ml-1 text-xs font-medium tracking-normal text-white/45">/ {totalSteps}</span></span>
        <span className="score-tabular text-white/65">{percentage}% {language === 'ko' ? '응답' : language === 'ja' ? '回答済み' : 'answered'}</span>
      </div>
      <div role="progressbar" aria-label={language === 'ko' ? '설문 진행률' : language === 'ja' ? '質問の進み具合' : 'Survey progress'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={progressDescription} className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#c8ff3d,#43f5ff)] transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressIndicator;
