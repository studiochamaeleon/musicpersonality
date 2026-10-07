'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { SurveyState, Question } from '@/types';
import { calculateMUSICScores, isValidAnswer } from '@/lib/surveyScore';
import { readBrowserStorage, removeBrowserStorage, writeBrowserStorage } from '@/lib/browserStorage';
import { SURVEY_VERSION } from '@/lib/surveyVersion';
import { canonicalSurveyComparisonHash, restoreSurveyDraft, SURVEY_DRAFT_STORAGE_KEY, surveyAnswerProgress } from '@/lib/surveySession';

export const useSurvey = (questions: Question[], comparisonHash: string | null = null, freshStart = false) => {
  const contextHash = canonicalSurveyComparisonHash(comparisonHash);
  const ignoreInitialDraft = useRef(freshStart);
  const [surveyState, setSurveyState] = useState<SurveyState>({
    currentStep: 1,
    answers: {},
    startTime: new Date(),
    isComplete: false,
  });
  const [restoredContext, setRestoredContext] = useState<string | null | undefined>(undefined);
  const hasRestored = restoredContext === contextHash;

  useEffect(() => {
    try {
      // Starting over is an in-memory intent too: optional storage removal may fail.
      const skipSaved = ignoreInitialDraft.current;
      const saved = skipSaved ? null : readBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY);
      if (saved) {
        const restored = restoreSurveyDraft(JSON.parse(saved), questions);
        if (restored && restored.comparisonHash === contextHash) {
          setSurveyState(restored);
          return;
        }
        removeBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY);
      }
    } catch {
      removeBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY);
    } finally {
      setRestoredContext(contextHash);
    }
    setSurveyState({ currentStep: 1, answers: {}, startTime: new Date(), isComplete: false });
  }, [questions, contextHash]);

  useEffect(() => {
    if (!hasRestored) return;
    ignoreInitialDraft.current = false;
    if (surveyState.isComplete) {
      removeBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY);
      return;
    }
    writeBrowserStorage('session', SURVEY_DRAFT_STORAGE_KEY, JSON.stringify({ ...surveyState, questionVersion: SURVEY_VERSION, comparisonHash: contextHash }));
  }, [hasRestored, surveyState, contextHash]);

  // 현재 질문
  const currentQuestion = useMemo(() => {
    return questions[surveyState.currentStep - 1] || null;
  }, [questions, surveyState.currentStep]);

  // 진행률 계산
  const progress = useMemo(() => {
    return {
      current: surveyState.currentStep,
      total: questions.length,
      ...surveyAnswerProgress(questions, surveyState.answers),
    };
  }, [surveyState.currentStep, surveyState.answers, questions]);

  // 답변 저장
  const setAnswer = useCallback((questionId: string, value: number) => {
    setSurveyState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  }, []);

  // 다음 질문으로
  const nextQuestion = useCallback(() => {
    setSurveyState(prev => {
      const firstUnanswered = questions.findIndex(question => !isValidAnswer(question, prev.answers[question.id]));
      const nextStep = prev.currentStep + 1;
      const isComplete = nextStep > questions.length && firstUnanswered === -1;
      
      return {
        ...prev,
        currentStep: nextStep > questions.length && !isComplete ? firstUnanswered + 1 : nextStep,
        isComplete,
        personalityScores: isComplete ? calculateMUSICScores(questions, prev.answers) : undefined,
      };
    });
  }, [questions]);

  // 이전 질문으로
  const previousQuestion = useCallback(() => {
    setSurveyState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
      isComplete: false,
    }));
  }, []);

  // 특정 질문으로 이동
  const goToQuestion = useCallback((step: number) => {
    if (step >= 1 && step <= questions.length) {
      setSurveyState(prev => ({
        ...prev,
        currentStep: step,
        isComplete: false,
      }));
    }
  }, [questions.length]);

  // 현재 질문의 답변 여부
  const hasCurrentAnswer = useMemo(() => {
    return currentQuestion ? isValidAnswer(currentQuestion, surveyState.answers[currentQuestion.id]) : false;
  }, [currentQuestion, surveyState.answers]);

  // 다음 버튼 활성화 여부
  const canGoNext = useMemo(() => {
    return hasCurrentAnswer && surveyState.currentStep <= questions.length;
  }, [hasCurrentAnswer, surveyState.currentStep, questions.length]);

  // 이전 버튼 활성화 여부
  const canGoPrevious = useMemo(() => {
    return surveyState.currentStep > 1;
  }, [surveyState.currentStep]);

  // 설문 재시작
  const resetSurvey = useCallback(() => {
    setSurveyState({
      currentStep: 1,
      answers: {},
      startTime: new Date(),
      isComplete: false,
    });
  }, []);

  // 카테고리별 진행도
  const categoryProgress = useMemo(() => {
    const categories = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;
    
    return categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const answeredQuestions = categoryQuestions.filter(q => surveyState.answers[q.id] !== undefined);
      
      return {
        category,
        total: categoryQuestions.length,
        answered: answeredQuestions.length,
        percentage: (answeredQuestions.length / categoryQuestions.length) * 100,
      };
    });
  }, [questions, surveyState.answers]);

  return {
    surveyState,
    hasRestored,
    currentQuestion,
    progress,
    categoryProgress,
    setAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    resetSurvey,
    canGoNext,
    canGoPrevious,
    hasCurrentAnswer,
  };
};
