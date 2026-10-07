'use client';

import React, { useRef } from 'react';
import { LikertScaleProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

type AccessibleLikertScaleProps = LikertScaleProps & {
  onNavigate?: (value: number) => void;
  labelledBy?: string;
  describedBy?: string;
};

const LikertScale: React.FC<AccessibleLikertScaleProps> = ({ scale, value, onChange, onNavigate, labels, labelledBy, describedBy }) => {
  const { t } = useTranslation();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const options = Array.from({ length: scale }, (_, index) => index + 1);
  const optionLabels = [labels.min, t('survey.scales.disagree'), t('survey.scales.neutral'), t('survey.scales.agree'), labels.max];

  const handleArrow = (event: React.KeyboardEvent<HTMLButtonElement>, option: number) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const nextOption = ((option - 1 + direction + scale) % scale) + 1;
    // Radio navigation selects without submitting the question while the user explores.
    (onNavigate ?? onChange)(nextOption);
    optionRefs.current[nextOption - 1]?.focus({ preventScroll: true });
  };
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-label={labelledBy ? undefined : `${labels.min} — ${labels.max}`}>
        {options.map(option => {
          const selected = value === option;
          return (
            <button
              key={option}
              ref={element => { optionRefs.current[option - 1] = element; }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option}: ${optionLabels[option - 1]}`}
              tabIndex={selected || (value === undefined && option === 1) ? 0 : -1}
              onClick={() => onChange(option)}
              onKeyDown={event => handleArrow(event, option)}
              className={`score-tabular relative flex min-h-16 w-full min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border px-2 py-4 text-xl font-bold transition-[transform,background-color,border-color,color,box-shadow] duration-200 motion-reduce:transition-none sm:min-h-32 sm:px-3 sm:py-5 sm:text-3xl ${
                selected
                  ? 'border-[#c8ff3d] bg-[#c8ff3d] text-[#050507] shadow-[0_10px_30px_rgba(200,255,61,.18)]'
                  : 'border-white/15 bg-white/[0.035] text-white/70 hover:border-white/35 hover:bg-white/[0.08] hover:text-white motion-safe:hover:-translate-y-1'
              }`}
            >
              <span className="leading-none">{option}</span>
              <span aria-hidden="true" className="hidden max-w-full text-balance text-[11px] font-medium leading-[1.55] opacity-80 sm:block">{optionLabels[option - 1]}</span>
              {selected && <span aria-hidden="true" className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-current sm:right-3 sm:top-3" />}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 text-[11px] leading-[1.55] text-white/70 sm:hidden">
        <span className="min-w-0">{labels.min}</span>
        <span className="max-w-[7rem] text-center text-white/50">{optionLabels[2]}</span>
        <span className="min-w-0 text-right">{labels.max}</span>
      </div>
    </div>
  );
};

export default LikertScale;
