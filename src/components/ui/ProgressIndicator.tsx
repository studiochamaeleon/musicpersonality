'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const { language } = useTranslation();
  const percentage = Math.round((currentStep / totalSteps) * 100);
  return (
    <div className="mx-auto w-full max-w-2xl pt-3" aria-label={`${percentage}%`}>
      <div className="mb-3 flex items-center justify-between text-xs font-semibold">
        <span className="score-tabular text-white/75">{String(currentStep).padStart(2, '0')} <span className="text-white/25">/ {totalSteps}</span></span>
        <span className="text-white/35">{percentage}% {language === 'ko' ? '진행' : 'complete'}</span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#c8ff3d,#43f5ff)] transition-[width] duration-300 ease-out" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressIndicator;
