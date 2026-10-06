"use client";

import React from "react";

export type MascotMood = "happy" | "sad" | "celebrating";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

export function Mascot({ mood = "happy", size = 120, className = "" }: MascotProps) {
  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 transform hover:scale-105"
      >
        {/* Shadow */}
        <ellipse cx="50" cy="94" rx="32" ry="6" fill="#000000" fillOpacity="0.12" />

        {/* Feet */}
        <ellipse cx="40" cy="88" rx="7" ry="4" fill="#FF9600" />
        <ellipse cx="60" cy="88" rx="7" ry="4" fill="#FF9600" />

        {/* Main Body */}
        <rect x="20" y="24" width="60" height="64" rx="30" fill="#58CC02" stroke="#46A302" strokeWidth="3" />

        {/* Belly Plaque */}
        <ellipse cx="50" cy="62" rx="22" ry="20" fill="#8CE82A" />
        <path d="M43 55 Q50 58 57 55" stroke="#46A302" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M41 63 Q50 67 59 63" stroke="#46A302" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M44 71 Q50 74 56 71" stroke="#46A302" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Ears / Feather Tufts */}
        <path d="M26 26 L18 12 L35 20 Z" fill="#46A302" />
        <path d="M74 26 L82 12 L65 20 Z" fill="#46A302" />

        {/* Left Wing */}
        {mood === "celebrating" ? (
          <path d="M22 45 C12 30 10 20 18 16 C25 22 24 38 22 45 Z" fill="#46A302" />
        ) : mood === "sad" ? (
          <path d="M20 48 C14 58 16 72 24 76 C26 66 24 55 20 48 Z" fill="#46A302" />
        ) : (
          <path d="M20 45 C12 52 14 68 22 70 C24 60 22 50 20 45 Z" fill="#46A302" />
        )}

        {/* Right Wing */}
        {mood === "celebrating" ? (
          <path d="M78 45 C88 30 90 20 82 16 C75 22 76 38 78 45 Z" fill="#46A302" />
        ) : mood === "sad" ? (
          <path d="M80 48 C86 58 84 72 76 76 C74 66 76 55 80 48 Z" fill="#46A302" />
        ) : (
          <path d="M80 45 C88 52 86 68 78 70 C76 60 78 50 80 45 Z" fill="#46A302" />
        )}

        {/* Eyes & Expressions */}
        {mood === "sad" ? (
          <>
            {/* Sad Eyes */}
            <circle cx="37" cy="40" r="11" fill="#FFFFFF" stroke="#46A302" strokeWidth="2" />
            <circle cx="63" cy="40" r="11" fill="#FFFFFF" stroke="#46A302" strokeWidth="2" />
            {/* Pupils looking down */}
            <circle cx="37" cy="44" r="5" fill="#4B4B4B" />
            <circle cx="63" cy="44" r="5" fill="#4B4B4B" />
            <circle cx="35" cy="42" r="1.5" fill="#FFFFFF" />
            <circle cx="61" cy="42" r="1.5" fill="#FFFFFF" />
            {/* Sad Droop eyelids */}
            <path d="M26 35 Q37 40 48 35" stroke="#46A302" strokeWidth="3" fill="#58CC02" />
            <path d="M52 35 Q63 40 74 35" stroke="#46A302" strokeWidth="3" fill="#58CC02" />
            {/* Teardrop */}
            <path d="M30 48 C28 52 28 56 31 56 C34 56 34 52 32 48 Q31 46 30 48 Z" fill="#1CB0F6" />
            {/* Downward Beak */}
            <path d="M45 46 Q50 43 55 46 L50 53 Z" fill="#FF9600" />
          </>
        ) : mood === "celebrating" ? (
          <>
            {/* Party Hat */}
            <path d="M38 24 L50 2 L62 24 Z" fill="#FFC800" stroke="#E5A500" strokeWidth="1.5" />
            <path d="M43 14 L57 18" stroke="#FF4B4B" strokeWidth="2.5" />
            <path d="M46 7 L54 9" stroke="#1CB0F6" strokeWidth="2" />
            <circle cx="50" cy="2" r="3" fill="#FF4B4B" />

            {/* Sparkle Eyes */}
            <circle cx="37" cy="40" r="11" fill="#FFFFFF" stroke="#46A302" strokeWidth="2" />
            <circle cx="63" cy="40" r="11" fill="#FFFFFF" stroke="#46A302" strokeWidth="2" />
            <circle cx="37" cy="39" r="6" fill="#4B4B4B" />
            <circle cx="63" cy="39" r="6" fill="#4B4B4B" />
            <circle cx="35" cy="37" r="2.5" fill="#FFFFFF" />
            <circle cx="61" cy="37" r="2.5" fill="#FFFFFF" />
            <circle cx="39" cy="41" r="1" fill="#FFFFFF" />
            <circle cx="65" cy="41" r="1" fill="#FFFFFF" />

            {/* Happy Open Beak */}
            <path d="M44 45 Q50 48 56 45 L50 56 Z" fill="#FF9600" />
            <ellipse cx="50" cy="49" rx="3.5" ry="3" fill="#EA2B2B" />

            {/* Rosy Cheeks */}
            <ellipse cx="27" cy="46" rx="3.5" ry="2" fill="#FF7878" fillOpacity="0.6" />
            <ellipse cx="73" cy="46" rx="3.5" ry="2" fill="#FF7878" fillOpacity="0.6" />

            {/* Confetti Sparks */}
            <circle cx="15" cy="22" r="2" fill="#FFC800" />
            <circle cx="85" cy="20" r="2" fill="#1CB0F6" />
            <circle cx="80" cy="32" r="1.5" fill="#FF4B4B" />
            <circle cx="18" cy="34" r="1.5" fill="#8CE82A" />
          </>
        ) : (
          <>
            {/* Happy Regular Eyes */}
            <circle cx="37" cy="40" r="11" fill="#FFFFFF" stroke="#46A302" strokeWidth="2" />
            <circle cx="63" cy="40" r="11" fill="#FFFFFF" stroke="#46A302" strokeWidth="2" />
            <circle cx="37" cy="39" r="5.5" fill="#4B4B4B" />
            <circle cx="63" cy="39" r="5.5" fill="#4B4B4B" />
            <circle cx="35" cy="37" r="2" fill="#FFFFFF" />
            <circle cx="61" cy="37" r="2" fill="#FFFFFF" />

            {/* Cheerful Beak */}
            <path d="M44 45 Q50 42 56 45 L50 54 Z" fill="#FF9600" />

            {/* Rosy Cheeks */}
            <ellipse cx="27" cy="46" rx="3.5" ry="2" fill="#FF7878" fillOpacity="0.5" />
            <ellipse cx="73" cy="46" rx="3.5" ry="2" fill="#FF7878" fillOpacity="0.5" />
          </>
        )}
      </svg>
    </div>
  );
}
