import React, { useEffect, useRef, useState } from 'react';
import { formatBdt } from '../data/perfumes';

interface AnimatedBdtPriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  resetKey?: string;
  durationMs?: number;
}

export const AnimatedBdtPrice: React.FC<AnimatedBdtPriceProps> = ({
  value,
  resetKey,
  durationMs = 650,
  className = '',
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const [animState, setAnimState] = useState<{
    dir: 'up' | 'down' | null;
    seq: number;
  }>({ dir: null, seq: 0 });

  const displayedRef = useRef<number>(value);
  const prevTargetRef = useRef<number>(value);
  const prevResetKeyRef = useRef<string | undefined>(resetKey);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      prevTargetRef.current = value;
      displayedRef.current = value;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setDisplayValue(value);
      setAnimState((prev) => ({ dir: null, seq: prev.seq }));
      return;
    }

    if (value === prevTargetRef.current) return;

    const fromValue = displayedRef.current;
    const toValue = value;
    prevTargetRef.current = toValue;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (fromValue === toValue) {
      displayedRef.current = toValue;
      setDisplayValue(toValue);
      return;
    }

    const dir: 'up' | 'down' = toValue > fromValue ? 'up' : 'down';
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || durationMs <= 0) {
      displayedRef.current = toValue;
      setDisplayValue(toValue);
      setAnimState((prev) => ({ dir: null, seq: prev.seq }));
      return;
    }

    setAnimState((prev) => ({ dir, seq: prev.seq + 1 }));

    let startTime: number | null = null;

    const step = (now: number) => {
      if (startTime === null) {
        startTime = now;
      }
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.max(0, Math.min(1, elapsed / durationMs));
      // Gentle easeInOutCubic curve so numbers glide up/down smoothly without an aggressive jump
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const nextVal =
        progress >= 1 ? toValue : Math.round(fromValue + (toValue - fromValue) * eased);

      if (nextVal !== displayedRef.current) {
        displayedRef.current = nextVal;
        setDisplayValue(nextVal);
      }

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        displayedRef.current = toValue;
        setDisplayValue(toValue);
        rafRef.current = null;
      }
    };

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, resetKey, durationMs]);

  const animClass =
    animState.dir === 'up'
      ? 'animate-sillux-price-up'
      : animState.dir === 'down'
        ? 'animate-sillux-price-down'
        : '';

  return (
    <span
      {...rest}
      data-price-direction={animState.dir ?? 'idle'}
      data-target-price={value}
      className={`inline-flex items-baseline overflow-hidden py-[1px] -my-[1px] tabular-nums ${className}`}
    >
      <span
        key={animState.dir ? `${animState.dir}-${animState.seq}` : 'static'}
        className={`inline-block ${animClass}`}
      >
        {formatBdt(displayValue)}
      </span>
    </span>
  );
};
