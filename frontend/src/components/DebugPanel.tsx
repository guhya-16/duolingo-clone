'use client';
import React, { useState } from 'react';
import { Calendar, ChevronUp, RefreshCw, RotateCcw, X } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/api';
import { toast } from '@/stores/toastStore';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { debugDate, setDebugDate, refresh } = useUserStore();
  const [customDate, setCustomDate] = useState('');

  const handleSetDate = (dateStr: string | null) => {
    setDebugDate(dateStr);
    toast.info(dateStr ? `Simulating date: ${dateStr}` : 'Reset to system clock');
  };

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      await api.devReset();
      await refresh();
      toast.success('✨ Demo data reset to initial seeded state!');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      toast.info('Failed to reset demo data.');
    } finally {
      setResetting(false);
    }
  };

  const getRelativeDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-duo-charcoal text-white px-4 py-2.5 rounded-2xl shadow-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-black transition-all border-2 border-white/20"
        >
          <Calendar className="w-4 h-4 text-duo-green" />
          <span>Debug Mode {debugDate ? `(${debugDate})` : ''}</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      ) : (
        <div className="bg-white dark:bg-[#18272F] rounded-3xl border-2 border-duo-border dark:border-gray-700 shadow-2xl p-5 w-80 flex flex-col gap-4 animate-scale-up">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-duo-blue" />
              <h4 className="font-black text-sm uppercase tracking-wide text-duo-charcoal dark:text-white">
                Time Travel Panel
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-duo-muted dark:text-gray-400 hover:text-duo-charcoal dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-duo-muted dark:text-gray-400 font-bold">
            Simulate current date with <code className="text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-1 py-0.5 rounded">X-Debug-Date</code> to test streak preservation or breaks.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSetDate(null)}
              className={`p-2 rounded-xl text-xs font-black uppercase transition ${
                !debugDate
                  ? 'bg-duo-green text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-duo-charcoal dark:text-white'
              }`}
            >
              Real Today
            </button>
            <button
              onClick={() => handleSetDate(getRelativeDate(-1))}
              className={`p-2 rounded-xl text-xs font-black uppercase transition ${
                debugDate === getRelativeDate(-1)
                  ? 'bg-duo-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-duo-charcoal dark:text-white'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handleSetDate(getRelativeDate(1))}
              className={`p-2 rounded-xl text-xs font-black uppercase transition ${
                debugDate === getRelativeDate(1)
                  ? 'bg-duo-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-duo-charcoal dark:text-white'
              }`}
            >
              Tomorrow (+1)
            </button>
            <button
              onClick={() => handleSetDate(getRelativeDate(2))}
              className={`p-2 rounded-xl text-xs font-black uppercase transition ${
                debugDate === getRelativeDate(2)
                  ? 'bg-duo-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-duo-charcoal dark:text-white'
              }`}
            >
              +2 Days (Gap)
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-duo-border dark:border-gray-700 bg-white dark:bg-[#131F24] text-duo-charcoal dark:text-white rounded-xl focus:border-duo-blue outline-none"
            />
            <button
              onClick={() => {
                if (customDate) handleSetDate(customDate);
              }}
              className="px-3 py-1.5 bg-duo-charcoal dark:bg-gray-700 text-white rounded-xl text-xs font-black uppercase hover:bg-black"
            >
              Set
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetDemoData}
            disabled={resetting}
            className="w-full py-2.5 px-3 bg-red-50 dark:bg-red-950/40 border-2 border-duo-red text-duo-red dark:text-red-400 rounded-xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-duo-muted dark:text-gray-400">
              Active: {debugDate || 'System Clock'}
            </span>
            <button
              onClick={() => refresh()}
              className="p-1.5 text-duo-blue hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition flex items-center gap-1 text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
