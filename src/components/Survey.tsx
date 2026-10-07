'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Question } from '@/types';
import { useSurvey } from '@/hooks/useSurvey';
import { useTranslation } from '@/hooks/useTranslation';
import QuestionCard from './ui/QuestionCard';
import ProgressIndicator from './ui/ProgressIndicator';
import { surveyShortcutAnswer } from '@/lib/surveySession';

interface SurveyProps {
  questions: Question[];
  onComplete?: (answers: Record<string, number>) => void;
  onGoHome?: () => void;
  comparisonHash?: string | null;
  freshStart?: boolean;
}

const Survey: React.FC<SurveyProps> = ({ questions, onComplete, onGoHome, comparisonHash = null, freshStart = false }) => {
  const { t, language } = useTranslation();
  const { surveyState, hasRestored, currentQuestion, progress, setAnswer, nextQuestion, previousQuestion, canGoNext, canGoPrevious } = useSurvey(questions, comparisonHash, freshStart);
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
      if (!hasRestored || !currentQuestion) return;
      const fromEditable = event.target instanceof Element && Boolean(event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'));
      const option = surveyShortcutAnswer(event, currentQuestion.scale, fromEditable);
      if (option === null) return;
      event.preventDefault();
      answerAndAdvance(currentQuestion.id, option);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answerAndAdvance, currentQuestion, hasRestored]);

  if (!hasRestored) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-sm text-white/55">{t('common.loading.preparingSurvey')}</p></div>;
  }

  if (surveyState.isComplete) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-sm text-white/55">{t('survey.analyzing')}</p></div>;
  }

  if (!currentQuestion) {
    return <div className="app-canvas flex min-h-screen items-center justify-center"><p className="text-sm text-[#ff6161]">{t('survey.errorLoadingQuestion')}</p></div>;
  }

  return (
    <main className="app-canvas flex min-h-[100svh] flex-col text-white">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
        <div>
          <p className="text-sm font-extrabold tracking-[-0.03em]">MUTI</p>
          <p className="mt-0.5 text-[10px] tracking-[0.16em] text-white/30">LISTEN TO YOUR TASTE</p>
        </div>
        {onGoHome && (
          <button onClick={onGoHome} aria-label={t('common.buttons.backToHome')} className="ui-icon-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition-colors hover:bg-white/10 hover:text-white">
            <X size={19} />
          </button>
        )}
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8">
        <ProgressIndicator currentStep={progress.current} totalSteps={progress.total} answeredCount={progress.answeredCount} />
        <div className="flex min-w-0 flex-1 items-center py-10 sm:py-14">
          <QuestionCard
            question={currentQuestion}
            answer={surveyState.answers[currentQuestion.id]}
            onAnswer={(value) => answerAndAdvance(currentQuestion.id, value)}
            onAnswerNavigation={(value) => { cancelAdvance(); setAnswer(currentQuestion.id, value); }}
          />
        </div>

        <nav className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 border-t border-white/10 pt-5 sm:pt-6" aria-label={language === 'ko' ? '설문 이동' : language === 'ja' ? '質問の移動' : 'Survey navigation'}>
          <button onClick={() => { cancelAdvance(); previousQuestion(); }} disabled={!canGoPrevious} aria-label={t('survey.previous')} className="secondary-action !min-h-12 !w-auto inline-flex shrink-0 items-center gap-2 !px-5">
            <ArrowLeft size={17} aria-hidden="true" /><span>{t('survey.previous')}</span>
          </button>
          <p className="hidden min-w-0 text-center text-xs leading-5 text-white/60 sm:block">{language === 'ko' ? '이전 버튼으로 답을 바꿀 수 있어요.' : language === 'ja' ? '「前へ」で回答を変更できます。' : 'Use Previous to change an answer.'}</p>
          <button onClick={() => { cancelAdvance(); nextQuestion(); }} disabled={!canGoNext} className="primary-action !min-h-12 !w-auto inline-flex shrink-0 items-center gap-2 !px-5">
            {progress.current >= progress.total ? t('survey.complete') : t('survey.next')}<ArrowRight size={17} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </main>
  );
};

export default Survey;
