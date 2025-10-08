'use client';

import React from 'react';
import { LikertScaleProps } from '@/types';

const LikertScale: React.FC<LikertScaleProps> = ({
  scale,
  value,
  onChange,
  labels
}) => {
  const options = Array.from({ length: scale }, (_, i) => i + 1);

  return (
    <div className="likert-scale w-full max-w-md mx-auto">
      {/* 스케일 라벨 */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="text-left w-1/3">{labels.min}</span>
        <span className="text-right w-1/3">{labels.max}</span>
      </div>
      
      {/* 스케일 옵션들 */}
      <div className="flex justify-center items-center space-x-2 mb-4 md:space-x-3">
        {options.map((option) => (
          <div key={option} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onChange(option)}
              className={`
                w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-200
                flex items-center justify-center text-sm md:text-base font-medium
                touch-feedback select-none
                ${value === option
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                min-w-[44px] min-h-[44px]
              `}
              aria-label={`점수 ${option}`}
              style={{ WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              {option}
            </button>
            <span className="text-xs text-gray-500 mt-1 select-none">{option}</span>
          </div>
        ))}
      </div>
      
      {/* 현재 선택 표시 */}
      {value && (
        <div className="text-center text-sm text-blue-600">
          선택됨: {value}점
        </div>
      )}
    </div>
  );
};

export default LikertScale;