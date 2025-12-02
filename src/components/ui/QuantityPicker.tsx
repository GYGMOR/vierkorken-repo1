'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface QuantityPickerProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
}

export function QuantityPicker({
  value: initialValue = 1,
  min = 1,
  max = 99,
  onChange,
  className,
}: QuantityPickerProps) {
  const [value, setValue] = useState(initialValue);

  const handleIncrement = () => {
    if (value < max) {
      const newValue = value + 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      const newValue = value - 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Erlaube leeren Input für einfacheres Bearbeiten
    if (inputValue === '') {
      setValue(min);
      return;
    }

    const numValue = parseInt(inputValue, 10);

    if (!isNaN(numValue)) {
      if (numValue < min) {
        setValue(min);
        onChange?.(min);
      } else if (numValue > max) {
        setValue(max);
        onChange?.(max);
      } else {
        setValue(numValue);
        onChange?.(numValue);
      }
    }
  };

  const handleBlur = () => {
    // Stelle sicher, dass der Wert mindestens min ist
    if (value < min) {
      setValue(min);
      onChange?.(min);
    }
  };

  return (
    <div className={cn('inline-flex items-center border border-taupe rounded-lg', className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          'px-3 py-2 text-graphite hover:bg-warmwhite-light transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'border-r border-taupe'
        )}
        aria-label="Menge verringern"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        className={cn(
          'w-16 px-2 py-2 text-center text-graphite-dark font-medium',
          'bg-warmwhite border-0 focus:outline-none focus:ring-0',
          // Hide number input spinners
          '[appearance:textfield]',
          '[&::-webkit-outer-spin-button]:appearance-none',
          '[&::-webkit-inner-spin-button]:appearance-none'
        )}
        aria-label="Menge"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          'px-3 py-2 text-graphite hover:bg-warmwhite-light transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'border-l border-taupe'
        )}
        aria-label="Menge erhöhen"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
