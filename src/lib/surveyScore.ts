import type { MUSICPersonality, Question } from '../types/index.ts';

const TRAITS = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;

function emptyScores(): MUSICPersonality {
  return { mellow: 0, unpretentious: 0, sophisticated: 0, intense: 0, contemporary: 0 };
}

export function isValidAnswer(question: Question, answer: unknown): answer is number {
  return Number.isInteger(answer) && Number(answer) >= 1 && Number(answer) <= question.scale;
}

export function calculateMUSICScores(questions: Question[], answers: Record<string, number>): MUSICPersonality {
  const totals = emptyScores();
  const weights = emptyScores();

  for (const question of questions) {
    const answer = answers[question.id];
    if (!isValidAnswer(question, answer) || !Number.isFinite(question.weight) || question.weight <= 0) continue;
    const normalized = ((answer - 1) / (question.scale - 1)) * 100;
    const score = question.reverse ? 100 - normalized : normalized;
    totals[question.category] += score * question.weight;
    weights[question.category] += question.weight;
  }

  const result = emptyScores();
  for (const key of TRAITS) result[key] = weights[key] ? Math.round(totals[key] / weights[key]) : 0;
  return result;
}
