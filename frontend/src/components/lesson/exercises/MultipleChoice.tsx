'use client';
import React from 'react';
import { ExerciseClient } from '@/lib/types';

interface MultipleChoiceProps {
  exercise: ExerciseClient;
  disabled: boolean;
  value: any;
  onChange: (value: any) => void;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  exercise,
  disabled,
  value,
  onChange,
}) => {
  const { prompt, options = [] } = exercise.payload;

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-duo-charcoal leading-snug">
        {prompt}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt: string, idx: number) => {
          const isSelected = value === opt || value === idx;
          return (
            <button
              key={`${opt}-${idx}`}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={`p-5 rounded-2xl border-2 text-left font-black text-lg transition-all flex items-center justify-between select-none ${
                isSelected
                  ? 'border-duo-blue bg-blue-50 text-duo-blue shadow-[0_4px_0_#1899D6] translate-y-[-2px]'
                  : 'border-duo-border bg-white text-duo-charcoal shadow-[0_4px_0_#E5E5E5] hover:bg-gray-50 active:translate-y-[2px] active:shadow-none'
              } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              <span>{opt}</span>
              <span className="w-7 h-7 rounded-xl border-2 border-current flex items-center justify-center text-xs font-black opacity-60">
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoice;
