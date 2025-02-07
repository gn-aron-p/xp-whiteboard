import { useState, useRef, useCallback } from 'react';

export function useZoomPan(initialScale = 1, initialX = 0, initialY = 0) {
  const [scale, setScale] = useState(initialScale);
  const [translate, setTranslate] = useState({ x: initialX, y: initialY });
  const lastTouchDistance = useRef(0);
  const lastPan = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [touch1, touch2] = e.touches;
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setScale(prev => {
        let newScale = prev;
        if (lastTouchDistance.current) {
          const delta = currentDistance - lastTouchDistance.current;
          newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta * 0.005));
        }
        return newScale;
      });
      lastTouchDistance.current = currentDistance;

      const currentPanX = (touch1.clientX + touch2.clientX) / 2;
      const currentPanY = (touch1.clientY + touch2.clientY) / 2;
      setTranslate(prev => ({
        x: prev.x + (currentPanX - lastPan.current.x),
        y: prev.y + (currentPanY - lastPan.current.y)
      }));
      lastPan.current = { x: currentPanX, y: currentPanY };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = 0;
    lastPan.current = { x: 0, y: 0 };
  }, []);

  return { scale, translate, handleTouchMove, handleTouchEnd };
}
