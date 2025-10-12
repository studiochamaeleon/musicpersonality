'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share2 } from 'lucide-react';
import { MUSICPersonality, GenreSchema } from '@/types';
import { analytics } from '@/lib/analytics';
import { useTranslation } from '@/hooks/useTranslation';
import { getGenreName, getGenreCharacteristics } from '@/lib/genreTranslations';

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
  const { t, language } = useTranslation();
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



  const shareUnified = async () => {
    // Track unified share action
    analytics.track('result_shared', {
      shareType: 'unified',
      topGenre: topGenre.name,
      topGenreKo: topGenre.nameKo,
      personalityScores
    });

    // Step 1: Try image + native sharing (highest quality option)
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          width: 600,
          height: 800,
          background: '#6366f1',
          useCORS: true,
          allowTaint: false
        });

        await new Promise((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            if (!blob) return reject(new Error('Failed to create blob'));

            // Try native sharing with image file
            if (navigator.share) {
              try {
                const file = new File([blob], 'music-personality.png', { type: 'image/png' });
                const shareData = {
                  title: language === 'ko' ? '내 음악적 성격 검사 결과' : 'My Music Personality Test Results',
                  text: language === 'ko' 
                    ? `저는 ${getGenreName(topGenre, language)} 음악을 좋아해요! 당신의 음악적 정체성을 발견해보세요.`
                    : `I'm a ${getGenreName(topGenre, language)} music lover! Discover your musical identity.`,
                  files: [file]
                };
                
                if (navigator.canShare?.(shareData)) {
                  await navigator.share(shareData);
                  return resolve(true);
                }
              } catch {
                console.log('Image sharing failed, trying URL sharing');
              }
            }
            reject(new Error('Image sharing not available'));
          }, 'image/png');
        });
        return; // Success, exit early
      } catch {
        console.log('Image generation or sharing failed, falling back to URL sharing');
      }
    }

    // Step 2: Fallback to URL/text sharing (if image sharing failed)
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'ko' ? `내 음악적 성격: ${getGenreName(topGenre, language)}` : `My Music Personality: ${getGenreName(topGenre, language)}`,
          text: language === 'ko' 
            ? `저는 ${getGenreName(topGenre, language)} 음악을 좋아해요! 당신의 음악적 성격을 발견해보세요.`
            : `I'm a ${getGenreName(topGenre, language)} music lover! Discover your music personality.`,
          url: window.location.href
        });
        return; // Success, exit early
      } catch {
        console.log('URL sharing failed, falling back to clipboard');
      }
    }

    // Step 3: Final fallback - Copy to clipboard
    try {
      const shareUrl = `${window.location.origin}?mellow=${personalityScores.mellow}&unpretentious=${personalityScores.unpretentious}&sophisticated=${personalityScores.sophisticated}&intense=${personalityScores.intense}&contemporary=${personalityScores.contemporary}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(language === 'ko' ? '공유 URL이 클립보드에 복사되었습니다!' : 'Share URL copied to clipboard!');
    } catch (clipboardError) {
      console.error('All share methods failed:', clipboardError);
      alert(language === 'ko' ? '공유에 실패했습니다. 다시 시도해주세요.' : 'Sharing failed. Please try again.');
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

    const topTraitsText = topTraits.slice(0, 2).map(([trait]) => getTraitName(trait)).join(' & ');
    const text = language === 'ko' 
      ? `내 음악적 성격을 발견했어요: ${topTraitsText}! 제가 가장 좋아하는 장르는 ${getGenreName(topGenre, language)}입니다. 당신은 어떤가요?`
      : `I just discovered my music personality: ${topTraitsText}! My top genre is ${getGenreName(topGenre, language)}. What's yours?`;
    const url = `${window.location.origin}?mellow=${personalityScores.mellow}&unpretentious=${personalityScores.unpretentious}&sophisticated=${personalityScores.sophisticated}&intense=${personalityScores.intense}&contemporary=${personalityScores.contemporary}`;
    const hashtags = language === 'ko' ? '음악성격검사,MUSIC,성격검사' : 'MusicPersonality,MUSIC';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
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

  const getTraitName = (trait: string): string => {
    // For Korean, use the description (침착함, 소탈함, etc.)
    // For English, use the name (Mellow, Unpretentious, etc.)
    const key = language === 'ko' ? `intro.musicModelTraits.${trait}.description` : `intro.musicModelTraits.${trait}.name`;
    return t(key) || trait;
  };

  return (
    <div className={`shareable-card-container ${className}`}>
      {/* 실제 공유될 카드 */}
      <div
        ref={cardRef}
        className="shareable-card w-full max-w-[600px] h-[800px] mx-auto bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white p-8 flex flex-col justify-between relative overflow-hidden"
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
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ko' ? '음악적 성격 유형 검사' : 'Music Personality Test'}
            </h1>
            <p className="text-lg opacity-90">{t('shareableCard.myMusicalPersonality')}</p>
          </div>

          {/* 메인 결과 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{getGenreName(topGenre, language)}</h2>
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
                    <span className="font-medium">{getTraitName(trait)}</span>
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
              {getGenreCharacteristics(topGenre.id, topGenre.characteristics, language).slice(0, 3).join(' • ')}
            </p>
            <p className="text-xs opacity-70">
{t('shareableCard.basedOnMusicModel')}
            </p>
          </div>
        </div>
      </div>

      {/* 공유 버튼들 - 3버튼 레이아웃 */}
      <div className="mt-6 flex justify-center gap-3 md:gap-4 px-4 md:px-0">
        <button
          onClick={shareUnified}
          className="flex items-center space-x-2 px-4 md:px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors touch-feedback min-h-[44px] text-sm md:text-base font-medium"
        >
          <Share2 size={18} />
          <span>{t('sharing.share')}</span>
        </button>
        
        <button
          onClick={shareToTwitter}
          className="flex items-center justify-center px-4 md:px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-feedback min-h-[44px] text-sm md:text-base font-medium min-w-[60px]"
        >
          <span>𝕏</span>
        </button>
        
        <button
          onClick={shareToFacebook}
          className="flex items-center justify-center px-4 md:px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors touch-feedback min-h-[44px] text-sm md:text-base font-medium min-w-[100px]"
        >
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
};

export default ShareableCard;