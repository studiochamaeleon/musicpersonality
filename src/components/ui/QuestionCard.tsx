'use client';

import React from 'react';
import { QuestionCardProps } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import LikertScale from './LikertScale';

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  const { language } = useLanguage();
  
  // Use bilingual text based on language
  const questionText = language === 'en' ? question.textEn || question.text : question.text;
  const scaleLabels = language === 'en' ? question.scaleLabelsEn || question.scaleLabels : question.scaleLabels;
  
  return (
    <div className="question-card bg-white rounded-lg shadow-md p-4 md:p-6 max-w-2xl mx-auto touch-feedback">
      {/* 질문 카테고리 태그 */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full uppercase tracking-wide">
          {question.category}
        </span>
      </div>

      {/* 질문 텍스트 */}
      <div className="mb-6">
        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2 leading-relaxed">
          {questionText}
        </h3>
        
        {question.description && (
          <p className="text-sm text-gray-600">
            {question.description}
          </p>
        )}
      </div>

      {/* 리커트 척도 */}
      <div className="mb-4">
        <LikertScale
          scale={question.scale}
          value={answer}
          onChange={onAnswer}
          labels={scaleLabels}
        />
      </div>
    </div>
  );
};

export default QuestionCard;