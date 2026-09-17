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
  'rgba(200, 255, 61, 0.34)',
  'rgba(67, 245, 255, 0.24)',
  'rgba(108, 59, 255, 0.22)',
];

export default function DotMatrixBackground({
  background = '#07080a',
  colors = DEFAULT_COLORS,
  cellSize = 18,
  speed = 0.22,
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

      for (let row = -1; row < rows; row += 1) {
        for (let column = -1; column < columns; column += 1) {
          const x = column * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          const nx = x / Math.max(width, 1);
          const ny = y / Math.max(height, 1);
          const waveA = Math.sin(nx * 8.4 + phase * 2.1) * Math.cos(ny * 6.2 - phase);
          const waveB = Math.sin((nx + ny) * 11.2 - phase * 1.4);
          const focus = Math.max(0, 1 - Math.hypot(nx - 0.5, ny - 0.48) * 1.35);
          const value = Math.max(0, Math.min(1, (waveA + waveB + 2) / 4 * 0.72 + focus * 0.28));
          const radius = 0.45 + value * Math.min(3.2, cellSize * 0.18);
          const paletteIndex = Math.min(colors.length - 1, Math.floor(value * colors.length));

          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = colors[Math.max(0, paletteIndex)];
          context.fill();
        }
      }
    };

    const animate = (time: number) => {
      if (time - lastDraw >= 1000 / 24) {
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
