'use client';
import React from 'react';

interface TopBarProps {
  streak: number;
  xp: number;
  hearts: number;
}

export const TopBar: React.FC<TopBarProps> = ({ streak, xp, hearts }) => {
  return (
    <header className="sticky top-0 bg-white border-b-2 border-duo-border px-8 py-3 flex justify-between items-center z-10">
      <div className="text-2xl font-black text-duo-green tracking-tight">duolingo</div>
      <div className="flex gap-6 items-center font-extrabold text-sm">
        <span className="flex items-center gap-1.5 text-duo-gold">
          🔥 {streak}
        </span>
        <span className="flex items-center gap-1.5 text-duo-blue">
          ⚡ {xp} XP
        </span>
        <span className="flex items-center gap-1.5 text-duo-red">
          ❤️ {hearts}
        </span>
      </div>
    </header>
  );
};