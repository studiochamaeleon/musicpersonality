'use client';

import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (surveyState.isComplete && onComplete) onComplete(surveyState.answers);
  }, [surveyState.isComplete, surveyState.answers, onComplete]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!currentQuestion) return;
      const option = Number(event.key);
      if (option >= 1 && option <= currentQuestion.scale) setAnswer(currentQuestion.id, option);
      if (event.key === 'ArrowLeft' && canGoPrevious) previousQuestion();
      if ((event.key === 'ArrowRight' || event.key === 'Enter') && canGoNext) nextQuestion();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canGoNext, canGoPrevious, currentQuestion, nextQuestion, previousQuestion, setAnswer]);

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
          <p className="text-sm font-extrabold tracking-[-0.03em]">MUSIC PERSONALITY</p>
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
          <QuestionCard question={currentQuestion} answer={surveyState.answers[currentQuestion.id]} onAnswer={(value) => setAnswer(currentQuestion.id, value)} />
        </div>

        <nav className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 border-t border-white/10 pt-5" aria-label={language === 'ko' ? '설문 이동' : 'Survey navigation'}>
          <button onClick={previousQuestion} disabled={!canGoPrevious} className="secondary-action !min-h-12 !w-auto inline-flex items-center gap-2 !px-5">
            <ArrowLeft size={17} /><span className="hidden sm:inline">{t('survey.previous')}</span>
          </button>
          <p className="hidden text-xs text-white/28 sm:block">{language === 'ko' ? '숫자 키 1–5로도 답할 수 있어요' : 'You can also use keys 1–5'}</p>
          <button onClick={nextQuestion} disabled={!canGoNext} className="primary-action !min-h-12 !w-auto inline-flex items-center gap-2 !px-5">
            {progress.current >= progress.total ? t('survey.complete') : t('survey.next')}<ArrowRight size={17} />
          </button>
        </nav>
      </div>
    </main>
  );
};

export default Survey;
