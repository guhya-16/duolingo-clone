'use client';
import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FeedbackBarProps {
  status: 'idle' | 'correct' | 'wrong';
  hasAnswer: boolean;
  correctAnswerText?: string;
  onCheck: () => void;
  onContinue: () => void;
  loading?: boolean;
}

export const FeedbackBar: React.FC<FeedbackBarProps> = ({
  status,
  hasAnswer,
  correctAnswerText,
  onCheck,
  onContinue,
  loading = false,
}) => {
  return (
    <footer
      className={`border-t-2 p-6 transition-all duration-200 ${
        status === 'correct'
          ? 'bg-[#D7FFB8] border-[#B8F28B]'
          : status === 'wrong'
          ? 'bg-[#FFDFE0] border-[#FFC1C3]'
          : 'bg-white border-duo-border'
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Feedback Message */}
        <div className="flex-1">
          {status === 'correct' && (
            <div className="flex items-center text-duo-greenDark font-black text-xl gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-duo-green">
                <CheckCircle2 className="w-8 h-8 fill-current text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl">Nicely done!</span>
              </div>
            </div>
          )}

          {status === 'wrong' && (
            <div className="flex items-start text-duo-redDark font-black gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-duo-red shrink-0">
                <AlertCircle className="w-8 h-8 fill-current text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg">Correct solution:</span>
                <span className="text-sm font-extrabold text-duo-charcoal">
                  {typeof correctAnswerText === 'object'
                    ? JSON.stringify(correctAnswerText)
                    : correctAnswerText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto">
          {status === 'idle' ? (
            <Button
              variant="primary"
              size="lg"
              disabled={!hasAnswer || loading}
              onClick={onCheck}
              className="w-full sm:w-44"
            >
              {loading ? 'Checking...' : 'Check'}
            </Button>
          ) : (
            <Button
              variant={status === 'correct' ? 'primary' : 'danger'}
              size="lg"
              onClick={onContinue}
              className="w-full sm:w-44"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default FeedbackBar;
