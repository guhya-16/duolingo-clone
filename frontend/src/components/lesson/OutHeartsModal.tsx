'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';
import { useUserStore } from '@/stores/userStore';
import { toast } from '@/stores/toastStore';

interface OutHeartsModalProps {
  isOpen: boolean;
  onRefilled: () => void;
}

export const OutHeartsModal: React.FC<OutHeartsModalProps> = ({
  isOpen,
  onRefilled,
}) => {
  const router = useRouter();
  const { gems, refillHeartsAction } = useUserStore();

  const handleRefill = async () => {
    const success = await refillHeartsAction();
    if (success) {
      toast.success('❤️ Hearts refilled to maximum (5/5)!');
      onRefilled();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => router.push('/learn')} showCloseButton={false}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <Mascot mood="sad" size={120} className="animate-bounce" />

        <div>
          <h3 className="text-2xl font-black text-duo-charcoal dark:text-white">You ran out of hearts!</h3>
          <p className="text-sm font-bold text-duo-muted dark:text-gray-400 mt-2">
            Mistakes cost hearts. Refill instantly with gems to keep going!
          </p>
        </div>

        <div className="w-full flex flex-col gap-2 mt-4">
          <Button
            variant="blue"
            size="lg"
            fullWidth
            disabled={gems < 100}
            onClick={handleRefill}
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>Refill for 100 💎 ({gems} available)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => router.push('/learn')}
          >
            Quit Lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OutHeartsModal;
