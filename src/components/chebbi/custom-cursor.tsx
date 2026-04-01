'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't render on touch devices
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mX = 0, mY = 0, rX = 0, rY = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mX = e.clientX;
      mY = e.clientY;
      dot.style.left = `${mX}px`;
      dot.style.top = `${mY}px`;
    };

    const animate = () => {
      rX += (mX - rX) * 0.15;
      rY += (mY - rY) * 0.15;
      ring.style.left = `${rX}px`;
      ring.style.top = `${rY}px`;
      animId = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      dot.classList.add('scale-[2.5]', 'opacity-50');
      ring.classList.add('scale-150', 'opacity-30');
    };
    const onLeave = () => {
      dot.classList.remove('scale-[2.5]', 'opacity-50');
      ring.classList.remove('scale-150', 'opacity-30');
    };

    document.addEventListener('mousemove', onMove);
    animId = requestAnimationFrame(animate);

    // Add hover effect to interactive elements
    const interactives = document.querySelectorAll('a, button, [role="button"], .group');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    // Show cursor elements
    dot.style.opacity = '1';
    ring.style.opacity = '1';

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed w-2 h-2 rounded-full pointer-events-none z-[99999] opacity-0 transition-transform duration-150 hidden lg:block"
        style={{
          background: '#10b981',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={ringRef}
        className="fixed w-10 h-10 rounded-full pointer-events-none z-[99998] opacity-0 transition-[width,height] duration-300 hidden lg:block"
        style={{
          border: '2px solid rgba(16,185,129,0.4)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
