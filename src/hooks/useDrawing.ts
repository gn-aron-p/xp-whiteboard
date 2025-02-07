import { useRef, useCallback } from 'react';


export function useDrawing(
  ctx: CanvasRenderingContext2D | null,
  scale: number,
  translateX: number,
  translateY: number
) {
  const drawingRef = useRef(false);

  const getPosition = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!ctx) return null;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return { x: (clientX - translateX) / scale, y: (clientY - translateY) / scale };
    },
    [ctx, scale, translateX, translateY]
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!ctx) return;
      if ('touches' in e && e.touches.length > 1) return;
      drawingRef.current = true;
      const pos = getPosition(e);
      if (!pos) return;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [ctx, getPosition]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!ctx || !drawingRef.current) return;
      if ('touches' in e && e.touches.length > 1) return;
      const pos = getPosition(e);
      if (!pos) return;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [ctx, getPosition]
  );

  const stopDrawing = useCallback(() => {
    if (!ctx) return;
    drawingRef.current = false;
    ctx.beginPath();
  }, [ctx]);

  return { startDrawing, draw, stopDrawing };
}
