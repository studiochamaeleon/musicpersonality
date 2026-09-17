'use client';

import React from 'react';
import { QuestionCardProps } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import LikertScale from './LikertScale';

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answer, onAnswer }) => {
  const { language } = useLanguage();
  const questionText = language === 'en' ? question.textEn || question.text : question.text;
  const description = language === 'en' ? question.descriptionEn || question.description : question.description;
  const labels = language === 'en' ? question.scaleLabelsEn || question.scaleLabels : question.scaleLabels;

  return (
    <section className="mx-auto w-full max-w-2xl fade-in" key={question.id}>
      <p className="eyebrow mb-5">{language === 'ko' ? '당신의 느낌에 가장 가까운 답' : 'Choose what feels closest'}</p>
      <h1 className="max-w-[18ch] text-3xl font-bold leading-[1.28] tracking-[-0.035em] text-balance sm:text-5xl">{questionText}</h1>
      {description && <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">{description}</p>}
      <div className="mt-10 sm:mt-14">
        <LikertScale scale={question.scale} value={answer} onChange={onAnswer} labels={labels} />
      </div>
    </section>
  );
};

export default QuestionCard;
