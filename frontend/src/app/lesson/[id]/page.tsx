'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { ExerciseClient, LessonClient, LessonCompleteResponse } from '@/lib/types';
import { useUserStore } from '@/stores/userStore';
import LessonHeader from '@/components/lesson/LessonHeader';
import FeedbackBar from '@/components/lesson/FeedbackBar';
import OutHeartsModal from '@/components/lesson/OutHeartsModal';
import LessonComplete from '@/components/lesson/LessonComplete';
import MultipleChoice from '@/components/lesson/exercises/MultipleChoice';
import TranslateWordBank from '@/components/lesson/exercises/TranslateWordBank';
import MatchPairs from '@/components/lesson/exercises/MatchPairs';
import FillBlank from '@/components/lesson/exercises/FillBlank';
import TypeAnswer from '@/components/lesson/exercises/TypeAnswer';
import Button from '@/components/ui/Button';
import { Mascot } from '@/components/ui/Mascot';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Number(params?.id);

  const { hearts, deductHeart, refresh } = useUserStore();

  const [lesson, setLesson] = useState<LessonClient | null>(null);
  const [exerciseQueue, setExerciseQueue] = useState<ExerciseClient[]>([]);
  const [totalInitialCount, setTotalInitialCount] = useState<number>(8);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [correctAnswerText, setCorrectAnswerText] = useState<string>('');
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [checking, setChecking] = useState<boolean>(false);
  const [showOutHearts, setShowOutHearts] = useState<boolean>(false);
  const [completionSummary, setCompletionSummary] = useState<LessonCompleteResponse | null>(null);
  const [lockedError, setLockedError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        await refresh();
        const data = await api.getLesson(lessonId);
        setLesson(data);
        setExerciseQueue(data.exercises);
        setTotalInitialCount(data.exercises.length);
        setLockedError(null);
      } catch (err: any) {
        if (
          err.status === 403 ||
          err.data?.code === 'skill_locked' ||
          err.message?.includes('skill_locked')
        ) {
          setLockedError('This skill is locked. Complete previous skills to unlock this lesson!');
        } else {
          setLockedError('Failed to load lesson. Please try again.');
        }
      }
    }
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId, refresh]);

  const currentExercise = exerciseQueue[0];
  const progressPercent = totalInitialCount > 0 ? (correctCount / totalInitialCount) * 100 : 0;

  const hasAnswer =
    currentAnswer !== null &&
    currentAnswer !== undefined &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : String(currentAnswer).trim() !== '');

  const handleCheck = useCallback(async () => {
    if (!currentExercise || !hasAnswer || checking || status !== 'idle') {
      return;
    }

    setChecking(true);
    try {
      const res = await api.checkAnswer(lessonId, currentExercise.id, currentAnswer);
      if (res.correct) {
        setStatus('correct');
        setCorrectAnswerText('');
      } else {
        setStatus('wrong');
        setCorrectAnswerText(res.correct_answer);
        deductHeart();
        setMistakes((prev) => prev + 1);

        if (res.hearts <= 0) {
          setShowOutHearts(true);
        }
      }
    } catch (err: any) {
      if (
        err.status === 403 &&
        (err.data?.code === 'out_of_hearts' || err.message?.includes('out_of_hearts'))
      ) {
        setShowOutHearts(true);
      } else {
        alert(err.message || 'Error checking answer');
      }
    } finally {
      setChecking(false);
    }
  }, [currentExercise, hasAnswer, checking, status, lessonId, currentAnswer, deductHeart]);

  const handleContinue = useCallback(async () => {
    if (status === 'correct') {
      const nextQueue = exerciseQueue.slice(1);
      setCorrectCount((prev) => prev + 1);

      if (nextQueue.length === 0) {
        // Lesson finished! Call complete API
        try {
          const summary = await api.completeLesson(lessonId, mistakes);
          setCompletionSummary(summary);
        } catch (err: any) {
          console.error('Failed to complete lesson:', err);
          router.push('/learn');
        }
      } else {
        setExerciseQueue(nextQueue);
        setCurrentAnswer(null);
        setStatus('idle');
      }
    } else if (status === 'wrong') {
      // Wrong answer: re-queue exercise to the back of the queue
      const [failedEx, ...rest] = exerciseQueue;
      setExerciseQueue([...rest, failedEx]);
      setCurrentAnswer(null);
      setStatus('idle');
    }
  }, [status, exerciseQueue, lessonId, mistakes, router]);

  // Keyboard Enter shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (status === 'idle') {
          if (hasAnswer && !checking) {
            handleCheck();
          }
        } else {
          handleContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, hasAnswer, checking, handleCheck, handleContinue]);

  // If locked skill error
  if (lockedError) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#131F24] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full flex flex-col items-center gap-6">
          <Mascot mood="sad" size={130} />
          <h2 className="text-3xl font-black text-duo-charcoal dark:text-white">
            Skill Locked!
          </h2>
          <p className="text-base font-bold text-duo-muted dark:text-gray-400">
            {lockedError}
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.push('/learn')}
          >
            Back to Learning Path
          </Button>
        </div>
      </div>
    );
  }

  // If finished, show LessonComplete screen
  if (completionSummary) {
    return (
      <LessonComplete
        summary={completionSummary}
        mistakes={mistakes}
        totalExercises={totalInitialCount}
      />
    );
  }

  if (!lesson || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#131F24]">
        <div className="w-12 h-12 border-4 border-duo-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderExerciseComponent = () => {
    const disabled = status !== 'idle';
    switch (currentExercise.type) {
      case 'multiple_choice':
        return (
          <MultipleChoice
            exercise={currentExercise}
            disabled={disabled}
            value={currentAnswer}
            onChange={setCurrentAnswer}
          />
        );
      case 'translate_word_bank':
        return (
          <TranslateWordBank
            exercise={currentExercise}
            disabled={disabled}
            value={currentAnswer}
            onChange={setCurrentAnswer}
          />
        );
      case 'match_pairs':
        return (
          <MatchPairs
            exercise={currentExercise}
            disabled={disabled}
            value={currentAnswer}
            onChange={setCurrentAnswer}
          />
        );
      case 'fill_blank':
        return (
          <FillBlank
            exercise={currentExercise}
            disabled={disabled}
            value={currentAnswer}
            onChange={setCurrentAnswer}
          />
        );
      case 'type_answer':
        return (
          <TypeAnswer
            exercise={currentExercise}
            disabled={disabled}
            value={currentAnswer}
            onChange={setCurrentAnswer}
            onSubmit={handleCheck}
          />
        );
      default:
        return <div>Unsupported exercise type: {currentExercise.type}</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#131F24] select-none transition-colors duration-200">
      {/* Header */}
      <LessonHeader progress={progressPercent} hearts={hearts} />

      {/* Exercise Content Area */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-3xl mx-auto w-full">
        {renderExerciseComponent()}
      </main>

      {/* Sliding Feedback Bar */}
      <FeedbackBar
        status={status}
        hasAnswer={hasAnswer}
        correctAnswerText={correctAnswerText}
        onCheck={handleCheck}
        onContinue={handleContinue}
        loading={checking}
      />

      {/* Out of Hearts Modal */}
      <OutHeartsModal
        isOpen={showOutHearts}
        onRefilled={() => {
          setShowOutHearts(false);
          refresh();
        }}
      />
    </div>
  );
}
