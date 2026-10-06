import React from "react";
import { Check, Star, Lock } from "lucide-react";
import Link from "next/link";

interface LessonCardProps {
  id: number;
  title: string;
  description?: string;
  order: number;
  completed?: boolean;
  locked?: boolean;
  xpReward?: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  id,
  title,
  description,
  order,
  completed = false,
  locked = false,
  xpReward = 10,
}) => {
  return (
    <div className="flex flex-col items-center my-6">
      <div className="relative group">
        <Link
          href={locked ? "#" : `/learn?lessonId=${id}`}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full border-b-8 text-white transition-all transform active:translate-y-2 active:border-b-0 ${
            completed
              ? "bg-duo-yellow border-duo-yellow-dark shadow-[0_4px_0_#e5a500]"
              : locked
              ? "bg-gray-300 border-gray-400 cursor-not-allowed shadow-none"
              : "bg-duo-green border-duo-green-dark shadow-[0_6px_0_#46a302] hover:brightness-105"
          }`}
        >
          {completed ? (
            <Check className="w-8 h-8 stroke-[3]" />
          ) : locked ? (
            <Lock className="w-8 h-8 text-gray-400 stroke-[2.5]" />
          ) : (
            <Star className="w-8 h-8 fill-white stroke-[2.5]" />
          )}
        </Link>
      </div>

      <div className="mt-2 text-center">
        <h4 className="font-extrabold text-sm text-gray-700">{title}</h4>
        {description && (
          <p className="text-xs text-gray-500 max-w-xs">{description}</p>
        )}
        <span className="text-[11px] font-bold text-duo-blue uppercase tracking-wider">
          +{xpReward} XP
        </span>
      </div>
    </div>
  );
};

export default LessonCard;
