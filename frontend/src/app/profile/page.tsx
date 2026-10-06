'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Award, Calendar, Flame, Lock, RotateCcw, Shield, Trophy, Zap } from 'lucide-react';

import { api } from '@/lib/api';
import { Achievement, User } from '@/lib/types';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DebugPanel from '@/components/DebugPanel';
import { Mascot } from '@/components/ui/Mascot';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await api.getMe();
      setUser(userData);
      const achData = await api.getAchievements();
      setAchievements(achData);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError('Unable to load profile data from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav />

        <main className="max-w-4xl mx-auto w-full p-6 md:p-10 flex flex-col gap-8">
          {loading ? (
            /* Loading Skeletons */
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
            </div>
          ) : error || !user ? (
            /* Error State with Retry Button */
            <div className="flex flex-col items-center text-center py-20 px-4 gap-5">
              <Mascot mood="sad" size={130} />
              <h3 className="text-2xl font-black text-duo-charcoal dark:text-white">
                Unable to Load Profile
              </h3>
              <p className="text-sm font-bold text-duo-muted dark:text-gray-400 max-w-md">
                {error || 'An error occurred while loading your profile.'}
              </p>
              <Button variant="primary" size="md" onClick={loadProfile}>
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Retry</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Profile Header Card */}
              <div className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-duo-green text-white font-black text-4xl flex items-center justify-center border-4 border-duo-greenDark shadow-md">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl md:text-3xl font-black text-duo-charcoal dark:text-white">
                    {user.username}
                  </h1>
                  <span className="text-sm font-extrabold text-duo-muted dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="flex flex-col items-center text-center p-4">
                  <Flame className="w-7 h-7 text-duo-gold fill-current" />
                  <span className="text-2xl font-black text-duo-charcoal dark:text-white mt-2">{user.streak}</span>
                  <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Day Streak</span>
                </Card>

                <Card className="flex flex-col items-center text-center p-4">
                  <Zap className="w-7 h-7 text-duo-blue fill-current" />
                  <span className="text-2xl font-black text-duo-charcoal dark:text-white mt-2">{user.total_xp}</span>
                  <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Total XP</span>
                </Card>

                <Card className="flex flex-col items-center text-center p-4">
                  <Shield className="w-7 h-7 text-amber-700 fill-current" />
                  <span className="text-2xl font-black text-duo-charcoal dark:text-white mt-2">Bronze</span>
                  <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Current League</span>
                </Card>

                <Card className="flex flex-col items-center text-center p-4">
                  <Award className="w-7 h-7 text-duo-purple fill-current" />
                  <span className="text-2xl font-black text-duo-charcoal dark:text-white mt-2">
                    {unlockedCount} / {achievements.length}
                  </span>
                  <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">Badges</span>
                </Card>
              </div>

              {/* Achievements Showcase */}
              <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-duo-gold fill-current" />
                    <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Achievements</h2>
                  </div>
                  <span className="text-xs font-black uppercase text-duo-muted dark:text-gray-400">
                    {unlockedCount} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                        ach.unlocked
                          ? 'border-duo-gold bg-yellow-50/40 dark:bg-yellow-950/20 shadow-sm'
                          : 'border-duo-gray dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 opacity-60 grayscale'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          ach.unlocked
                            ? 'bg-duo-gold text-yellow-950 shadow-[0_3px_0_#E5A500]'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {ach.unlocked ? '⭐' : <Lock className="w-6 h-6 text-gray-400" />}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-black text-base text-duo-charcoal dark:text-white">{ach.title}</h4>
                        <p className="text-xs text-duo-muted dark:text-gray-400 font-bold mt-0.5">{ach.description}</p>
                        {ach.unlocked && (
                          <span className="text-[11px] font-black uppercase text-duo-greenDark dark:text-green-400 mt-1 block">
                            Unlocked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <DebugPanel />
    </div>
  );
}
