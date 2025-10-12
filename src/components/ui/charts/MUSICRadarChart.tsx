'use client';

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
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
    description: 'Modern trends and contemporary music preference',
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
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
         <p className="font-semibold text-gray-900">
           {language === 'ko' 
             ? t(`intro.musicModelTraits.${data.trait}.description`)
             : t(`intro.musicModelTraits.${data.trait}.name`)}
         </p>
        <p className="text-sm text-gray-600 mb-1">{data.description}</p>
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
    return language === 'ko' 
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
    sm: { width: 320, height: 450 },
    md: { width: 450, height: 500 },
    lg: { width: 550, height: 600 }
  };

  const currentSize = sizeConfig[size];

  // 애니메이션 설정
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        className="w-full flex justify-center"
      >
        <ResponsiveContainer width="100%" height={currentSize.height}>
          <RadarChart data={chartData} margin={{ top: 60, right: 80, bottom: 60, left: 80 }}>
            <PolarGrid 
              stroke="#E5E7EB" 
              strokeWidth={1}
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="traitDisplay"
              tick={{ 
                fontSize: 16, 
                fontWeight: 'bold',
                fill: '#374151'
              }}
              className="text-base font-medium"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 14, fill: '#9CA3AF' }}
              tickCount={4}
            />
            <Radar
              name={t('chart.musicPersonality')}
              dataKey="score"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.15}
              strokeWidth={3}
              dot={{ 
                r: 7, 
                strokeWidth: 2,
                fill: '#FFFFFF'
              }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 점수 범례 */}
      <motion.div 
        className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-2xl"
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={animated ? { delay: 0.3, duration: 0.5 } : undefined}
      >
         {MUSIC_TRAITS.map((trait) => (
           <div key={trait.key} className="text-center">
             <div 
               className="w-4 h-4 rounded-full mx-auto mb-1"
               style={{ backgroundColor: trait.color }}
             />
             <div className="text-xs font-medium text-gray-700">
               {getTraitName(trait.key)}
             </div>
             <div className="text-lg font-bold text-gray-900">
               {Math.round(personalityScores[trait.key])}
             </div>
           </div>
         ))}
      </motion.div>

      {/* 해석 가이드 */}
      <motion.div 
        className="mt-6 text-center max-w-md"
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={animated ? { delay: 0.6, duration: 0.5 } : undefined}
      >
        <p className="text-sm text-gray-600">
          {t('chart.interpretationGuide')} <br />
          {t('chart.interpretationGuide2')}
        </p>
      </motion.div>
    </div>
  );
};

export default MUSICRadarChart;