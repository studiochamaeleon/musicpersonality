'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2 } from 'lucide-react';
import { MUSICPersonality, GenreSchema } from '@/types';
import { analytics } from '@/lib/analytics';
import { useTranslation } from '@/hooks/useTranslation';

interface ShareableCardProps {
  personalityScores: MUSICPersonality;
  topGenre: GenreSchema;
  topGenreScore: number;
  className?: string;
}

const ShareableCard: React.FC<ShareableCardProps> = ({
  personalityScores,
  topGenre,
  topGenreScore,
  className = ''
}) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  // MUSIC 트레이트 색상 매핑
  const traitColors = {
    mellow: '#10B981', // 초록색
    unpretentious: '#F59E0B', // 주황색
    sophisticated: '#8B5CF6', // 보라색
    intense: '#EF4444', // 빨간색
    contemporary: '#3B82F6' // 파란색
  };

  // 최고 점수를 가진 MUSIC 트레이트 찾기
  const topTraits = Object.entries(personalityScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const downloadImage = async () => {
    if (!cardRef.current) return;

    // Track download action
    analytics.track('result_shared', {
      shareType: 'download',
      topGenre: topGenre.name,
      topGenreKo: topGenre.nameKo,
      personalityScores
    });

    try {
      const canvas = await html2canvas(cardRef.current, {
        background: '#ffffff',
        useCORS: true,
        allowTaint: false,
        width: 600,
        height: 800
      });

      const link = document.createElement('a');
      link.download = `music-personality-${topGenre.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const shareToSocial = async () => {
    if (!cardRef.current) return;

    // Track social share action
    analytics.track('result_shared', {
      shareType: 'social_native',
      topGenre: topGenre.name,
      topGenreKo: topGenre.nameKo,
      personalityScores
    });

    try {
      const canvas = await html2canvas(cardRef.current, {
        width: 600,
        height: 800,
        background: '#6366f1',
        useCORS: true,
        allowTaint: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Check if native sharing is available and supports files
        if (navigator.share) {
          try {
            const file = new File([blob], 'music-personality.png', { type: 'image/png' });
            const shareData = {
              title: 'My Music Personality Test Results',
              text: `I'm a ${topGenre.name} music lover! Discover your musical identity.`,
              files: [file]
            };
            
            if (navigator.canShare?.(shareData)) {
              await navigator.share(shareData);
              return;
            }
          } catch {
            console.log('Native sharing failed, falling back to download');
          }
        }

        // Fallback: Download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'music-personality-result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      
      // Ultimate fallback: Share URL only
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Music Personality Test Results',
            text: `I'm a ${topGenre.name} music lover! Discover your musical identity.`,
            url: window.location.href
          });
        } catch (shareError) {
          console.error('URL sharing also failed:', shareError);
        }
      } else {
        // Generate dynamic share URL with personality data
        const shareUrl = `${window.location.origin}?mellow=${personalityScores.mellow}&unpretentious=${personalityScores.unpretentious}&sophisticated=${personalityScores.sophisticated}&intense=${personalityScores.intense}&contemporary=${personalityScores.contemporary}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share URL copied to clipboard!');
      }
    }
  };

  const shareToTwitter = () => {
    // Track Twitter share
    analytics.track('result_shared', {
      shareType: 'twitter',
      topGenre: topGenre.name,
      topGenreKo: topGenre.nameKo,
      personalityScores
    });

    const topTraitsText = topTraits.slice(0, 2).map(([trait]) => getTraitNameKo(trait)).join(' & ');
    const text = `I just discovered my music personality: ${topTraitsText}! My top genre is ${topGenre.name}. What's yours?`;
    const url = `${window.location.origin}?mellow=${personalityScores.mellow}&unpretentious=${personalityScores.unpretentious}&sophisticated=${personalityScores.sophisticated}&intense=${personalityScores.intense}&contemporary=${personalityScores.contemporary}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=MusicPersonality,MUSIC`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = () => {
    // Track Facebook share
    analytics.track('result_shared', {
      shareType: 'facebook',
      topGenre: topGenre.name,
      topGenreKo: topGenre.nameKo,
      personalityScores
    });

    const url = `${window.location.origin}?mellow=${personalityScores.mellow}&unpretentious=${personalityScores.unpretentious}&sophisticated=${personalityScores.sophisticated}&intense=${personalityScores.intense}&contemporary=${personalityScores.contemporary}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const getTraitNameKo = (trait: string): string => {
    const names: Record<string, string> = {
      mellow: '온화함',
      unpretentious: '소탈함',
      sophisticated: '세련됨',
      intense: '강렬함',
      contemporary: '현대적'
    };
    return names[trait] || trait;
  };

  return (
    <div className={`shareable-card-container ${className}`}>
      {/* 실제 공유될 카드 */}
      <div
        ref={cardRef}
        className="shareable-card w-[600px] h-[800px] bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white p-8 flex flex-col justify-between relative overflow-hidden"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-20 right-16 w-24 h-24 rounded-full bg-white/15"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 rounded-full bg-white/25"></div>
        </div>

        {/* 헤더 */}
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎵</div>
            <h1 className="text-2xl font-bold mb-2">Music Personality Test</h1>
            <p className="text-lg opacity-90">{t('shareableCard.myMusicalPersonality')}</p>
          </div>

          {/* 메인 결과 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{topGenre.nameKo}</h2>
              <p className="text-lg opacity-90 mb-4">{topGenre.category}</p>
              <div className="bg-white/20 rounded-full px-4 py-2 inline-block">
                <span className="text-xl font-bold">{topGenreScore}% {t('shareableCard.match')}</span>
              </div>
            </div>
          </div>

          {/* 상위 3개 MUSIC 트레이트 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center mb-4">{t('shareableCard.myMusicalTraits')}</h3>
            {topTraits.map(([trait, score]) => (
              <div key={trait} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{getTraitNameKo(trait)}</span>
                    <span className="text-sm font-bold">{Math.round(score)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${score}%`,
                        backgroundColor: traitColors[trait as keyof typeof traitColors]
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="relative z-10 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <p className="text-sm opacity-80 mb-2">
              {topGenre.characteristics.slice(0, 3).join(' • ')}
            </p>
            <p className="text-xs opacity-70">
{t('shareableCard.basedOnMusicModel')}
            </p>
          </div>
        </div>
      </div>

      {/* 공유 버튼들 */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 md:gap-3">
        <button
          onClick={downloadImage}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors touch-feedback min-h-[44px] text-sm md:text-base"
        >
          <Download size={18} />
          <span>{t('sharing.download')}</span>
        </button>
        
        <button
          onClick={shareToSocial}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-feedback min-h-[44px] text-sm md:text-base"
        >
          <Share2 size={18} />
          <span>{t('sharing.share')}</span>
        </button>
        
        <button
          onClick={shareToTwitter}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 active:bg-sky-700 transition-colors touch-feedback min-h-[44px] text-sm md:text-base"
        >
          <span>Twitter</span>
        </button>
        
        <button
          onClick={shareToFacebook}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors touch-feedback min-h-[44px] text-sm md:text-base"
        >
          <span>Facebook</span>
        </button>
        
        <button
          onClick={() => {
            // Track general share
            analytics.track('result_shared', {
              shareType: 'native',
              topGenre: topGenre.name,
              topGenreKo: topGenre.nameKo,
              personalityScores
            });

            if (navigator.share) {
              navigator.share({
                title: `My Music Personality: ${topGenre.nameKo}`,
                text: `I'm a ${topGenre.nameKo} music lover! Discover your music personality.`,
                url: window.location.href
              });
            }
          }}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors touch-feedback min-h-[44px] text-sm md:text-base"
        >
          <Share2 size={18} />
          <span>{t('sharing.shareNative')}</span>
        </button>
      </div>
    </div>
  );
};

export default ShareableCard;