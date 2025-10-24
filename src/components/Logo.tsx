import { ShieldCheck } from 'lucide-react';
import React from 'react';

export function Logo({ size = 'default' }: { size?: 'default' | 'large' | 'small' }) {
  const sizeClasses = {
    small: {
      icon: "h-6 w-6 sm:h-7 sm:w-7",
      text: "text-lg sm:text-xl"
    },
    default: {
      icon: "h-7 w-7 sm:h-8 sm:w-8",
      text: "text-xl sm:text-2xl md:text-3xl"
    },
    large: {
      icon: "h-10 w-10 sm:h-12 sm:w-12",
      text: "text-3xl sm:text-4xl md:text-5xl"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 text-primary select-none touch-manipulation">
      <ShieldCheck className={currentSize.icon} />
      <h1 className={`font-headline font-bold tracking-tighter ${currentSize.text}`}>
        SafeRide
      </h1>
    </div>
  );
}
