'use client';
import React, { useEffect, useState } from 'react';
import { ExerciseClient } from '@/lib/types';

interface MatchPairsProps {
  exercise: ExerciseClient;
  disabled: boolean;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

export const MatchPairs: React.FC<MatchPairsProps> = ({
  exercise,
  disabled,
  onChange,
}) => {
  const { pairs = [] } = exercise.payload;

  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // left keys matched
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

  useEffect(() => {
    const lefts = pairs.map((p: { left: string; right: string }) => p.left);
    const rights = pairs.map((p: { left: string; right: string }) => p.right);
    // Shuffle right items on client
    const shuffledRights = [...rights].sort(() => Math.random() - 0.5);

    setLeftItems(lefts);
    setRightItems(shuffledRights);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setWrongPair(null);
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const handleMatchCheck = (l: string, r: string) => {
    const pairObj = pairs.find((p: { left: string; right: string }) => p.left === l && p.right === r);
    if (pairObj) {
      // Correct Match!
      const nextMatched = [...matchedPairs, l];
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongPair(null);

      if (nextMatched.length === pairs.length) {
        onChange(true);
      }
    } else {
      // Incorrect Match
      setWrongPair({ left: l, right: r });
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
      }, 700);
    }
  };

  const onLeftClick = (item: string) => {
    if (disabled || matchedPairs.includes(item)) return;
    if (selectedRight) {
      handleMatchCheck(item, selectedRight);
    } else {
      setSelectedLeft(item);
    }
  };

  const onRightClick = (item: string) => {
    if (disabled || pairs.some((p: { left: string; right: string }) => p.right === item && matchedPairs.includes(p.left))) return;
    if (selectedLeft) {
      handleMatchCheck(selectedLeft, item);
    } else {
      setSelectedRight(item);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-black text-duo-charcoal dark:text-white">
        Tap the matching pairs
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.includes(item);
            const isSelected = selectedLeft === item;
            const isWrong = wrongPair?.left === item;

            return (
              <button
                key={item}
                disabled={disabled || isMatched}
                onClick={() => onLeftClick(item)}
                className={`p-4 rounded-2xl border-2 font-black text-base text-center transition-all select-none ${
                  isMatched
                    ? 'border-duo-green bg-green-50 dark:bg-green-950/40 text-duo-green opacity-40 cursor-default shadow-none'
                    : isWrong
                    ? 'border-duo-red bg-red-50 dark:bg-red-950/40 text-duo-red animate-shake'
                    : isSelected
                    ? 'border-duo-blue bg-blue-50 dark:bg-blue-950/40 text-duo-blue shadow-[0_4px_0_#1899D6]'
                    : 'border-duo-border dark:border-gray-700 bg-white dark:bg-[#18272F] text-duo-charcoal dark:text-white shadow-[0_4px_0_#E5E5E5] dark:shadow-[0_4px_0_#131F24] hover:bg-gray-50 dark:hover:bg-[#20333D] active:translate-y-[2px]'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatched = pairs.some(
              (p: { left: string; right: string }) => p.right === item && matchedPairs.includes(p.left)
            );
            const isSelected = selectedRight === item;
            const isWrong = wrongPair?.right === item;

            return (
              <button
                key={item}
                disabled={disabled || isMatched}
                onClick={() => onRightClick(item)}
                className={`p-4 rounded-2xl border-2 font-black text-base text-center transition-all select-none ${
                  isMatched
                    ? 'border-duo-green bg-green-50 dark:bg-green-950/40 text-duo-green opacity-40 cursor-default shadow-none'
                    : isWrong
                    ? 'border-duo-red bg-red-50 dark:bg-red-950/40 text-duo-red animate-shake'
                    : isSelected
                    ? 'border-duo-blue bg-blue-50 dark:bg-blue-950/40 text-duo-blue shadow-[0_4px_0_#1899D6]'
                    : 'border-duo-border dark:border-gray-700 bg-white dark:bg-[#18272F] text-duo-charcoal dark:text-white shadow-[0_4px_0_#E5E5E5] dark:shadow-[0_4px_0_#131F24] hover:bg-gray-50 dark:hover:bg-[#20333D] active:translate-y-[2px]'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchPairs;
