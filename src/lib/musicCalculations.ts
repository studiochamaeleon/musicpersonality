import { MUSICPersonality, GenreSchema, RecommendationScore, Question, EnhancedRecommendationScore, RecommendedArtist, CompatiblePersonalityType, CompatibilityType } from '@/types';
import { getGenreName } from './genreTranslations';

/**
 * MUSIC 모델 성격 점수 계산 함수들
 */

// 설문 응답을 MUSIC 점수로 변환
export function calculateMUSICScores(questions: Question[], answers: Record<string, number>): MUSICPersonality {
  const scores: MUSICPersonality = {
    mellow: 0,
    unpretentious: 0,
    sophisticated: 0,
    intense: 0,
    contemporary: 0
  };

  const counts = {
    mellow: 0,
    unpretentious: 0,
    sophisticated: 0,
    intense: 0,
    contemporary: 0
  };

  // 각 카테고리별 점수 합산
  questions.forEach(question => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      const category = question.category as keyof MUSICPersonality;
      
      // 5점 척도를 0-100 점수로 변환
      let normalizedScore = ((answer - 1) / 4) * 100;
      
      // 역채점 처리
      if (question.reverse) {
        normalizedScore = 100 - normalizedScore;
      }
      
      // 가중치 적용
      normalizedScore *= question.weight;
      
      scores[category] += normalizedScore;
      counts[category]++;
    }
  });

  // 평균 계산
  (Object.keys(scores) as Array<keyof MUSICPersonality>).forEach(key => {
    if (counts[key] > 0) {
      scores[key] = Math.round(scores[key] / counts[key]);
    }
  });

  return scores;
}

// 코사인 유사도 계산
export function calculateCosineSimilarity(
  user: MUSICPersonality, 
  genre: MUSICPersonality
): number {
  const userVector = [user.mellow, user.unpretentious, user.sophisticated, user.intense, user.contemporary];
  const genreVector = [genre.mellow, genre.unpretentious, genre.sophisticated, genre.intense, genre.contemporary];
  
  // 내적 계산
  const dotProduct = userVector.reduce((sum, val, i) => sum + val * genreVector[i], 0);
  
  // 벡터 크기 계산
  const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
  const genreMagnitude = Math.sqrt(genreVector.reduce((sum, val) => sum + val * val, 0));
  
  // 코사인 유사도
  if (userMagnitude === 0 || genreMagnitude === 0) return 0;
  return dotProduct / (userMagnitude * genreMagnitude);
}

// 유클리드 거리 기반 유사도 계산
export function calculateEuclideanSimilarity(
  user: MUSICPersonality, 
  genre: MUSICPersonality
): number {
  const userVector = [user.mellow, user.unpretentious, user.sophisticated, user.intense, user.contemporary];
  const genreVector = [genre.mellow, genre.unpretentious, genre.sophisticated, genre.intense, genre.contemporary];
  
  // 유클리드 거리 계산
  const distance = Math.sqrt(
    userVector.reduce((sum, val, i) => sum + Math.pow(val - genreVector[i], 2), 0)
  );
  
  // 최대 가능 거리로 정규화 (0-100 범위에서 최대 거리는 sqrt(5 * 100^2))
  const maxDistance = Math.sqrt(5 * Math.pow(100, 2));
  
  // 거리를 유사도로 변환 (거리가 가까울수록 높은 점수)
  return Math.max(0, 100 - (distance / maxDistance) * 100);
}

// 장르 추천 점수 계산
export function calculateGenreRecommendations(
  userPersonality: MUSICPersonality,
  genres: GenreSchema[],
  language: 'ko' | 'en' = 'ko'
): EnhancedRecommendationScore[] {
  const recommendations: EnhancedRecommendationScore[] = genres.map(genre => {
    const cosineSimilarity = calculateCosineSimilarity(userPersonality, genre.personalityProfile);
    const euclideanSimilarity = calculateEuclideanSimilarity(userPersonality, genre.personalityProfile);
    
    // 가중 평균으로 최종 점수 계산 (0-1 범위)
    const weightedScore = (cosineSimilarity * 0.6 + euclideanSimilarity * 0.4) * 0.01;
    
    // 15-95% 범위로 정규화 (현실적인 호환성 점수)
    const minScore = 15;
    const maxScore = 95;
    const normalizedScore = minScore + (weightedScore * (maxScore - minScore));
    const compatibility = Math.round(Math.max(minScore, Math.min(maxScore, normalizedScore)));
    
    // 매칭 이유 생성
    const reasoning = generateMatchingReason(userPersonality, genre, language);
    
    // 상세 매칭 정보 생성
    const detailedMatch = generateDetailedMatch(userPersonality, genre);
    
    return {
      genreId: genre.id,
      compatibility,
      matchDetails: {
        cosineSimilarity: Math.round(cosineSimilarity * 100),
        weightedScore: Math.round(weightedScore * 100)
      },
      confidence: calculateConfidence(compatibility, genre.popularity),
      reasoning,
      personalityAnalysis: genre.personalityAnalysis,
      detailedMatch
    };
  });

  // 호환성 점수로 정렬
  return recommendations.sort((a, b) => b.compatibility - a.compatibility);
}

// 상세 매칭 정보 생성
function generateDetailedMatch(user: MUSICPersonality, genre: GenreSchema) {
  const strongestConnections: string[] = [];
  const potentialGrowthAreas: string[] = [];
  const listeningContexts: string[] = [];

  // 가장 강한 연결점 찾기
  const traits = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;
  const connections = traits.map(trait => ({
    trait,
    similarity: 100 - Math.abs(user[trait] - genre.personalityProfile[trait])
  })).sort((a, b) => b.similarity - a.similarity);

  // 상위 2개 특성을 강한 연결점으로 설정
  connections.slice(0, 2).forEach(conn => {
    const traitNames = {
      mellow: '차분함과 평온함',
      unpretentious: '자연스럽고 진솔한 감성',
      sophisticated: '세련되고 지적인 취향',
      intense: '강렬하고 역동적인 에너지',
      contemporary: '현대적이고 트렌디한 스타일'
    };
    strongestConnections.push(traitNames[conn.trait]);
  });

  // 성장 가능 영역 (차이가 큰 특성들)
  connections.slice(-2).forEach(conn => {
    if (conn.similarity < 70) {
      const traitNames = {
        mellow: '더 차분한 음악적 경험',
        unpretentious: '더 자연스러운 음악적 표현',
        sophisticated: '더 복잡한 음악적 구조',
        intense: '더 강렬한 감정적 표현',
        contemporary: '더 현대적인 음악적 탐험'
      };
      potentialGrowthAreas.push(traitNames[conn.trait]);
    }
  });

  // 듣기 상황 추천
  if (genre.energy > 70) {
    listeningContexts.push('운동이나 활동적인 순간에');
  } else if (genre.energy < 30) {
    listeningContexts.push('휴식이나 명상할 때');
  }

  if (genre.valence > 70) {
    listeningContexts.push('기분을 좋게 하고 싶을 때');
  } else if (genre.valence < 40) {
    listeningContexts.push('감정을 정화하고 싶을 때');
  }

  if (genre.acousticness > 60) {
    listeningContexts.push('집중이 필요한 작업 중에');
  } else {
    listeningContexts.push('사회적 모임이나 파티에서');
  }

  return {
    strongestConnections,
    potentialGrowthAreas,
    listeningContexts
  };
}

// 매칭 이유 생성 (한국어 조사 적용)
function generateMatchingReason(user: MUSICPersonality, genre: GenreSchema, language: 'ko' | 'en' = 'ko'): string[] {
  const reasons: string[] = [];
  const threshold = 15; // 유사도 임계값
  const genreName = getGenreName(genre, language);
  
  if (Math.abs(user.mellow - genre.personalityProfile.mellow) < threshold) {
    if (user.mellow > 60) {
      reasons.push(language === 'ko' 
        ? `차분하고 평온한 성향이 ${genreName}의 특성과 잘 맞습니다`
        : `Your calm and peaceful nature aligns well with ${genreName}`
      );
    }
  }
  
  if (Math.abs(user.sophisticated - genre.personalityProfile.sophisticated) < threshold) {
    if (user.sophisticated > 60) {
      reasons.push(language === 'ko'
        ? `세련되고 지적인 취향이 ${genreName}와 완벽하게 조화됩니다`
        : `Your sophisticated and intellectual taste harmonizes perfectly with ${genreName}`
      );
    }
  }
  
  if (Math.abs(user.intense - genre.personalityProfile.intense) < threshold) {
    if (user.intense > 60) {
      reasons.push(language === 'ko'
        ? `강렬하고 역동적인 감성이 ${genreName}의 에너지와 일치합니다`
        : `Your intense and dynamic emotions match the energy of ${genreName}`
      );
    } else {
      reasons.push(language === 'ko'
        ? `절제되고 차분한 성향이 ${genreName}의 분위기와 어울립니다`
        : `Your restrained and calm nature suits the atmosphere of ${genreName}`
      );
    }
  }
  
  if (Math.abs(user.contemporary - genre.personalityProfile.contemporary) < threshold) {
    if (user.contemporary > 60) {
      reasons.push(language === 'ko'
        ? `현대적이고 트렌디한 취향이 ${genreName}와 매치됩니다`
        : `Your modern and trendy taste matches well with ${genreName}`
      );
    }
  }
  
  if (Math.abs(user.unpretentious - genre.personalityProfile.unpretentious) < threshold) {
    if (user.unpretentious > 60) {
      reasons.push(language === 'ko'
        ? `자연스럽고 소탈한 감성이 ${genreName}의 매력과 일치합니다`
        : `Your natural and unpretentious emotions align with the charm of ${genreName}`
      );
    }
  }
  
  // 적어도 하나의 매칭 이유가 있어야 함
  if (reasons.length === 0) {
    reasons.push(language === 'ko'
      ? `당신의 음악적 성향이 ${genreName}와 좋은 시너지를 만들어냅니다`
      : `Your musical tendencies create great synergy with ${genreName}`
    );
  }
  
  return reasons.slice(0, 3); // 최대 3개의 이유만 반환
}

// 신뢰도 계산 (호환성 점수 + 장르 인기도 고려)
function calculateConfidence(compatibility: number, popularity: number): number {
  // 호환성이 높고 인기도도 적절한 장르일수록 높은 신뢰도
  return Math.round((compatibility * 0.8 + popularity * 0.2));
}

// 최고 매칭 장르로 성격 유형 결정
export function determinePersonalityType(
  userPersonality: MUSICPersonality,
  topGenres: RecommendationScore[],
  genres: GenreSchema[]
): string {
  if (topGenres.length === 0) return "BALANCED_MUSIC_LOVER";
  
  const topGenre = genres.find(g => g.id === topGenres[0].genreId);
  if (!topGenre) return "BALANCED_MUSIC_LOVER";
  
  return `${topGenre.category}_${topGenre.name.toUpperCase().replace(/\s+/g, '_')}`;
}

// 아티스트 추천 함수
export function recommendArtists(
  topGenres: EnhancedRecommendationScore[],
  genres: GenreSchema[],
  maxArtists: number = 6,
  language: 'ko' | 'en' = 'ko'
): RecommendedArtist[] {
  const recommendedArtists: RecommendedArtist[] = [];

  // 상위 장르들에서 아티스트 추출
  topGenres.slice(0, 3).forEach(genreRec => {
    const genre = genres.find(g => g.id === genreRec.genreId);
    if (genre && genre.representativeArtists) {
      genre.representativeArtists.forEach(artist => {
        recommendedArtists.push({
          artist: {
            name: artist.name,
            nameKo: artist.nameKo || artist.name,
            popularity: artist.popularity,
            keyTracks: artist.keyTracks
          },
          genreName: genre.name,
          genreNameKo: getGenreName(genre, 'ko'),
          compatibility: genreRec.compatibility,
          reason: language === 'en' 
            ? `Representative artist of ${getGenreName(genre, 'en')} genre, ${genreRec.compatibility}% match with your musical preferences`
            : `${getGenreName(genre, 'ko')} 장르의 대표적인 아티스트로 당신의 음악적 성향과 ${genreRec.compatibility}% 일치합니다`
        });
      });
    }
  });

  // 인기도와 호환성을 고려하여 정렬
  recommendedArtists.sort((a, b) => {
    const scoreA = (a.artist.popularity * 0.3) + (a.compatibility * 0.7);
    const scoreB = (b.artist.popularity * 0.3) + (b.compatibility * 0.7);
    return scoreB - scoreA;
  });

  return recommendedArtists.slice(0, maxArtists);
}

/**
 * 한국어 조사 처리 함수들
 */

// 받침 여부 확인
function hasLastConsonant(str: string): boolean {
  if (!str) return false;
  const lastChar = str[str.length - 1];
  const lastCharCode = lastChar.charCodeAt(0);
  
  // 한글 범위 확인
  if (lastCharCode < 0xAC00 || lastCharCode > 0xD7A3) {
    return false;
  }
  
  // 받침 계산 (유니코드 한글 공식)
  return (lastCharCode - 0xAC00) % 28 !== 0;
}

// 은/는 조사 선택
export function getSubjectParticle(word: string): string {
  return hasLastConsonant(word) ? '은' : '는';
}

// 이/가 조사 선택
export function getNominativeParticle(word: string): string {
  return hasLastConsonant(word) ? '이' : '가';
}

// 을/를 조사 선택
export function getObjectParticle(word: string): string {
  return hasLastConsonant(word) ? '을' : '를';
}

/**
 * 호환되는 성격 유형 찾기 - 상호 보완적 관계 중심
 */
export function getCompatiblePersonalityTypes(
  userPersonality: MUSICPersonality,
  allGenres: GenreSchema[],
  language: 'ko' | 'en' = 'ko'
): CompatiblePersonalityType[] {
  const compatibleTypes: CompatiblePersonalityType[] = [];
  
  // 1. 상호 보완적 성격 유형 찾기
  const complementaryTypes = findComplementaryTypes(userPersonality, allGenres, language);
  compatibleTypes.push(...complementaryTypes);
  
  // 2. 향상된 유사 성격 유형 찾기 (다른 관점에서)
  const enhancedSimilarTypes = findEnhancedSimilarTypes(userPersonality, allGenres, language);
  compatibleTypes.push(...enhancedSimilarTypes.slice(0, 1)); // 최고 1개만
  
  // 3. 균형잡힌 조화 유형 찾기
  const balancedTypes = findBalancedTypes(userPersonality, allGenres, language);
  compatibleTypes.push(...balancedTypes.slice(0, 1)); // 최고 1개만
  
  return compatibleTypes.slice(0, 3); // 최대 3개 반환
}



// 가장 높은 점수의 특성 찾기
function getDominantTrait(personality: MUSICPersonality): keyof MUSICPersonality {
  const traits = Object.entries(personality) as [keyof MUSICPersonality, number][];
  return traits.reduce((max, [trait, score]) => 
    score > personality[max] ? trait : max, 
    traits[0][0]
  );
}

/**
 * 향상된 관계 호환성 텍스트 생성
 */
export function generateEnhancedRelationshipCompatibility(
  userPersonality: MUSICPersonality,
  allGenres: GenreSchema[],
  language: 'ko' | 'en' = 'ko'
): string {
  const compatibleTypes = getCompatiblePersonalityTypes(userPersonality, allGenres, language);
  
  if (compatibleTypes.length === 0) {
    return language === 'ko' 
      ? "다양한 음악적 취향을 가진 사람들과 잘 어울립니다."
      : "You get along well with people who have diverse musical tastes.";
  }
  
  const topCompatible = compatibleTypes[0];
  const genreName = getGenreName(topCompatible.representativeGenre, language);
  
  if (language === 'ko') {
    const particle = getObjectParticle(genreName);
    return `${topCompatible.personalityType} 유형과 특히 잘 맞습니다. ${genreName}${particle} 함께 즐기며 음악적 교감을 나눌 수 있는 사람들과 깊은 유대감을 형성합니다. 음악에 대한 진지한 대화와 새로운 아티스트 발굴을 좋아하는 사람들과 잘 어울립니다.`;
  } else {
    return `You particularly match well with ${topCompatible.personalityType} types. You form deep bonds with people who can share musical communion while enjoying ${genreName} together. You get along well with people who enjoy serious conversations about music and discovering new artists.`;
  }
}

/**
 * 상호 보완적 성격 유형 찾기
 */
function findComplementaryTypes(
  userPersonality: MUSICPersonality,
  allGenres: GenreSchema[],
  language: 'ko' | 'en' = 'ko'
): CompatiblePersonalityType[] {
  const complementaryTypes: CompatiblePersonalityType[] = [];
  
    // 사용자의 약한 부분을 보완하는 장르들 찾기
  const userTraits = Object.entries(userPersonality) as [keyof MUSICPersonality, number][];
  const weakTraits = userTraits.filter(([, score]) => score < 40).map(([trait]) => trait);
  
  allGenres.forEach(genre => {
    let complementaryScore = 0;
    const complementaryReasons: string[] = [];
    
    // 사용자의 약한 부분에서 장르가 강한지 확인
    weakTraits.forEach(trait => {
      if (genre.personalityProfile[trait] > 60) {
        complementaryScore += 30;
        const traitNames = {
          mellow: '차분함',
          unpretentious: '소탈함', 
          sophisticated: '세련됨',
          intense: '강렬함',
          contemporary: '현대성'
        };
        const traitNamesEn = {
          mellow: 'calmness',
          unpretentious: 'authenticity',
          sophisticated: 'sophistication',
          intense: 'intensity',
          contemporary: 'modernity'
        };
        const genreName = getGenreName(genre, language);
        complementaryReasons.push(language === 'ko' 
          ? `당신에게 부족한 ${traitNames[trait]}을 ${genreName}${getNominativeParticle(genreName)} 채워줍니다`
          : `${genreName} fills the ${traitNamesEn[trait]} that you lack`);
      }
    });
    
    // 상호 보완적 균형 확인
    const balanceScore = calculateComplementaryBalance(userPersonality, genre.personalityProfile);
    complementaryScore += balanceScore;
    
    if (complementaryScore > 40) {
      const personalityType = generateComplementaryPersonalityType(genre, userPersonality, language);
      const relationshipDynamics = generateRelationshipDynamics(userPersonality, genre, 'COMPLEMENTARY', language);
      const musicalSynergy = generateMusicalSynergy(userPersonality, genre, 'COMPLEMENTARY', language);
      
      complementaryTypes.push({
        personalityType,
        description: generateComplementaryDescription(language),
        representativeGenre: {
          name: genre.name,
          nameKo: getGenreName(genre, 'ko'),
          compatibility: Math.min(95, 65 + complementaryScore)
        },
        compatibilityReason: complementaryReasons[0] || (language === 'ko' 
          ? `${getGenreName(genre, language)}와 서로를 보완하는 완벽한 조화를 이룹니다`
          : `Perfect harmony that complements each other with ${getGenreName(genre, language)}`),
        compatibilityType: 'COMPLEMENTARY',
        relationshipDynamics,
        musicalSynergy
      });
    }
  });
  
  return complementaryTypes
    .sort((a, b) => b.representativeGenre.compatibility - a.representativeGenre.compatibility)
    .slice(0, 2);
}

/**
 * 향상된 유사 성격 유형 찾기 (다른 관점에서의 유사성)
 */
function findEnhancedSimilarTypes(
  userPersonality: MUSICPersonality,
  allGenres: GenreSchema[],
  language: 'ko' | 'en' = 'ko'
): CompatiblePersonalityType[] {
  const recommendations = calculateGenreRecommendations(userPersonality, allGenres, language);
  const enhancedTypes: CompatiblePersonalityType[] = [];
  
  // 유사하지만 새로운 관점을 제공하는 장르들
  recommendations.slice(3, 6).forEach(rec => { // 상위 3개 이후의 장르들
    const genre = allGenres.find(g => g.id === rec.genreId);
    if (!genre || rec.compatibility < 70) return;
    
    const personalityType = generateEnhancedSimilarPersonalityType(genre, language);
    const relationshipDynamics = generateRelationshipDynamics(userPersonality, genre, 'SIMILAR_ENHANCED', language);
    const musicalSynergy = generateMusicalSynergy(userPersonality, genre, 'SIMILAR_ENHANCED', language);
    
    enhancedTypes.push({
      personalityType,
      description: generateEnhancedSimilarDescription(language),
      representativeGenre: {
        name: genre.name,
        nameKo: getGenreName(genre, 'ko'),
        compatibility: rec.compatibility
      },
      compatibilityReason: language === 'ko' 
        ? `${getGenreName(genre, language)}를 통해 당신의 음악적 영역을 확장할 수 있습니다`
        : `You can expand your musical territory through ${getGenreName(genre, language)}`,
      compatibilityType: 'SIMILAR_ENHANCED',
      relationshipDynamics,
      musicalSynergy
    });
  });
  
  return enhancedTypes.slice(0, 1);
}

/**
 * 균형잡힌 조화 유형 찾기
 */
function findBalancedTypes(
  userPersonality: MUSICPersonality,
  allGenres: GenreSchema[],
  language: 'ko' | 'en' = 'ko'
): CompatiblePersonalityType[] {
  const balancedTypes: CompatiblePersonalityType[] = [];
  
  allGenres.forEach(genre => {
    const balanceScore = calculateOverallBalance(userPersonality, genre.personalityProfile);
    
    if (balanceScore > 75 && balanceScore < 85) { // 완벽한 균형 범위
      const personalityType = generateBalancedPersonalityType(genre, language);
      const relationshipDynamics = generateRelationshipDynamics(userPersonality, genre, 'BALANCED', language);
      const musicalSynergy = generateMusicalSynergy(userPersonality, genre, 'BALANCED', language);
      
      balancedTypes.push({
        personalityType,
        description: generateBalancedDescription(language),
        representativeGenre: {
          name: genre.name,
          nameKo: getGenreName(genre, 'ko'),
          compatibility: balanceScore
        },
        compatibilityReason: language === 'ko'
          ? `${getGenreName(genre, language)}와 함께 완벽한 음악적 균형을 이룹니다`
          : `Achieve perfect musical balance together with ${getGenreName(genre, language)}`,
        compatibilityType: 'BALANCED',
        relationshipDynamics,
        musicalSynergy
      });
    }
  });
  
  return balancedTypes
    .sort((a, b) => b.representativeGenre.compatibility - a.representativeGenre.compatibility)
    .slice(0, 1);
}

/**
 * 보완적 균형 점수 계산
 */
function calculateComplementaryBalance(user: MUSICPersonality, genre: MUSICPersonality): number {
  const traits = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;
  let balanceScore = 0;
  
  traits.forEach(trait => {
    const userScore = user[trait];
    const genreScore = genre[trait];
    
    // 상호 보완 점수: 한쪽이 낮고 다른 쪽이 높을 때 높은 점수
    if ((userScore < 40 && genreScore > 60) || (userScore > 60 && genreScore < 40)) {
      balanceScore += 15;
    }
    // 적당한 차이로 균형을 이루는 경우
    else if (Math.abs(userScore - genreScore) > 20 && Math.abs(userScore - genreScore) < 50) {
      balanceScore += 10;
    }
  });
  
  return balanceScore;
}

/**
 * 전체적 균형 점수 계산
 */
function calculateOverallBalance(user: MUSICPersonality, genre: MUSICPersonality): number {
  const userVector = [user.mellow, user.unpretentious, user.sophisticated, user.intense, user.contemporary];
  const genreVector = [genre.mellow, genre.unpretentious, genre.sophisticated, genre.intense, genre.contemporary];
  
  // 유클리드 거리를 이용한 균형 점수
  const distance = Math.sqrt(
    userVector.reduce((sum, val, i) => sum + Math.pow(val - genreVector[i], 2), 0)
  );
  
  // 거리를 균형 점수로 변환 (적당한 거리일 때 높은 점수)
  const idealDistance = 30; // 이상적인 거리
  const balanceScore = Math.max(0, 100 - Math.abs(distance - idealDistance) * 2);
  
  return Math.round(balanceScore);
}

/**
 * 성격 유형명 생성 함수들
 */
function generateComplementaryPersonalityType(genre: GenreSchema, user: MUSICPersonality, language: 'ko' | 'en' = 'ko'): string {
  const dominant = getDominantTrait(user);
  const genreName = getGenreName(genre, language);
  
  const traitNames = language === 'ko' ? {
    mellow: '평온함을 추구하는',
    unpretentious: '자연스러움을 좋아하는',
    sophisticated: '세련됨을 중시하는',
    intense: '열정적인',
    contemporary: '트렌디한'
  } : {
    mellow: 'Peace-Seeking',
    unpretentious: 'Natural-Loving',
    sophisticated: 'Sophistication-Focused',
    intense: 'Passionate',
    contemporary: 'Trendy'
  };
  
  return language === 'ko' 
    ? `${traitNames[dominant]} ${genreName} 보완형`
    : `${traitNames[dominant]} ${genreName} Complementary`;
}

function generateEnhancedSimilarPersonalityType(genre: GenreSchema, language: 'ko' | 'en' = 'ko'): string {
  const genreName = getGenreName(genre, language);
  return language === 'ko' ? `${genreName} 탐험가` : `${genreName} Explorer`;
}

function generateBalancedPersonalityType(genre: GenreSchema, language: 'ko' | 'en' = 'ko'): string {
  const genreName = getGenreName(genre, language);
  return language === 'ko' ? `${genreName} 조화형` : `${genreName} Harmonious`;
}

/**
 * 설명 생성 함수들
 */
function generateComplementaryDescription(language: 'ko' | 'en' = 'ko'): string {
  return language === 'ko' 
    ? `당신과 상호 보완적인 음악적 성향을 가져 함께할 때 완벽한 균형을 이룹니다`
    : `Has complementary musical tendencies with you, creating perfect balance when together`;
}

function generateEnhancedSimilarDescription(language: 'ko' | 'en' = 'ko'): string {
  return language === 'ko'
    ? `비슷한 음악적 취향을 바탕으로 새로운 영역을 탐험하고 싶어하는 성향입니다`
    : `Shares similar musical taste and desires to explore new territories together`;
}

function generateBalancedDescription(language: 'ko' | 'en' = 'ko'): string {
  return language === 'ko'
    ? `당신과 조화로운 음악적 균형을 이루며 서로의 취향을 존중합니다`
    : `Creates harmonious musical balance with you and respects each other's preferences`;
}

/**
 * 관계 역학 생성
 */
function generateRelationshipDynamics(user: MUSICPersonality, genre: GenreSchema, type: CompatibilityType, language: 'ko' | 'en' = 'ko'): string {
  const genreName = getGenreName(genre, language);
  
  switch (type) {
    case 'COMPLEMENTARY':
      return language === 'ko' 
        ? `서로의 부족한 부분을 채워주며 음악적 성장을 도모하는 관계입니다. ${genreName}를 통해 새로운 감성을 발견할 수 있습니다.`
        : `A relationship that fosters musical growth by filling each other's gaps. You can discover new emotions through ${genreName}.`;
    case 'SIMILAR_ENHANCED':
      return language === 'ko'
        ? `비슷한 취향을 바탕으로 더 깊이 있는 음악적 탐험을 함께하는 관계입니다. ${genreName}에 대한 이해를 공유하며 발전시킵니다.`
        : `A relationship for deeper musical exploration based on similar tastes. Share and develop understanding of ${genreName} together.`;
    case 'BALANCED':
      return language === 'ko'
        ? `서로 다른 강점을 인정하며 균형잡힌 음악적 교류를 나누는 관계입니다. ${genreName}를 중심으로 조화로운 소통이 가능합니다.`
        : `A relationship of balanced musical exchange, recognizing each other's strengths. Harmonious communication is possible centered around ${genreName}.`;
  }
}

/**
 * 음악적 시너지 생성
 */
function generateMusicalSynergy(user: MUSICPersonality, genre: GenreSchema, type: CompatibilityType, language: 'ko' | 'en' = 'ko'): string {
  const genreName = getGenreName(genre, language);
  
  switch (type) {
    case 'COMPLEMENTARY':
      return language === 'ko'
        ? `${genreName}의 특성이 당신의 음악적 경험을 확장시켜 주며, 함께 들을 때 더욱 풍부한 감동을 경험할 수 있습니다.`
        : `The characteristics of ${genreName} expand your musical experience, creating richer emotions when listening together.`;
    case 'SIMILAR_ENHANCED':
      return language === 'ko'
        ? `${genreName}에 대한 공통된 관심사로 깊이 있는 음악 대화가 가능하며, 새로운 아티스트 발굴을 함께 즐길 수 있습니다.`
        : `Common interest in ${genreName} enables deep musical conversations and enjoying discovering new artists together.`;
    case 'BALANCED':
      return language === 'ko'
        ? `${genreName}를 통해 서로의 음악적 관점을 나누며, 균형잡힌 플레이리스트를 만들어 갈 수 있습니다.`
        : `Share musical perspectives through ${genreName} and create balanced playlists together.`;
  }
}

// 편의 함수: recommendGenres alias
export const recommendGenres = calculateGenreRecommendations;