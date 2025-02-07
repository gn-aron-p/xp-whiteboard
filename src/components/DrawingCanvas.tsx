import React, { useEffect, useRef, useState } from 'react';
import { useDrawing } from '../hooks/useDrawing';
import { useZoomPan } from '../hooks/useZoomPan';
import Toolbar from './ToolBar';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [currentStyle, setCurrentStyle] = useState('solid');
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Setup canvas context with proper pixel ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      setCtx(context);
    }
  }, []);

  // Use zoom/pan hook, initialize with pixel ratio adjustment if needed
  const { scale, translate, handleTouchMove, handleTouchEnd } = useZoomPan(1 / pixelRatio);

  // Apply drawing style whenever ctx or currentStyle changes
  useEffect(() => {
    if (!ctx) return;
    switch (currentStyle) {
      case 'solid':
        ctx.setLineDash([]);
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'black';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        break;
      case 'dashed':
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'black';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        break;
      case 'calligraphy':
        ctx.setLineDash([]);
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = 0.7;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        break;
      case 'neon':
        ctx.setLineDash([]);
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'cyan';
        ctx.shadowColor = 'cyan';
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 1;
        break;
      default:
        break;
    }
  }, [ctx, currentStyle]);

  const changeStyle = (style: string) => setCurrentStyle(style);

  // Always call useDrawing (it handles null ctx internally)
  const { startDrawing, draw, stopDrawing } = useDrawing(ctx, scale, translate.x, translate.y);

  return (
    <div>
      <Toolbar currentStyle={currentStyle} onChangeStyle={changeStyle} />
      <canvas
        ref={canvasRef}
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) draw(e);
          if (e.touches.length === 2) handleTouchMove(e);
        }}
        onTouchEnd={(e) => { handleTouchEnd(); stopDrawing(); }}
      />
    </div>
  );
};

export default DrawingCanvas;
