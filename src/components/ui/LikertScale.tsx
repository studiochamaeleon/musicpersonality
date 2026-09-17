'use client';

import React from 'react';
import { LikertScaleProps } from '@/types';

const LikertScale: React.FC<LikertScaleProps> = ({ scale, value, onChange, labels }) => {
  const options = Array.from({ length: scale }, (_, index) => index + 1);
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-label={`${labels.min} — ${labels.max}`}>
        {options.map(option => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option}: ${option === 1 ? labels.min : option === scale ? labels.max : ''}`.trim()}
              onClick={() => onChange(option)}
              className={`score-tabular flex aspect-square min-h-14 items-center justify-center rounded-2xl border text-lg font-bold transition-all duration-200 sm:min-h-20 sm:text-2xl ${
                selected
                  ? 'scale-[1.03] border-[#c8ff3d] bg-[#c8ff3d] text-[#050507] shadow-[0_12px_36px_rgba(200,255,61,.15)]'
                  : 'border-white/10 bg-white/[0.035] text-white/55 hover:border-white/30 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between gap-8 text-[11px] leading-4 text-white/38 sm:text-xs">
        <span className="max-w-[42%]">{labels.min}</span>
        <span className="max-w-[42%] text-right">{labels.max}</span>
      </div>
    </div>
  );
};

export default LikertScale;
