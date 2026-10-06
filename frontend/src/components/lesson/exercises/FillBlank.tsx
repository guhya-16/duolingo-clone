'use client';
import React from 'react';
import { ExerciseClient } from '@/lib/types';

interface FillBlankProps {
  exercise: ExerciseClient;
  disabled: boolean;
  value: any;
  onChange: (value: any) => void;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  exercise,
  disabled,
  value,
  onChange,
}) => {
  const { sentence_with_blank = '', options = [] } = exercise.payload;
  const parts = sentence_with_blank.split('____');

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl mx-auto">
      <h2 className="text-xl md:text-2xl font-black text-duo-charcoal">
        Fill in the blank
      </h2>

      {/* Sentence with interactive Blank slot */}
      <div className="p-6 rounded-3xl bg-white border-2 border-duo-border shadow-sm text-xl md:text-2xl font-black text-duo-charcoal flex flex-wrap items-center gap-2">
        <span>{parts[0]}</span>
        <span
          className={`inline-flex items-center justify-center min-w-[100px] px-4 py-1.5 rounded-2xl border-2 transition-all ${
            value
              ? 'border-duo-blue bg-blue-50 text-duo-blue shadow-[0_2px_0_#1899D6]'
              : 'border-dashed border-duo-grayDark text-duo-grayDark bg-gray-50'
          }`}
        >
          {value || '______'}
        </span>
        <span>{parts[1]}</span>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 justify-center">
        {options.map((opt: string) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={`px-6 py-3 rounded-2xl border-2 font-black text-lg transition-all select-none ${
                isSelected
                  ? 'border-duo-blue bg-blue-50 text-duo-blue shadow-[0_4px_0_#1899D6] translate-y-[-2px]'
                  : 'border-duo-border bg-white text-duo-charcoal shadow-[0_4px_0_#E5E5E5] hover:bg-gray-50 active:translate-y-[2px] active:shadow-none'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FillBlank;
