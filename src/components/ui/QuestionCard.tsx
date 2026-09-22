'use client';

import React, { useEffect, useRef } from 'react';
import { QuestionCardProps } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import LikertScale from './LikertScale';
import { questionsJa } from '@/locales/questionsJa';

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answer, onAnswer }) => {
  const { language } = useLanguage();
  const questionText = language === 'ko' ? question.text : language === 'ja' ? questionsJa[question.id] || question.textEn || question.text : question.textEn || question.text;
  const description = language === 'ko' ? question.description : language === 'ja' ? undefined : question.descriptionEn || question.description;
  const labels = language === 'ko' ? question.scaleLabels : language === 'ja' ? { min: 'まったく当てはまらない', max: 'とても当てはまる' } : question.scaleLabelsEn || question.scaleLabels;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [question.id]);

  return (
    <section className="mx-auto w-full max-w-2xl fade-in" key={question.id}>
      <p className="eyebrow mb-5">{language === 'ko' ? '당신의 느낌에 가장 가까운 답' : language === 'ja' ? 'いちばん近い感覚を選んでください' : 'Choose what feels closest'}</p>
      <h1 ref={headingRef} tabIndex={-1} className="max-w-[18ch] text-3xl font-bold leading-[1.28] tracking-[-0.035em] text-balance outline-none sm:text-5xl">{questionText}</h1>
      {description && <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">{description}</p>}
      <div className="mt-10 sm:mt-14">
        <LikertScale scale={question.scale} value={answer} onChange={onAnswer} labels={labels} />
      </div>
      <p className="mt-5 text-xs text-white/60">{language === 'ko' ? '선택하면 다음 질문으로 넘어갑니다. 이전 버튼으로 답을 바꿀 수 있어요.' : language === 'ja' ? '選ぶと次の質問へ進みます。「前へ」で回答を変更できます。' : 'Your answer advances to the next question. Use Previous to change it.'}</p>
    </section>
  );
};

export default QuestionCard;
