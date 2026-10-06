'use client';
import React, { useState } from 'react';
import { Crown, Heart, Sparkles, Zap } from 'lucide-react';

import { useUserStore } from '@/stores/userStore';
import { toast } from '@/stores/toastStore';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import Button from '@/components/ui/Button';
import DebugPanel from '@/components/DebugPanel';

export default function ShopPage() {
  const { hearts, gems, refillHeartsAction } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleRefill = async () => {
    setLoading(true);
    const ok = await refillHeartsAction();
    setLoading(false);
    if (ok) {
      toast.success('❤️ Hearts successfully refilled to 5/5!');
    } else {
      toast.info('❌ Not enough gems to refill hearts.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav />

        <main className="max-w-3xl mx-auto w-full p-6 md:p-10 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-black text-duo-charcoal dark:text-white tracking-tight">Shop</h1>
            <p className="text-sm font-bold text-duo-muted dark:text-gray-400 mt-1">
              Use your hard-earned gems for power-ups and hearts!
            </p>
          </div>

          {/* Super Duolingo Promo */}
          <div className="rounded-3xl p-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                <Crown className="w-10 h-10 text-yellow-300 fill-current" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Super Duolingo</h2>
                <p className="text-xs font-bold text-indigo-100 mt-1 max-w-sm leading-relaxed">
                  Never run out of hearts, practice your mistakes, and accelerate your learning!
                </p>
              </div>
            </div>
            <Button variant="gold" size="md" className="shrink-0">
              Try for $0.00
            </Button>
          </div>

          {/* Power-ups list */}
          <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm p-6 flex flex-col gap-6">
            <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Power-Ups</h2>

            {/* Refill Hearts Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-duo-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-duo-red shrink-0">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-base text-duo-charcoal dark:text-white">Refill Hearts</h3>
                  <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                    Restore your hearts so you can keep practicing without stopping.
                  </p>
                </div>
              </div>

              <Button
                variant="blue"
                size="sm"
                disabled={hearts >= 5 || gems < 100 || loading}
                onClick={handleRefill}
                className="shrink-0"
              >
                {hearts >= 5 ? 'Full' : '100 💎'}
              </Button>
            </div>

            {/* Streak Freeze Item (Mock) */}
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-duo-border dark:border-gray-700 opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-duo-blue shrink-0">
                  <Sparkles className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-base text-duo-charcoal dark:text-white">Streak Freeze</h3>
                  <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                    Protects your streak if you miss a day of practice.
                  </p>
                </div>
              </div>

              <Button variant="secondary" size="sm" disabled className="shrink-0">
                Equipped
              </Button>
            </div>

            {/* Double XP Boost Item (Mock) */}
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-duo-border dark:border-gray-700 opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center text-duo-gold shrink-0">
                  <Zap className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-base text-duo-charcoal dark:text-white">Double XP (15 min)</h3>
                  <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                    Earn 2x XP for every lesson completed in the next 15 minutes.
                  </p>
                </div>
              </div>

              <Button variant="gold" size="sm" disabled className="shrink-0">
                Coming Soon
              </Button>
            </div>
          </div>
        </main>
      </div>

      <DebugPanel />
    </div>
  );
}
