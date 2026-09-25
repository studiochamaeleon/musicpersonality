'use client';

import { CSSProperties, useEffect, useRef } from 'react';

interface DotMatrixBackgroundProps {
  background?: string;
  colors?: string[];
  cellSize?: number;
  speed?: number;
  style?: CSSProperties;
}

const DEFAULT_COLORS = [
  'rgba(200, 255, 61, 0.58)',
  'rgba(67, 245, 255, 0.46)',
  'rgba(108, 59, 255, 0.42)',
];

export default function DotMatrixBackground({
  background = '#07080a',
  colors = DEFAULT_COLORS,
  cellSize = 17,
  speed = 0.72,
  style,
}: DotMatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastDraw = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time = 0) => {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const columns = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;
      const phase = reduceMotion ? 0.65 : time * 0.001 * speed;
      const focusAX = 0.5 + Math.sin(phase * 0.72) * 0.25;
      const focusAY = 0.46 + Math.cos(phase * 0.58) * 0.2;
      const focusBX = 0.5 + Math.cos(phase * 0.47 + 1.6) * 0.32;
      const focusBY = 0.5 + Math.sin(phase * 0.64 + 0.8) * 0.24;

      for (let row = -1; row < rows; row += 1) {
        for (let column = -1; column < columns; column += 1) {
          const x = column * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          const nx = x / Math.max(width, 1);
          const ny = y / Math.max(height, 1);
          const waveA = Math.sin(nx * 10.8 - phase * 3.4 + Math.sin(ny * 7.2 + phase) * 1.2);
          const waveB = Math.cos(ny * 8.6 + phase * 2.7 + Math.cos(nx * 6.4 - phase) * 1.1);
          const waveC = Math.sin((nx - ny) * 14.5 + phase * 4.1) * 0.62;
          const focusA = Math.max(0, 1 - Math.hypot(nx - focusAX, ny - focusAY) * 1.75);
          const focusB = Math.max(0, 1 - Math.hypot(nx - focusBX, ny - focusBY) * 1.9);
          const rawValue = Math.max(0, Math.min(1, (waveA + waveB + waveC + 2.62) / 5.24 * 0.72 + Math.max(focusA, focusB) * 0.42));
          const value = rawValue * rawValue * (3 - 2 * rawValue);
          const pulse = 0.86 + Math.sin(phase * 5.2 + column * 0.24 + row * 0.17) * 0.14;
          const radius = (0.62 + value * Math.min(5.4, cellSize * 0.32)) * pulse;
          const colorFlow = (Math.sin(nx * 4.8 + ny * 3.6 - phase * 2.2) + 1) / 2;
          const paletteIndex = Math.min(colors.length - 1, Math.floor(colorFlow * colors.length));
          const drift = value * 1.8;
          const drawX = x + Math.sin(phase * 2.6 + row * 0.21) * drift;
          const drawY = y + Math.cos(phase * 2.2 + column * 0.18) * drift;

          context.beginPath();
          context.arc(drawX, drawY, radius, 0, Math.PI * 2);
          context.fillStyle = colors[Math.max(0, paletteIndex)];
          context.globalAlpha = 0.42 + value * 0.58;
          context.fill();
        }
      }
      context.globalAlpha = 1;
    };

    const animate = (time: number) => {
      if (time - lastDraw >= 1000 / 30) {
        lastDraw = time;
        draw(time);
      }
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    draw();
    const observer = new ResizeObserver(() => {
      resize();
      draw(lastDraw);
    });
    observer.observe(container);

    if (!reduceMotion) frame = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [background, cellSize, colors, speed]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={style}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
