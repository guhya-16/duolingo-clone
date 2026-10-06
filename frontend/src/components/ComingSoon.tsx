import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';

interface ComingSoonProps {
  title: string;
  description?: string;
  feature?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = 'This feature is currently under active development. Check back soon for exciting updates!',
  feature,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto min-h-[70vh]">
      <div className="w-28 h-28 rounded-full bg-duo-green/10 border-4 border-duo-green/20 flex items-center justify-center mb-6 animate-float">
        <Sparkles className="w-14 h-14 text-duo-green" />
      </div>

      <h2 className="text-3xl font-black text-duo-charcoal mb-2">{title}</h2>
      {feature && (
        <span className="inline-block px-3 py-1 rounded-full bg-duo-gold/20 text-yellow-800 font-extrabold text-xs uppercase tracking-wider mb-4">
          {feature}
        </span>
      )}
      <p className="text-duo-muted font-bold text-sm max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      <Link href="/learn">
        <Button variant="primary" size="md">
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
          <span>Back to Learning Path</span>
        </Button>
      </Link>
    </div>
  );
};

export default ComingSoon;
