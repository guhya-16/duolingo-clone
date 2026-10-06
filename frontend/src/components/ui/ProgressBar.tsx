import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  className = '',
}) => {
  const heightStyles = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`w-full bg-duo-gray rounded-full overflow-hidden relative ${heightStyles[size]} ${className}`}
    >
      <div
        className="bg-duo-green h-full rounded-full transition-all duration-300 ease-out relative"
        style={{ width: `${clampedValue}%` }}
      >
        {/* Top highlight line for authentic glossy Duolingo look */}
        <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};

export default ProgressBar;
