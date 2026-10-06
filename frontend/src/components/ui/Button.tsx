'use client';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'blue' | 'danger' | 'gold' | 'ghost' | 'locked';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-duo-green border-b-4 border-duo-greenDark text-white hover:brightness-105 active:border-b-0 active:translate-y-[4px]',
    secondary:
      'bg-white border-2 border-b-4 border-duo-gray text-duo-charcoal hover:bg-gray-50 active:border-b-2 active:translate-y-[2px]',
    blue:
      'bg-duo-blue border-b-4 border-duo-blueDark text-white hover:brightness-105 active:border-b-0 active:translate-y-[4px]',
    danger:
      'bg-duo-red border-b-4 border-duo-redDark text-white hover:brightness-105 active:border-b-0 active:translate-y-[4px]',
    gold:
      'bg-duo-gold border-b-4 border-duo-goldDark text-yellow-900 hover:brightness-105 active:border-b-0 active:translate-y-[4px]',
    ghost:
      'bg-transparent text-duo-muted hover:bg-gray-100 active:translate-y-0 border-none',
    locked:
      'bg-duo-gray border-b-4 border-duo-grayDark text-duo-muted cursor-not-allowed active:translate-y-0 active:border-b-4',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs font-black rounded-xl tracking-wider',
    md: 'px-6 py-3 text-sm font-black rounded-2xl tracking-wider',
    lg: 'px-8 py-4 text-base font-black rounded-2xl tracking-wider',
    icon: 'p-3 rounded-2xl flex items-center justify-center',
  };

  const currentVariant = disabled ? variantStyles.locked : variantStyles[variant];

  return (
    <button
      disabled={disabled}
      className={`duo-button flex items-center justify-center gap-2 select-none uppercase transition-all duration-75 ${
        sizeStyles[size]
      } ${currentVariant} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
