'use client';

import React from 'react';
import { Question } from '@/types';
import { useSurvey } from '@/hooks/useSurvey';
import { useTranslation } from '@/hooks/useTranslation';
import QuestionCard from './ui/QuestionCard';
import ProgressIndicator from './ui/ProgressIndicator';

interface SurveyProps {
  questions: Question[];
  onComplete?: (answers: Record<string, number>) => void;
}

const Survey: React.FC<SurveyProps> = ({ questions, onComplete }) => {
  const { t } = useTranslation();
  const {
    surveyState,
    currentQuestion,
    progress,
    setAnswer,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    hasCurrentAnswer,
  } = useSurvey(questions);

  // 설문 완료 처리
  React.useEffect(() => {
    if (surveyState.isComplete && onComplete) {
      onComplete(surveyState.answers);
    }
  }, [surveyState.isComplete, surveyState.answers, onComplete]);

  if (surveyState.isComplete) {
    return (
      <div className="survey-complete text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('survey.completed')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('survey.analyzing')}
          </p>
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="survey-error text-center py-12">
        <p className="text-red-600">{t('survey.errorLoadingQuestion')}</p>
      </div>
    );
  }

  return (
    <div className="survey min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 진행도 표시 */}
        <ProgressIndicator
          currentStep={progress.current}
          totalSteps={progress.total}
        />

        {/* 현재 질문 */}
        <div className="mb-8">
          <QuestionCard
            question={currentQuestion}
            answer={surveyState.answers[currentQuestion.id]}
            onAnswer={(value) => setAnswer(currentQuestion.id, value)}
          />
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center max-w-2xl mx-auto px-4">
          <button
            onClick={previousQuestion}
            disabled={!canGoPrevious}
            className={`
              px-4 md:px-6 py-3 rounded-lg font-medium transition-all touch-feedback min-h-[44px]
              ${canGoPrevious
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {t('survey.previous')}
          </button>

          <div className="flex space-x-2 md:space-x-4">
            {/* 답변 상태 표시 */}
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
              <div className={`w-3 h-3 rounded-full ${hasCurrentAnswer ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="hidden sm:block">{hasCurrentAnswer ? t('survey.answerComplete') : t('survey.answerNeeded')}</span>
            </div>
          </div>

          <button
            onClick={nextQuestion}
            disabled={!canGoNext}
            className={`
              px-4 md:px-6 py-3 rounded-lg font-medium transition-all touch-feedback min-h-[44px]
              ${canGoNext
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {progress.current >= progress.total ? t('survey.complete') : t('survey.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Survey;