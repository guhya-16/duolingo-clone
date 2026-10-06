'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, X } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface LessonHeaderProps {
  progress: number;
  hearts: number;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  progress,
  hearts,
}) => {
  const router = useRouter();
  const [showQuitModal, setShowQuitModal] = useState(false);

  return (
    <>
      <header className="max-w-4xl mx-auto w-full pt-6 pb-4 px-4 flex items-center gap-4">
        {/* Exit Button */}
        <button
          onClick={() => setShowQuitModal(true)}
          className="text-duo-muted hover:text-duo-charcoal p-1 transition"
        >
          <X className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <ProgressBar value={progress} size="md" />
        </div>

        {/* Hearts Indicator */}
        <div className="flex items-center text-duo-red font-black gap-1.5 text-base">
          <Heart className="w-7 h-7 fill-current" />
          <span>{hearts}</span>
        </div>
      </header>

      {/* Confirm Quit Dialog */}
      <Modal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        title="Are you sure you want to quit?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-duo-muted">
            All progress made in this session will be lost. Keep going to earn XP and extend your streak!
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowQuitModal(false)}
            >
              Keep Learning
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => router.push('/learn')}
            >
              Quit Lesson
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LessonHeader;
