import { Language, TranslationKeys } from '@/types/i18n';

// 번역 데이터를 동적으로 로드하는 함수
export const loadTranslations = async (language: Language): Promise<TranslationKeys> => {
  try {
    const translations = await import(`@/locales/${language}.json`);
    return translations.default as unknown as TranslationKeys;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // 폴백으로 한국어 로드
    const fallback = await import('@/locales/ko.json');
    return fallback.default as unknown as TranslationKeys;
  }
};

// 중첩된 객체에서 키로 값을 가져오는 헬퍼 함수
export const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const result = path.split('.').reduce((current: Record<string, unknown> | unknown, key) => {
    return current && typeof current === 'object' && current !== null && (current as Record<string, unknown>)[key] 
      ? (current as Record<string, unknown>)[key] 
      : null;
  }, obj);
  
  return typeof result === 'string' ? result : path;
};

// 번역 키 타입 검증
export const isValidTranslationKey = (key: string): boolean => {
  // 간단한 패턴 검증 (점으로 구분된 경로)
  return /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(key);
};