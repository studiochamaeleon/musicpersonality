import { MUSICPersonality } from './index';

// 레이더 차트 데이터 포인트
export interface ChartDataPoint {
  trait: keyof MUSICPersonality;
  traitKo: string;
  traitDisplay?: string;
  score: number;
  fullMark: number;
  color: string;
  description: string;
}

// 레이더 차트 컴포넌트 Props
export interface RadarChartProps {
  personalityScores: MUSICPersonality;
  animated?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// MUSIC 특성 정보
export interface MUSICTraitInfo {
  key: keyof MUSICPersonality;
  nameKo: string;
  nameEn: string;
  description: string;
  color: string;
}

// 차트 테마 설정
export interface ChartTheme {
  colors: {
    mellow: string;
    unpretentious: string;
    sophisticated: string;
    intense: string;
    contemporary: string;
  };
  gradients: {
    primary: string;
    secondary: string;
  };
}