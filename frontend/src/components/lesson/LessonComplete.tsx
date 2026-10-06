'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy, Zap } from 'lucide-react';

import { LessonCompleteResponse } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import { useUserStore } from '@/stores/userStore';
import { toast } from '@/stores/toastStore';

interface LessonCompleteProps {
  summary: LessonCompleteResponse;
  mistakes: number;
  totalExercises: number;
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  summary,
  mistakes,
  totalExercises,
}) => {
  const router = useRouter();
  const { refresh } = useUserStore();

  useEffect(() => {
    // Refresh user store stats
    refresh();

    // Fire toasts for game milestones
    if (summary.streak > 0) {
      toast.streak(`🔥 ${summary.streak} Day Streak! Keep the flame burning!`);
    }

    if (summary.new_achievements && summary.new_achievements.length > 0) {
      summary.new_achievements.forEach((ach) => {
        toast.achievement(`🏆 Achievement Unlocked: ${ach}!`);
      });
    }

    if (summary.daily_xp >= summary.daily_goal) {
      toast.success(`🎯 Daily Goal Reached! (${summary.daily_xp}/${summary.daily_goal} XP)`);
    }

    // Fire celebratory confetti cannons!
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#58CC02', '#FFC800', '#1CB0F6'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#58CC02', '#FFC800', '#FF4B4B'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [refresh, summary]);

  const accuracy = Math.max(
    0,
    Math.round(((totalExercises) / (totalExercises + mistakes)) * 100)
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#131F24] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
        {/* Mascot Celebrating */}
        <div className="flex flex-col items-center">
          <Mascot mood="celebrating" size={130} className="animate-bounce" />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-black text-duo-charcoal dark:text-white">
            Lesson Complete!
          </h2>
          <p className="text-sm font-extrabold text-duo-muted dark:text-gray-400 mt-2">
            You&apos;re making incredible progress in Spanish!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* XP Card */}
          <div className="p-5 rounded-3xl border-2 border-duo-gold bg-yellow-50/50 dark:bg-yellow-950/20 flex flex-col items-center shadow-[0_4px_0_#E5A500]">
            <span className="text-xs font-black uppercase text-duo-goldDark flex items-center gap-1">
              <Zap className="w-4 h-4 fill-current" />
              XP Earned
            </span>
            <span className="text-3xl font-black text-yellow-950 dark:text-yellow-200 mt-1">
              +{summary.xp_earned}
            </span>
          </div>

          {/* Accuracy Card */}
          <div className="p-5 rounded-3xl border-2 border-duo-green bg-green-50/50 dark:bg-green-950/20 flex flex-col items-center shadow-[0_4px_0_#46A302]">
            <span className="text-xs font-black uppercase text-duo-greenDark flex items-center gap-1">
              <Sparkles className="w-4 h-4 fill-current" />
              Accuracy
            </span>
            <span className="text-3xl font-black text-green-950 dark:text-green-200 mt-1">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Streak & Daily Goal Banner */}
        <div className="w-full p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-7 h-7 text-orange-500 fill-current" />
            <div className="text-left">
              <span className="font-black text-sm text-orange-950 dark:text-orange-200">
                {summary.streak} Day Streak!
              </span>
              <p className="text-xs text-orange-800 dark:text-orange-400 font-bold">
                Practiced today
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-orange-600 dark:text-orange-300 bg-white dark:bg-orange-900 px-2.5 py-1 rounded-xl shadow-sm">
            Active
          </span>
        </div>

        {/* Unlocked Achievements */}
        {summary.new_achievements && summary.new_achievements.length > 0 && (
          <div className="w-full p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 text-left">
            <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4" />
              New Achievement Unlocked!
            </span>
            {summary.new_achievements.map((ach) => (
              <p key={ach} className="font-black text-sm text-purple-950 dark:text-purple-200">
                ⭐ {ach}
              </p>
            ))}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push('/learn')}
          className="mt-4"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default LessonComplete;
