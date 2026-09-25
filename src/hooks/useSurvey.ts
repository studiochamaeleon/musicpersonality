'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { SurveyState, Question } from '@/types';
import { calculateMUSICScores, isValidAnswer } from '@/lib/surveyScore';
import { readBrowserStorage, removeBrowserStorage, writeBrowserStorage } from '@/lib/browserStorage';

export const useSurvey = (questions: Question[]) => {
  const [surveyState, setSurveyState] = useState<SurveyState>({
    currentStep: 1,
    answers: {},
    startTime: new Date(),
    isComplete: false,
  });
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = readBrowserStorage('session', 'music-personality-survey');
      if (saved) {
        const parsed = JSON.parse(saved) as SurveyState;
        const validStep = Math.min(Math.max(parsed.currentStep || 1, 1), Math.max(questions.length, 1));
        const restoredAnswers = Object.fromEntries(questions
          .filter(question => isValidAnswer(question, parsed.answers?.[question.id]))
          .map(question => [question.id, parsed.answers[question.id]]));
        setSurveyState({ currentStep: validStep, answers: restoredAnswers, startTime: new Date(parsed.startTime), isComplete: false });
      }
    } catch {
      removeBrowserStorage('session', 'music-personality-survey');
    } finally {
      setHasRestored(true);
    }
  }, [questions]);

  useEffect(() => {
    if (!hasRestored) return;
    if (surveyState.isComplete) {
      removeBrowserStorage('session', 'music-personality-survey');
      return;
    }
    writeBrowserStorage('session', 'music-personality-survey', JSON.stringify(surveyState));
  }, [hasRestored, surveyState]);

  // 현재 질문
  const currentQuestion = useMemo(() => {
    return questions[surveyState.currentStep - 1] || null;
  }, [questions, surveyState.currentStep]);

  // 진행률 계산
  const progress = useMemo(() => {
    return {
      current: surveyState.currentStep,
      total: questions.length,
      percentage: (surveyState.currentStep / questions.length) * 100,
      answeredCount: Object.keys(surveyState.answers).length,
    };
  }, [surveyState.currentStep, surveyState.answers, questions.length]);

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
