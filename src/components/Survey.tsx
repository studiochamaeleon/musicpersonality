'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Question } from '@/types';
import { useSurvey } from '@/hooks/useSurvey';
import { useTranslation } from '@/hooks/useTranslation';
import QuestionCard from './ui/QuestionCard';
import ProgressIndicator from './ui/ProgressIndicator';

interface SurveyProps {
  questions: Question[];
  onComplete?: (answers: Record<string, number>) => void;
  onGoHome?: () => void;
}

const Survey: React.FC<SurveyProps> = ({ questions, onComplete, onGoHome }) => {
  const { t, language } = useTranslation();
  const { surveyState, currentQuestion, progress, setAnswer, nextQuestion, previousQuestion, canGoNext, canGoPrevious } = useSurvey(questions);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionSent = useRef(false);

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  }, []);

  const answerAndAdvance = useCallback((questionId: string, value: number) => {
    cancelAdvance();
    setAnswer(questionId, value);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      nextQuestion();
    }, 550);
  }, [cancelAdvance, nextQuestion, setAnswer]);

  useEffect(() => cancelAdvance, [cancelAdvance, currentQuestion?.id]);

  useEffect(() => {
    if (surveyState.isComplete && onComplete && !completionSent.current) {
      completionSent.current = true;
      onComplete(surveyState.answers);
    }
  }, [surveyState.isComplete, surveyState.answers, onComplete]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!currentQuestion) return;
      if (event.target instanceof HTMLInputElement) return;
      const option = Number(event.key);
      if (option >= 1 && option <= currentQuestion.scale) answerAndAdvance(currentQuestion.id, option);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answerAndAdvance, currentQuestion]);

  if (surveyState.isComplete) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-sm text-white/55">{t('survey.analyzing')}</p></div>;
  }

  if (!currentQuestion) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-sm text-[#ff6161]">{t('survey.errorLoadingQuestion')}</p></div>;
  }

  return (
    <main className="app-canvas flex min-h-screen flex-col text-white">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
        <div>
          <p className="text-sm font-extrabold tracking-[-0.03em]">MUTI</p>
          <p className="mt-0.5 text-[10px] tracking-[0.16em] text-white/30">LISTEN TO YOUR TASTE</p>
        </div>
        {onGoHome && (
          <button onClick={onGoHome} aria-label={t('common.buttons.backToHome')} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition-colors hover:bg-white/10 hover:text-white">
            <X size={19} />
          </button>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 pb-8 sm:px-8">
        <ProgressIndicator currentStep={progress.current} totalSteps={progress.total} />
        <div className="flex flex-1 items-center py-8 sm:py-12">
          <QuestionCard question={currentQuestion} answer={surveyState.answers[currentQuestion.id]} onAnswer={(value) => answerAndAdvance(currentQuestion.id, value)} />
        </div>

        <nav className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 border-t border-white/10 pt-5" aria-label={language === 'ko' ? '설문 이동' : language === 'ja' ? '質問の移動' : 'Survey navigation'}>
          <button onClick={() => { cancelAdvance(); previousQuestion(); }} disabled={!canGoPrevious} aria-label={t('survey.previous')} className="secondary-action !min-h-12 !w-auto inline-flex items-center gap-2 !px-5">
            <ArrowLeft size={17} /><span className="hidden sm:inline">{t('survey.previous')}</span>
          </button>
          <p className="hidden text-xs text-white/60 sm:block">{language === 'ko' ? '답을 고르면 자동으로 넘어가요 · 숫자 키 1–5' : language === 'ja' ? '答えを選ぶと次へ進みます · 数字キー 1–5' : 'Choose an answer to advance · keys 1–5'}</p>
          <button onClick={() => { cancelAdvance(); nextQuestion(); }} disabled={!canGoNext} className="primary-action !min-h-12 !w-auto inline-flex items-center gap-2 !px-5">
            {progress.current >= progress.total ? t('survey.complete') : t('survey.next')}<ArrowRight size={17} />
          </button>
        </nav>
      </div>
    </main>
  );
};

export default Survey;
