'use client';
import React, { useEffect, useState } from 'react';
import { Check, Moon, Save, Settings, Target, Volume2 } from 'lucide-react';

import { api } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { toast } from '@/stores/toastStore';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import Button from '@/components/ui/Button';
import DebugPanel from '@/components/DebugPanel';

const goalOptions = [
  { xp: 10, label: 'Casual', desc: '1 lesson per day' },
  { xp: 20, label: 'Regular', desc: '2 lessons per day' },
  { xp: 30, label: 'Serious', desc: '3 lessons per day' },
  { xp: 50, label: 'Intense', desc: '5 lessons per day' },
];

export default function SettingsPage() {
  const { user, refresh } = useUserStore();
  const [dailyGoal, setDailyGoal] = useState<number>(20);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setDailyGoal(user.daily_goal_xp);
    }
    if (typeof window !== 'undefined') {
      const sound = localStorage.getItem('duo_sound_effects');
      if (sound !== null) setSoundEnabled(sound === 'true');
      const dark = localStorage.getItem('duo_dark_mode') === 'true';
      setDarkMode(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user]);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (typeof window !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateMe({ daily_goal_xp: dailyGoal });
      if (typeof window !== 'undefined') {
        localStorage.setItem('duo_sound_effects', String(soundEnabled));
        localStorage.setItem('duo_dark_mode', String(darkMode));
      }
      await refresh();
      toast.success('✅ Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.info('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#131F24] flex transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav />

        <main className="max-w-3xl mx-auto w-full p-6 md:p-10 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-black text-duo-charcoal dark:text-white tracking-tight">Settings</h1>
            <p className="text-sm font-bold text-duo-muted dark:text-gray-400 mt-1">
              Customize your learning preferences and daily goals.
            </p>
          </div>

          {/* Daily Goal Setting */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-duo-green" />
              <div>
                <h2 className="text-xl font-black text-duo-charcoal dark:text-white">Daily Goal</h2>
                <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                  Choose an XP target that matches your learning schedule.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goalOptions.map((opt) => {
                const isSelected = dailyGoal === opt.xp;
                return (
                  <button
                    key={opt.xp}
                    onClick={() => setDailyGoal(opt.xp)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-duo-blue bg-blue-50/70 dark:bg-blue-950/40 shadow-[0_4px_0_#1899D6]'
                        : 'border-duo-border dark:border-gray-700 bg-white dark:bg-[#131F24] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div>
                      <span className="font-black text-base text-duo-charcoal dark:text-white block">
                        {opt.label} ({opt.xp} XP / day)
                      </span>
                      <span className="text-xs text-duo-muted dark:text-gray-400 font-bold">{opt.desc}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-duo-blue stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white dark:bg-[#18272F] p-8 rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-duo-blue" />
              <div>
                <h2 className="text-xl font-black text-duo-charcoal dark:text-white">App Preferences</h2>
                <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
                  Toggle sound effects and interface appearance.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-duo-border dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-duo-charcoal dark:text-white" />
                  <span className="font-black text-base text-duo-charcoal dark:text-white">Sound Effects</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-6 h-6 accent-duo-green cursor-pointer"
                />
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-duo-border dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-duo-charcoal dark:text-white" />
                  <span className="font-black text-base text-duo-charcoal dark:text-white">Dark Mode (Beta)</span>
                </div>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => toggleDarkMode(e.target.checked)}
                  className="w-6 h-6 accent-duo-green cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="primary" size="lg" disabled={saving} onClick={handleSave}>
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </main>
      </div>

      <DebugPanel />
    </div>
  );
}
