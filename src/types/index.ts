// MUSIC 모델 성격 유형 정의
export interface MUSICPersonality {
  mellow: number;        // 침착함 (0-100)
  unpretentious: number; // 소탈함 (0-100)
  sophisticated: number; // 세련됨 (0-100)
  intense: number;       // 강렬함 (0-100)
  contemporary: number;  // 현대성 (0-100)
}

// 장르 스키마
export interface GenreSchema {
  id: string;
  name: string;
  nameKo: string;
  category: 'JAZZ' | 'ROCK' | 'ELECTRONIC' | 'CLASSICAL' | 'POP' | 'HIP_HOP' | 'RNB' | 'WORLD';
  parentGenre?: string;
  subGenres: string[];
  personalityProfile: MUSICPersonality;
  description: string;
  characteristics: string[];
  era: string;
  popularity: number;
  energy: number;
  valence: number;
  acousticness: number;
  personalityAnalysis?: PersonalityAnalysisReport;
  representativeArtists?: ArtistReference[];
}

export interface ArtistReference {
  name: string;
  nameKo?: string;
  popularity: number;
  keyTracks: string[];
}

// 아티스트
export interface Artist {
  id: string;
  name: string;
  nameKo?: string;
  primaryGenres: string[];
  personalityProfile: MUSICPersonality;
  country: string;
  popularity: number;
  description: string;
  keyTracks: Track[];
}

// 트랙
export interface Track {
  id: string;
  title: string;
  titleKo?: string;
  year: number;
  genreId: string;
  personalityMatch: number;
}

// 설문 관련
export interface Question {
  id: string;
  category: keyof MUSICPersonality;
  text: string;
  textEn?: string;
  description?: string;
  descriptionEn?: string;
  scale: 5 | 7;
  scaleLabels: {
    min: string;
    max: string;
  };
  scaleLabelsEn?: {
    min: string;
    max: string;
  };
  weight: number;
  reverse?: boolean;
}

export interface SurveyState {
  currentStep: number;
  answers: Record<string, number>;
  startTime: Date;
  isComplete: boolean;
  personalityScores?: MUSICPersonality;
}

// 추천 시스템
export interface RecommendationScore {
  genreId: string;
  compatibility: number;
  matchDetails: {
    cosineSimilarity: number;
    weightedScore: number;
  };
  confidence: number;
  reasoning: string[];
}

// Enhanced personality analysis interfaces
export interface TraitAnalysis {
  traitName: string;
  score: number;
  description: string;
  impact: string;
}

export interface PersonalityAnalysisReport {
  typeTitle: string;
  description: string;
  coreTraits: TraitAnalysis[];
  lifestyleInsights: string[];
  strengths: string[];
  challenges: string[];
  relationshipCompatibility: string;
  musicPreferences: string[];
  recommendedActivities: string[];
}

export interface EnhancedRecommendationScore extends RecommendationScore {
  personalityAnalysis?: PersonalityAnalysisReport;
  detailedMatch: {
    strongestConnections: string[];
    potentialGrowthAreas: string[];
    listeningContexts: string[];
  };
}

export interface RecommendedArtist {
  artist: {
    name: string;
    nameKo: string;
    popularity: number;
    keyTracks: string[];
  };
  genreName: string;
  genreNameKo: string;
  compatibility: number;
  reason: string;
}

export type CompatibilityType = 'COMPLEMENTARY' | 'SIMILAR_ENHANCED' | 'BALANCED';

export interface CompatiblePersonalityType {
  personalityType: string;
  description: string;
  representativeGenre: {
    name: string;
    nameKo: string;
    compatibility: number;
  };
  compatibilityReason: string;
  compatibilityType: CompatibilityType;
  relationshipDynamics: string;
  musicalSynergy: string;
}

export interface PersonalityResult {
  primaryType: string;
  scores: MUSICPersonality;
  description: string;
  recommendedGenres: EnhancedRecommendationScore[];
  recommendedArtists: Artist[];
  personalityAnalysis: PersonalityAnalysisReport;
}

// UI 컴포넌트 Props
export interface QuestionCardProps {
  question: Question;
  answer?: number;
  onAnswer: (value: number) => void;
}

export interface LikertScaleProps {
  scale: 5 | 7;
  value?: number;
  onChange: (value: number) => void;
  labels: { min: string; max: string };
}