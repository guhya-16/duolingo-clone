'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'blue' | 'red' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'green',
  className = '',
  ...props
}) => {
  const variantStyles = {
    green: 'bg-duo-green border-b-4 border-duo-greenDark text-white hover:brightness-105 active:border-b-0',
    blue: 'bg-duo-blue border-b-4 border-duo-blueDark text-white hover:brightness-105 active:border-b-0',
    red: 'bg-duo-red border-b-4 border-duo-redDark text-white hover:brightness-105 active:border-b-0',
    outline: 'bg-white border-2 border-b-4 border-duo-gray text-[#4B4B4B] hover:bg-gray-50 active:border-b-2',
  };

  return (
    <button
      className={`duo-button px-6 py-3 rounded-2xl ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};