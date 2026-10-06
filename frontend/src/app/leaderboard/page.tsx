'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Zap } from 'lucide-react';

import { api } from '@/lib/api';
import { LeaderboardUser } from '@/lib/types';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import DebugPanel from '@/components/DebugPanel';
import Button from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
      setError('Unable to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav />

        <main className="max-w-3xl mx-auto w-full p-6 md:p-10 flex flex-col gap-8">
          {/* League Header Banner */}
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                🛡️
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Weekly Competition
                </span>
                <h1 className="text-2xl font-black">Bronze League</h1>
                <p className="text-xs font-bold text-amber-100 mt-0.5">
                  Top 10 learners advance to Silver League!
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-black uppercase text-amber-200 block">Time Left</span>
              <span className="font-black text-lg">3 Days</span>
            </div>
          </div>

          {/* Ranked List Table */}
          <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col divide-y-2 divide-duo-border dark:divide-gray-700">
            {loading ? (
              /* Loading Skeletons */
              <div className="flex flex-col divide-y-2 divide-duo-border dark:divide-gray-700 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 px-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center text-center py-16 px-4 gap-5">
                <Mascot mood="sad" size={120} />
                <h3 className="text-2xl font-black text-duo-charcoal dark:text-white">
                  Leaderboard Unavailable
                </h3>
                <p className="text-sm font-bold text-duo-muted dark:text-gray-400 max-w-md">
                  {error}
                </p>
                <Button variant="primary" size="md" onClick={loadLeaderboard}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span>Retry</span>
                </Button>
              </div>
            ) : (
              leaderboard.map((user) => {
                const isTop1 = user.rank === 1;
                const isTop2 = user.rank === 2;
                const isTop3 = user.rank === 3;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 sm:px-6 transition-all ${
                      user.is_current_user
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-8 border-l-duo-blue font-black'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Position */}
                      <span className="w-8 text-center font-black text-base text-duo-charcoal dark:text-white flex justify-center">
                        {isTop1 ? (
                          <span className="text-2xl">🥇</span>
                        ) : isTop2 ? (
                          <span className="text-2xl">🥈</span>
                        ) : isTop3 ? (
                          <span className="text-2xl">🥉</span>
                        ) : (
                          user.rank
                        )}
                      </span>

                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm ${
                          user.is_current_user
                            ? 'bg-duo-blue border-2 border-duo-blueDark'
                            : isTop1
                            ? 'bg-duo-gold border-2 border-duo-goldDark text-yellow-950'
                            : 'bg-duo-green border-2 border-duo-greenDark'
                        }`}
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-duo-charcoal dark:text-white">
                            {user.username}
                          </h3>
                          {user.is_current_user && (
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-duo-blue text-white">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-duo-muted dark:text-gray-400">
                          🔥 {user.streak} day streak
                        </span>
                      </div>
                    </div>

                    {/* XP Score */}
                    <div className="flex items-center gap-1.5 font-black text-sm text-duo-charcoal dark:text-white">
                      <Zap className="w-4 h-4 text-duo-blue fill-current" />
                      <span>{user.total_xp} XP</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      <DebugPanel />
    </div>
  );
}
