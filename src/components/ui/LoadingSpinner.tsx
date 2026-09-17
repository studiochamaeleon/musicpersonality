import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading.default');

  return (
    <div className="app-canvas flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="animate-pulse-ring absolute inset-0 rounded-full border border-[#c8ff3d]/30" />
          <div className="absolute inset-[9px] animate-spin rounded-full border-2 border-white/15 border-t-[#c8ff3d]" />
        </div>
        <p className="text-sm font-medium text-white/60">{displayMessage}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
