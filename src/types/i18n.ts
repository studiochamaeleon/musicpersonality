export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language);
}

export function localize<T>(language: Language, values: Record<Language, T>): T {
  return values[language];
}

export type TranslationKeys = Record<string, unknown>;
