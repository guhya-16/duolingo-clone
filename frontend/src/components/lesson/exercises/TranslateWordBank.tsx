'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Volume2 } from 'lucide-react';
import { ExerciseClient } from '@/lib/types';

interface TranslateWordBankProps {
  exercise: ExerciseClient;
  disabled: boolean;
  value: string[];
  onChange: (value: string[]) => void;
}

export const TranslateWordBank: React.FC<TranslateWordBankProps> = ({
  exercise,
  disabled,
  onChange,
}) => {
  const { prompt = 'Translate this sentence', sentence_to_translate, word_bank = [] } =
    exercise.payload;

  // Shuffle word bank on client so display order is independent of server
  const shuffledBank = useMemo(() => {
    const arr = [...word_bank];
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  // Selected word indices from shuffledBank
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    setSelectedIndices([]);
    onChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const handleSelectWord = (index: number) => {
    if (disabled || selectedIndices.includes(index)) return;
    const next = [...selectedIndices, index];
    setSelectedIndices(next);
    onChange(next.map((i) => shuffledBank[i]));
  };

  const handleRemoveWord = (indexInSelected: number) => {
    if (disabled) return;
    const next = selectedIndices.filter((_, i) => i !== indexInSelected);
    setSelectedIndices(next);
    onChange(next.map((i) => shuffledBank[i]));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-duo-charcoal dark:text-white mb-4">
          {prompt}
        </h2>

        {/* Prompt sentence bubble */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#18272F] border-2 border-duo-border dark:border-gray-700 shadow-sm max-w-md">
          <button className="w-10 h-10 rounded-xl bg-duo-blue text-white flex items-center justify-center hover:brightness-105 active:scale-95 transition">
            <Volume2 className="w-5 h-5 fill-current" />
          </button>
          <span className="text-lg font-black text-duo-charcoal dark:text-white">
            {sentence_to_translate}
          </span>
        </div>
      </div>

      {/* Selected words answer line */}
      <div className="min-h-[70px] p-3 rounded-2xl border-b-2 border-duo-border dark:border-gray-700 flex flex-wrap gap-2 items-center bg-gray-50/50 dark:bg-[#18272F]/50">
        {selectedIndices.length === 0 ? (
          <span className="text-sm font-extrabold text-duo-grayDark dark:text-gray-400 px-2">
            Tap words from the bank below to construct your translation
          </span>
        ) : (
          selectedIndices.map((origIdx, slotIdx) => (
            <button
              key={`${origIdx}-${slotIdx}`}
              disabled={disabled}
              onClick={() => handleRemoveWord(slotIdx)}
              className="px-4 py-2.5 bg-white dark:bg-[#20333D] text-duo-charcoal dark:text-white border-2 border-duo-border dark:border-gray-600 rounded-2xl font-black text-base shadow-[0_3px_0_#E5E5E5] dark:shadow-[0_3px_0_#131F24] hover:bg-gray-50 dark:hover:bg-[#2A4350] active:translate-y-[2px] active:shadow-none transition animate-scale-up"
            >
              {shuffledBank[origIdx]}
            </button>
          ))
        )}
      </div>

      {/* Word bank pool */}
      <div className="flex flex-wrap gap-2.5 pt-4 justify-center">
        {shuffledBank.map((word: string, idx: number) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <button
              key={`${word}-${idx}`}
              disabled={disabled || isSelected}
              onClick={() => handleSelectWord(idx)}
              className={`px-4 py-2.5 rounded-2xl font-black text-base transition-all select-none ${
                isSelected
                  ? 'bg-duo-gray dark:bg-gray-700 text-transparent border-2 border-transparent shadow-none cursor-default'
                  : 'bg-white dark:bg-[#20333D] text-duo-charcoal dark:text-white border-2 border-duo-border dark:border-gray-600 shadow-[0_4px_0_#E5E5E5] dark:shadow-[0_4px_0_#131F24] hover:bg-gray-50 dark:hover:bg-[#2A4350] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              <span className={isSelected ? 'invisible' : ''}>{word}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TranslateWordBank;
