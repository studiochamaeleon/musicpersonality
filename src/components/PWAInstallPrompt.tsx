'use client';

import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useTranslation } from '@/hooks/useTranslation';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt
      setShowPrompt(true);
      
      // Track that PWA prompt was shown
      analytics.track('pwa_prompt_shown');
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
      
      // Track that PWA was successfully installed
      analytics.track('pwa_installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      analytics.track('pwa_install_accepted');
    } else {
      console.log('User dismissed the install prompt');
      analytics.track('pwa_install_dismissed');
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed it for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    
    // Track that user dismissed the prompt
    analytics.track('pwa_prompt_dismissed');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-semibold text-sm">{t('pwa.installTitle')}</h3>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-sm text-white/90 mb-3">
        {t('pwa.installDescription')}
      </p>
      
      <div className="flex space-x-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          {t('pwa.installButton')}
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white text-sm font-medium py-2 px-3 transition-colors"
        >
          {t('pwa.laterButton')}
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;