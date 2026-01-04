import { useRef, useEffect, useCallback } from 'react';

interface UsePinchZoomOptions {
  onZoom: (scale: number) => void;
  currentScale: number;
  minScale?: number;
  maxScale?: number;
  enabled?: boolean;
}

export function usePinchZoom({
  onZoom,
  currentScale,
  minScale = 0.25,
  maxScale = 3,
  enabled = true,
}: UsePinchZoomOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);

  const getDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return;
    
    initialDistance.current = getDistance(e.touches);
    initialScale.current = currentScale;
  }, [enabled, currentScale, getDistance]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return;
    
    const currentDistance = getDistance(e.touches);
    if (initialDistance.current === 0) return;
    
    const scaleFactor = currentDistance / initialDistance.current;
    let newScale = initialScale.current * scaleFactor;
    
    // Clamp scale within bounds
    newScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    // Round to 2 decimal places for smoother updates
    newScale = Math.round(newScale * 100) / 100;
    
    onZoom(newScale);
    
    // Prevent default to avoid page zoom
    e.preventDefault();
  }, [enabled, getDistance, minScale, maxScale, onZoom]);

  const handleTouchEnd = useCallback(() => {
    initialDistance.current = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef };
}
