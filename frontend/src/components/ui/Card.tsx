import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  selected = false,
  highlighted = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-3xl border-2 transition-all p-6 bg-white ${
        selected
          ? 'border-duo-blue bg-blue-50/50 shadow-[0_4px_0_#1899D6]'
          : highlighted
          ? 'border-duo-green bg-green-50/30'
          : 'border-duo-border shadow-sm hover:border-gray-300'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
