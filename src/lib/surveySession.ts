import type { Question, SurveyState } from '../types/index.ts';
import { isValidAnswer } from './surveyScore.ts';
import { SURVEY_VERSION } from './surveyVersion.ts';
import { createComparisonHash, parseComparisonHash } from './compatibility.ts';

export const SURVEY_DRAFT_STORAGE_KEY = 'music-personality-survey';

export interface RestoredSurveyDraft extends SurveyState {
  comparisonHash: string | null;
}

export function canonicalSurveyComparisonHash(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const params = new URLSearchParams(value.startsWith('#') ? value.slice(1) : value);
  if (params.getAll('compare').length !== 1 || params.getAll('hv').length > 1 || params.has('guest') || params.has('gv') || (params.has('hv') && !['2', '3'].includes(params.get('hv') || ''))) return null;
  const comparison = parseComparisonHash(value);
  return comparison ? createComparisonHash(comparison.hostScores, null, { hostVersion: comparison.hostVersion }) : null;
}

export function surveyAnswerProgress(questions: Question[], answers: Record<string, number>) {
  const answeredCount = questions.filter(question => isValidAnswer(question, answers[question.id])).length;
  const percentage = questions.length ? (answeredCount / questions.length) * 100 : 0;
  return { answeredCount, percentage };
}

/** Recover usable answers without trusting persisted navigation or result metadata. */
export function restoreSurveyDraft(value: unknown, questions: Question[], now = new Date()): RestoredSurveyDraft | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const draft = value as Record<string, unknown>;
  if (draft.questionVersion !== SURVEY_VERSION) return null;
  const comparisonHash = draft.comparisonHash == null ? null : canonicalSurveyComparisonHash(draft.comparisonHash);
  if (draft.comparisonHash != null && !comparisonHash) return null;

  const sourceAnswers = draft.answers && typeof draft.answers === 'object' && !Array.isArray(draft.answers)
    ? draft.answers as Record<string, unknown>
    : {};
  const answers: Record<string, number> = {};
  for (const question of questions) {
    const answer = sourceAnswers[question.id];
    if (isValidAnswer(question, answer)) answers[question.id] = answer;
  }

  const firstUnanswered = questions.findIndex(question => !isValidAnswer(question, answers[question.id]));
  const fallbackStep = firstUnanswered === -1 ? Math.max(questions.length, 1) : firstUnanswered + 1;
  const currentStep = typeof draft.currentStep === 'number' && Number.isInteger(draft.currentStep)
    ? Math.min(Math.max(draft.currentStep, 1), Math.max(questions.length, 1))
    : fallbackStep;
  const savedStartTime = typeof draft.startTime === 'string' ? new Date(draft.startTime) : null;
  const startTime = savedStartTime && Number.isFinite(savedStartTime.getTime()) ? savedStartTime : now;

  return { currentStep, answers, startTime, isComplete: false, comparisonHash };
}

export function resumableSurveyDraft(value: unknown, questions: Question[], now = new Date()): RestoredSurveyDraft | null {
  const restored = restoreSurveyDraft(value, questions, now);
  if (!restored || (value as Record<string, unknown>).isComplete === true) return null;
  return surveyAnswerProgress(questions, restored.answers).answeredCount ? restored : null;
}

type SurveyShortcutEvent = Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'repeat' | 'isComposing' | 'defaultPrevented'>;

/** Only plain numeric presses may answer; browser shortcuts and text editing must not. */
export function surveyShortcutAnswer(event: SurveyShortcutEvent, scale: number, fromEditable = false): number | null {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.isComposing || event.defaultPrevented || fromEditable) return null;
  if (!/^[1-9]$/.test(event.key)) return null;
  const answer = Number(event.key);
  return answer <= scale ? answer : null;
}
