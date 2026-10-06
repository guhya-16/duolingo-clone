'use client';
import React, { useRef, useEffect } from 'react';
import { ExerciseClient } from '@/lib/types';

interface TypeAnswerProps {
  exercise: ExerciseClient;
  disabled: boolean;
  value: any;
  onChange: (value: any) => void;
  onSubmit?: () => void;
}

export const TypeAnswer: React.FC<TypeAnswerProps> = ({
  exercise,
  disabled,
  value,
  onChange,
  onSubmit,
}) => {
  const { prompt } = exercise.payload;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [exercise.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value && !disabled && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-duo-charcoal">
        {prompt}
      </h2>

      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={value || ''}
          placeholder="Type in Spanish..."
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-5 rounded-2xl border-2 border-duo-border bg-white text-xl font-bold text-duo-charcoal placeholder:text-duo-grayDark focus:border-duo-blue focus:bg-blue-50/20 outline-none transition shadow-sm"
        />
      </div>
    </div>
  );
};

export default TypeAnswer;
