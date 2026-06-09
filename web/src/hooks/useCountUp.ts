import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration: number = 500): number {
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    if (current === target) return;

    const start = current;
    const diff = target - start;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + diff * eased);

      setCurrent(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, current]);

  return current;
}
