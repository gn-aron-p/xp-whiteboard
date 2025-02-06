import '../styles/global.scss';
import '../styles/global.css';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
  const buttonsContainer = document.getElementById('buttonsContainer');

  if (!canvas || !buttonsContainer) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Canvas Setup
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let drawing = false;
  let currentStyle = 'solid';
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let lastTouchDistance = 0;
  let lastPanX = 0, lastPanY = 0;

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  const styles = {
    solid: () => {
      ctx.setLineDash([]);
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'black';
      ctx.shadowBlur = 0;
    },
    dashed: () => {
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'black';
      ctx.shadowBlur = 0;
    },
    calligraphy: () => {
      ctx.setLineDash([]);
      ctx.lineWidth = 12;
      ctx.strokeStyle = 'black';
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
    },
    neon: () => {
      ctx.setLineDash([]);
      ctx.lineWidth = 8;
      ctx.strokeStyle = 'cyan';
      ctx.shadowColor = 'cyan';
      ctx.shadowBlur = 15;
    },
  };

  function applyStyle(style: string) {
    currentStyle = style;
    styles[style]();
  }

  function startDrawing(e: MouseEvent | TouchEvent) {
    // Skip if multi-touch (pinching)
    if (e instanceof TouchEvent && e.touches.length > 1) return;
    drawing = true;
    const pos = getPosition(e);
    if (!pos) return;
    ctx.beginPath(); // Reset path to prevent connecting lines
    ctx.moveTo(pos.x, pos.y);
  }

  function stopDrawing() {
    drawing = false;
    ctx.beginPath();
  }

  function getPosition(e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent) {
      return { x: (e.clientX - translateX) / scale, y: (e.clientY - translateY) / scale };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      return { x: (touch.clientX - translateX) / scale, y: (touch.clientY - translateY) / scale };
    }
    return null;
  }

  function draw(e: MouseEvent | TouchEvent) {
    if (!drawing) return;
    // Skip drawing if more than one touch
    if (e instanceof TouchEvent && e.touches.length > 1) return;
    const pos = getPosition(e);
    if (!pos) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  // Multi-Touch Handlers
  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const [touch1, touch2] = e.touches;

      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance) {
        const deltaDistance = currentDistance - lastTouchDistance;
        scale += deltaDistance * 0.005;
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
      }

      lastTouchDistance = currentDistance;

      const currentPanX = (touch1.clientX + touch2.clientX) / 2;
      const currentPanY = (touch1.clientY + touch2.clientY) / 2;

      if (lastPanX && lastPanY) {
        translateX += currentPanX - lastPanX;
        translateY += currentPanY - lastPanY;
      }

      lastPanX = currentPanX;
      lastPanY = currentPanY;

      redraw();
    }
  }

  function handleTouchEnd() {
    lastTouchDistance = 0;
    lastPanX = 0;
    lastPanY = 0;
  }

  function redraw() {
    ctx.setTransform(scale, 0, 0, scale, translateX, translateY);
    ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
  }

  // Event Listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
  });
  canvas.addEventListener('touchmove', (e) => {
    // For pinch gestures, handleTouchMove will update zoom/pan
    if (e.touches.length === 1) draw(e);
    if (e.touches.length === 2) handleTouchMove(e);
  });
canvas.addEventListener('touchend', handleTouchEnd);

  // Buttons
  Object.keys(styles).forEach((style) => {
    const button = document.createElement('button');
    button.textContent = style.charAt(0).toUpperCase() + style.slice(1);
    button.onclick = () => applyStyle(style);
    buttonsContainer.appendChild(button);
  });

  applyStyle('solid');
});
