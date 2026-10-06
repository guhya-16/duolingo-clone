'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Gem, Heart, Plus } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { toast } from '@/stores/toastStore';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';

export const TopNav: React.FC = () => {
  const { hearts, streak, gems, refresh, refillHeartsAction } = useUserStore();
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillLoading, setRefillLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRefill = async () => {
    setRefillLoading(true);
    const success = await refillHeartsAction();
    setRefillLoading(false);
    if (success) {
      toast.success('❤️ Hearts refilled to maximum (5/5)!');
      setShowRefillModal(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 bg-white/95 dark:bg-[#131F24]/95 backdrop-blur-sm border-b-2 border-duo-border dark:border-gray-700 px-4 md:px-8 py-3 flex justify-between items-center z-20 transition-colors duration-200">
        {/* Course Language Flag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-duo-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer font-extrabold text-sm">
            <span className="text-xl">🇪🇸</span>
            <span className="hidden sm:inline uppercase text-duo-charcoal dark:text-white">Spanish</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 sm:gap-6 font-black text-sm">
          {/* Streak Indicator */}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-duo-gold hover:opacity-80 transition cursor-pointer"
          >
            <Flame className="w-5 h-5 fill-current" />
            <span>{streak}</span>
          </Link>

          {/* Gems Indicator */}
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-duo-blue hover:opacity-80 transition cursor-pointer"
          >
            <Gem className="w-5 h-5 fill-current" />
            <span>{gems}</span>
          </Link>

          {/* Hearts Indicator */}
          <button
            onClick={() => setShowRefillModal(true)}
            className="flex items-center gap-1.5 text-duo-red hover:opacity-80 transition cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-current" />
            <span>{hearts}</span>
            {hearts < 5 && (
              <span className="w-4 h-4 rounded-full bg-duo-green text-white flex items-center justify-center text-[10px]">
                <Plus className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Heart Refill Modal */}
      <Modal
        isOpen={showRefillModal}
        onClose={() => setShowRefillModal(false)}
        title="Hearts Refill"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <Mascot mood={hearts === 5 ? 'happy' : 'sad'} size={100} />
          <div>
            <h4 className="font-black text-lg text-duo-charcoal dark:text-white">
              {hearts === 5 ? 'Hearts are Full!' : `You have ${hearts} / 5 Hearts`}
            </h4>
            <p className="text-sm text-duo-muted dark:text-gray-400 mt-1">
              Hearts regenerate automatically (+1 every 4 hours), or you can refill instantly for 100 gems.
            </p>
          </div>

          <div className="w-full flex flex-col gap-2 mt-2">
            {hearts < 5 ? (
              <Button
                variant="blue"
                fullWidth
                disabled={gems < 100 || refillLoading}
                onClick={handleRefill}
              >
                Refill for 100 💎 ({gems} available)
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={() => setShowRefillModal(false)}>
                Awesome
              </Button>
            )}
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowRefillModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TopNav;
