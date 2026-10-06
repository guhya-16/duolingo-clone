'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Check,
  Crown,
  Lock,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

import { api } from '@/lib/api';
import { CoursePath, LeaderboardUser, SkillPath } from '@/lib/types';
import { useUserStore } from '@/stores/userStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import DebugPanel from '@/components/DebugPanel';
import { Mascot } from '@/components/ui/Mascot';

export default function LearnPage() {
  const router = useRouter();
  const { xp, dailyGoal, refresh } = useUserStore();
  const [coursePath, setCoursePath] = useState<CoursePath | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refresh();
      const pathData = await api.getCoursePath();
      setCoursePath(pathData);
      const leaders = await api.getLeaderboard();
      setLeaderboard(leaders.slice(0, 3));
    } catch (err: any) {
      console.error('Failed to load path data:', err);
      setError('Unable to connect to the backend server. Please check your connection or restart the API.');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sine-wave offset for authentic zig-zag Duolingo path
  const getHorizontalOffset = (index: number) => {
    const offsets = [0, 45, 60, 45, 0, -45, -60, -45];
    return offsets[index % offsets.length];
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#F7F7F7] dark:bg-[#131F24] flex transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav />

        <div className="flex-1 flex max-w-6xl mx-auto w-full px-4 py-6 md:py-8 gap-8 justify-center">
          {/* Main Learning Roadmap Column */}
          <main className="flex-1 max-w-2xl flex flex-col items-center">
            {loading ? (
              /* Loading Skeletons */
              <div className="w-full flex flex-col gap-8 animate-pulse">
                <div className="w-full h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="flex flex-col items-center gap-10 py-6">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full translate-x-8" />
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full translate-x-12" />
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full translate-x-8" />
                </div>
              </div>
            ) : error ? (
              /* Error state with Mascot and Retry button */
              <div className="flex flex-col items-center text-center py-16 px-4 gap-5">
                <Mascot mood="sad" size={130} />
                <h3 className="text-2xl font-black text-duo-charcoal dark:text-white">
                  Oops! Connection Issue
                </h3>
                <p className="text-sm font-bold text-duo-muted dark:text-gray-400 max-w-md">
                  {error}
                </p>
                <Button variant="primary" size="md" onClick={loadData}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span>Retry</span>
                </Button>
              </div>
            ) : coursePath ? (
              <div className="w-full flex flex-col gap-12">
                {coursePath.units.map((unit, unitIdx) => (
                  <section key={unit.id} className="flex flex-col items-center w-full">
                    {/* Sticky Unit Header Banner */}
                    <div className="sticky top-16 z-10 w-full bg-duo-green text-white p-5 rounded-3xl shadow-[0_4px_0_#46A302] mb-8 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-green-100">
                          Unit {unit.position}
                        </span>
                        <h2 className="text-xl font-black">{unit.title}</h2>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-xs uppercase tracking-wider transition">
                        <BookOpen className="w-4 h-4" />
                        <span>Guidebook</span>
                      </button>
                    </div>

                    {/* Skill Nodes Zig-Zag Path */}
                    <div className="flex flex-col items-center gap-6 my-4 relative w-full">
                      {unit.skills.map((skill, skillIdx) => {
                        const globalIdx = unitIdx * 3 + skillIdx;
                        const xOffset = getHorizontalOffset(globalIdx);
                        const isSelected = selectedSkill?.id === skill.id;
                        const isAvailable = skill.status === 'available';
                        const isCompleted = skill.status === 'completed';
                        const isLocked = skill.status === 'locked';

                        return (
                          <div
                            key={skill.id}
                            className="relative flex flex-col items-center"
                            style={{ transform: `translateX(${xOffset}px)` }}
                          >
                            {/* Animated START Floating Speech Bubble */}
                            {isAvailable && (
                              <div className="absolute -top-10 z-10 animate-float">
                                <div className="bg-white dark:bg-[#18272F] text-duo-green font-black text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 border-duo-border dark:border-gray-700 shadow-md flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 fill-current text-duo-gold" />
                                  <span>START</span>
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white dark:border-t-[#18272F]" />
                                </div>
                              </div>
                            )}

                            {/* Circular Skill Node Button */}
                            <button
                              onClick={() => setSelectedSkill(isSelected ? null : skill)}
                              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:translate-y-2 select-none ${
                                isCompleted
                                  ? 'bg-duo-gold border-b-8 border-duo-goldDark shadow-[0_4px_0_#E5A500] text-yellow-950'
                                  : isAvailable
                                  ? 'bg-duo-green border-b-8 border-duo-greenDark shadow-[0_6px_0_#46A302] text-white hover:brightness-105'
                                  : 'bg-duo-gray dark:bg-gray-800 border-b-8 border-duo-grayDark dark:border-gray-900 text-duo-muted dark:text-gray-500 cursor-not-allowed shadow-none'
                              }`}
                            >
                              {/* Circular Progress Ring */}
                              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
                                <circle
                                  cx="36"
                                  cy="36"
                                  r="32"
                                  className="text-transparent stroke-current"
                                  strokeWidth="4"
                                  fill="transparent"
                                />
                                {skill.level_completed > 0 && (
                                  <circle
                                    cx="36"
                                    cy="36"
                                    r="32"
                                    className="text-white/40 stroke-current"
                                    strokeWidth="4"
                                    strokeDasharray={200}
                                    strokeDashoffset={200 - (200 * skill.level_completed) / skill.max_level}
                                    strokeLinecap="round"
                                    fill="transparent"
                                  />
                                )}
                              </svg>

                              {isCompleted ? (
                                <Check className="w-8 h-8 stroke-[3.5]" />
                              ) : isLocked ? (
                                <Lock className="w-7 h-7 stroke-[3]" />
                              ) : (
                                <Star className="w-8 h-8 fill-current stroke-[2.5]" />
                              )}
                            </button>

                            {/* Node Title */}
                            <span className="font-black text-xs text-duo-charcoal dark:text-white mt-2 tracking-wide text-center max-w-[120px]">
                              {skill.title}
                            </span>

                            {/* Popover Card */}
                            {isSelected && (
                              <div className="absolute top-24 z-20 w-72 bg-white dark:bg-[#18272F] rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-2xl p-5 flex flex-col gap-3 animate-scale-up">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-black text-base text-duo-charcoal dark:text-white">{skill.title}</h4>
                                  <span className="text-xs font-black uppercase text-duo-blue">
                                    Level {skill.level_completed}/{skill.max_level}
                                  </span>
                                </div>
                                <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                                  {isLocked
                                    ? 'Complete the preceding skills to unlock this lesson.'
                                    : isCompleted
                                    ? 'Practice this skill again to master your Spanish vocabulary!'
                                    : `Lesson ${skill.level_completed + 1} of ${skill.max_level}`}
                                </p>

                                {isLocked ? (
                                  <Button variant="locked" size="md" disabled fullWidth>
                                    Locked
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="md"
                                    fullWidth
                                    onClick={() => {
                                      if (skill.current_lesson_id) {
                                        router.push(`/lesson/${skill.current_lesson_id}`);
                                      }
                                    }}
                                  >
                                    Start (+15 XP)
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Cute Mascot Flourish at Unit End */}
                    <div className="my-8 flex flex-col items-center text-center text-duo-muted dark:text-gray-400">
                      <Mascot mood={unitIdx === coursePath.units.length - 1 ? 'celebrating' : 'happy'} size={85} />
                      <span className="text-xs font-black uppercase tracking-wider mt-2">
                        Unit {unit.position} Checkpoint
                      </span>
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 font-bold text-duo-muted">
                No course path found. Run backend database seed.
              </div>
            )}
          </main>

          {/* Right Sidebar (Desktop only) */}
          <aside className="hidden lg:flex flex-col w-80 gap-6">
            {/* Daily Goal Card */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-duo-charcoal dark:text-white">Daily Goal</h3>
                <span className="text-xs font-black text-duo-gold flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-current" />
                  {xp % dailyGoal} / {dailyGoal} XP
                </span>
              </div>
              <ProgressBar value={((xp % dailyGoal) / dailyGoal) * 100} size="md" />
              <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                Complete lessons every day to build healthy learning habits!
              </p>
            </Card>

            {/* Leaderboard Preview Card */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-duo-gold fill-current" />
                  <h3 className="font-black text-base text-duo-charcoal dark:text-white">Leaderboard</h3>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-xs font-black uppercase text-duo-blue hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {leaderboard.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                      item.is_current_user
                        ? 'border-duo-blue bg-blue-50/60 dark:bg-blue-950/40 font-black'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-black text-xs text-duo-muted dark:text-gray-400">
                        {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                      </span>
                      <span className="text-sm font-extrabold truncate max-w-[120px] text-duo-charcoal dark:text-white">
                        {item.username}
                      </span>
                    </div>
                    <span className="text-xs font-black text-duo-muted dark:text-gray-400">
                      {item.total_xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Super Duolingo Promo Card */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col gap-3 shadow-md">
              <div className="flex items-center gap-2 font-black text-sm">
                <Crown className="w-5 h-5 text-yellow-300 fill-current" />
                <span>SUPER DUOLINGO</span>
              </div>
              <p className="text-xs font-bold text-indigo-100 leading-relaxed">
                Unlimited hearts, progress tracking & personalized practice.
              </p>
              <Link href="/shop">
                <Button variant="gold" size="sm" fullWidth className="mt-1">
                  Learn More
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <DebugPanel />
    </div>
  );
}
