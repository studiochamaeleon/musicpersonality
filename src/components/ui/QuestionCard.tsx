'use client';

import React, { useEffect, useId, useRef } from 'react';
import { QuestionCardProps } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import LikertScale from './LikertScale';
import { questionsJa } from '@/locales/questionsJa';

type AccessibleQuestionCardProps = QuestionCardProps & { onAnswerNavigation?: (value: number) => void };

const QuestionCard: React.FC<AccessibleQuestionCardProps> = ({ question, answer, onAnswer, onAnswerNavigation }) => {
  const { language } = useLanguage();
  const questionText = language === 'ko' ? question.text : language === 'ja' ? questionsJa[question.id] || question.textEn || question.text : question.textEn || question.text;
  const description = language === 'ko' ? question.description : language === 'ja' ? undefined : question.descriptionEn || question.description;
  const labels = language === 'ko' ? question.scaleLabels : language === 'ja' ? { min: 'まったく当てはまらない', max: 'とても当てはまる' } : question.scaleLabelsEn || question.scaleLabels;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const instructionId = useId();
  const descriptionId = useId();

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [question.id]);

  return (
    <section className="mx-auto w-full min-w-0 max-w-2xl fade-in" key={question.id}>
      <p className="eyebrow mb-5 flex items-start gap-3 leading-5 sm:mb-7"><span aria-hidden="true" className="mt-2 h-px w-6 shrink-0 bg-[#c8ff3d]/60" />{language === 'ko' ? '당신의 느낌에 가장 가까운 답' : language === 'ja' ? 'いちばん近い感覚を選んでください' : 'Choose what feels closest'}</p>
      <h1 id={headingId} ref={headingRef} tabIndex={-1} className="max-w-[22ch] text-[clamp(1.75rem,5.4vw,3rem)] font-bold leading-[1.3] tracking-[-0.035em] text-balance outline-none focus-visible:!outline-none sm:text-5xl">{questionText}</h1>
      {description && <p id={descriptionId} className="mt-4 max-w-xl text-sm leading-6 text-white/70">{description}</p>}
      <div className="mt-9 sm:mt-12">
        <LikertScale scale={question.scale} value={answer} onChange={onAnswer} onNavigate={onAnswerNavigation} labels={labels} labelledBy={headingId} describedBy={[description && descriptionId, instructionId].filter(Boolean).join(' ')} />
      </div>
      <p id={instructionId} className="mt-6 max-w-xl text-xs leading-5 text-white/60">{language === 'ko' ? '클릭하거나 숫자 키 1–5로 답하면 다음 질문으로 넘어갑니다. 방향키로 고른 뒤 Enter 또는 다음 버튼으로 확정할 수도 있어요. 이전 버튼으로 답을 바꿀 수 있어요.' : language === 'ja' ? 'クリックか数字キー1–5で答えると次の質問へ進みます。矢印キーで選び、Enterまたは「次へ」で確定することもできます。「前へ」で回答を変更できます。' : 'Click an answer or press 1–5 to advance. You can also choose with arrow keys, then confirm with Enter or Next. Use Previous to change an answer.'}</p>
    </section>
  );
};

export default QuestionCard;
