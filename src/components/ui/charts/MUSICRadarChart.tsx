'use client';

import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, useReducedMotion } from 'framer-motion';
import { ChartDataPoint, RadarChartProps, MUSICTraitInfo } from '@/types/charts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

// MUSIC 특성 정보 및 색상 정의
const MUSIC_TRAITS: Omit<MUSICTraitInfo, 'nameKo' | 'nameEn'>[] = [
  {
    key: 'mellow',
    description: 'Calm and relaxed music preference',
    color: '#10B981'
  },
  {
    key: 'unpretentious',
    description: 'Genuine and simple music preference',
    color: '#F59E0B'
  },
  {
    key: 'sophisticated',
    description: 'Complex and intellectual music preference',
    color: '#8B5CF6'
  },
  {
    key: 'intense',
    description: 'Dynamic and powerful music preference',
    color: '#EF4444'
  },
  {
    key: 'contemporary',
    description: 'Contemporary rhythms and production preference',
    color: '#06B6D4'
  }
];

// 커스텀 툴팁 컴포넌트
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint & {
      nameEn: string;
      nameKo: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-white/15 bg-[#111116]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
         <p className="font-semibold text-white">
           {language !== 'en'
             ? t(`intro.musicModelTraits.${data.trait}.description`)
             : t(`intro.musicModelTraits.${data.trait}.name`)}
         </p>
        <p className="mb-1 text-sm text-white/70">{data.description}</p>
        <p className="text-lg font-bold" style={{ color: data.color }}>
          {Math.round(data.score)}{t('results.points')}
        </p>
      </div>
    );
  }
  return null;
};

const MUSICRadarChart: React.FC<RadarChartProps> = ({ 
  personalityScores, 
  animated = true, 
  showTooltip = true,
  size = 'md',
  className = ''
}) => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  // Helper function to get trait name based on language
  const getTraitName = (traitKey: string) => {
    return language !== 'en'
      ? t(`intro.musicModelTraits.${traitKey}.description`)
      : t(`intro.musicModelTraits.${traitKey}.name`);
  };
  
   // MUSIC 점수를 차트 데이터로 변환
   const chartData = MUSIC_TRAITS.map(trait => ({
     trait: trait.key,
     traitDisplay: getTraitName(trait.key),
     score: personalityScores[trait.key],
     fullMark: 100,
     color: trait.color,
     description: t(`intro.musicTraitDescriptions.${trait.key}`)
   }));

  // 크기별 설정
  const sizeConfig = {
    sm: { width: 320, height: 340 },
    md: { width: 450, height: 420 },
    lg: { width: 550, height: 500 }
  };

  const currentSize = sizeConfig[size];
  const [chartWidth, setChartWidth] = useState<number>(currentSize.width);
  const compact = chartWidth < 360;
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animated && !reducedMotion;

  // 애니메이션 설정
  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  return (
    <div data-testid="music-radar-chart" className={`flex flex-col items-center ${className}`}>
      <motion.div
        variants={shouldAnimate ? containerVariants : undefined}
        initial={shouldAnimate ? "hidden" : undefined}
        animate={shouldAnimate ? "visible" : undefined}
        className="w-full flex justify-center"
      >
        <ResponsiveContainer width="100%" height={currentSize.height} onResize={width => setChartWidth(width)}>
          <RadarChart data={chartData} outerRadius={compact ? '65%' : '80%'} margin={{ top: 42, right: 58, bottom: 42, left: 58 }}>
            <PolarGrid 
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="traitDisplay"
              tick={{ 
                fontSize: compact ? 10 : 12,
                fontWeight: 700,
                fill: 'rgba(244,244,246,0.7)'
              }}
              className="text-base font-medium"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'rgba(244,244,246,0.65)' }}
              tickCount={4}
            />
            <Radar
              isAnimationActive={shouldAnimate}
              name={t('chart.musicPersonality')}
              dataKey="score"
              stroke="#C8FF3D"
              fill="#C8FF3D"
              fillOpacity={0.13}
              strokeWidth={2}
              dot={{ 
                r: 5,
                strokeWidth: 2,
                fill: '#07080A'
              }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 점수 범례 */}
      <motion.div 
        data-testid="music-radar-legend"
        className={`mt-1 grid w-full max-w-2xl gap-x-3 gap-y-4 ${compact ? 'grid-cols-2' : 'grid-cols-5'}`}
        initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
        transition={shouldAnimate ? { delay: 0.3, duration: 0.5 } : undefined}
      >
         {MUSIC_TRAITS.map((trait, index) => (
           <div key={trait.key} className={`min-w-0 text-center ${compact && index === 4 ? 'col-span-2' : ''}`}>
             <div 
               className="mx-auto mb-2 h-2 w-2 rounded-full"
               style={{ backgroundColor: trait.color }}
             />
             <div className="break-words text-[11px] font-semibold leading-5 text-white/70">
               {getTraitName(trait.key)}
             </div>
             <div className="score-tabular mt-1 text-base font-bold text-white sm:text-lg">
               {Math.round(personalityScores[trait.key])}
             </div>
           </div>
         ))}
      </motion.div>

      {/* 해석 가이드 */}
      <motion.div 
        className="mt-6 max-w-md text-center"
        initial={shouldAnimate ? { opacity: 0 } : undefined}
        animate={shouldAnimate ? { opacity: 1 } : undefined}
        transition={shouldAnimate ? { delay: 0.6, duration: 0.5 } : undefined}
      >
        <p className="text-xs leading-5 text-white/70">
          {t('chart.interpretationGuide')} <br />
          {t('chart.interpretationGuide2')}
        </p>
      </motion.div>
    </div>
  );
};

export default MUSICRadarChart;
