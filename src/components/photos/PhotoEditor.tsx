'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface PhotoEditorProps {
  dataUrl: string;
  onSave: (editedDataUrl: string) => void;
  onCancel: () => void;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function PhotoEditor({ dataUrl, onSave, onCancel }: PhotoEditorProps) {
  const t = useTranslations();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Rect | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [imgScale, setImgScale] = useState(1);
  const [brushMode, setBrushMode] = useState<'rect' | 'brush'>('rect');
  const [brushRadius, setBrushRadius] = useState(20);
  // For brush strokes: store them as small rects
  const [brushStrokes, setBrushStrokes] = useState<Rect[]>([]);
  const isBrushing = useRef(false);

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Fit into available screen space (max 90vw x 70vh)
      const maxW = window.innerWidth * 0.9;
      const maxH = window.innerHeight * 0.65;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      setImgScale(scale);
      setCanvasSize({
        w: Math.round(img.width * scale),
        h: Math.round(img.height * scale),
      });
    };
    img.src = dataUrl;
  }, [dataUrl]);

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw image
    ctx.drawImage(img, 0, 0, canvasSize.w, canvasSize.h);

    // Draw all saved rects
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }

    // Draw all brush strokes
    for (const s of brushStrokes) {
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw current rect being drawn
    if (currentRect) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      // Dashed border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      ctx.setLineDash([]);
    }
  }, [canvasSize, rects, brushStrokes, currentRect]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function getPos(e: React.TouchEvent | React.MouseEvent): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }

  function handleStart(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    const pos = getPos(e);

    if (brushMode === 'brush') {
      isBrushing.current = true;
      const r = brushRadius;
      setBrushStrokes((prev) => [
        ...prev,
        { x: pos.x - r, y: pos.y - r, w: r * 2, h: r * 2 },
      ]);
    } else {
      setDrawing(true);
      setStartPos(pos);
    }
  }

  function handleMove(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    const pos = getPos(e);

    if (brushMode === 'brush' && isBrushing.current) {
      const r = brushRadius;
      setBrushStrokes((prev) => [
        ...prev,
        { x: pos.x - r, y: pos.y - r, w: r * 2, h: r * 2 },
      ]);
    } else if (drawing && startPos) {
      setCurrentRect({
        x: Math.min(pos.x, startPos.x),
        y: Math.min(pos.y, startPos.y),
        w: Math.abs(pos.x - startPos.x),
        h: Math.abs(pos.y - startPos.y),
      });
    }
  }

  function handleEnd(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();

    if (brushMode === 'brush') {
      isBrushing.current = false;
    } else if (drawing && currentRect && currentRect.w > 5 && currentRect.h > 5) {
      setRects((prev) => [...prev, currentRect]);
      setCurrentRect(null);
      setDrawing(false);
      setStartPos(null);
    } else {
      setCurrentRect(null);
      setDrawing(false);
      setStartPos(null);
    }
  }

  function handleUndo() {
    if (brushMode === 'brush' && brushStrokes.length > 0) {
      // Remove last ~20 brush strokes (one drag)
      setBrushStrokes((prev) => prev.slice(0, Math.max(0, prev.length - 20)));
    } else if (rects.length > 0) {
      setRects((prev) => prev.slice(0, -1));
    }
  }

  function handleClearAll() {
    setRects([]);
    setBrushStrokes([]);
  }

  function handleSave() {
    const img = imgRef.current;
    if (!img) return;

    // Render at full resolution
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = img.width;
    fullCanvas.height = img.height;
    const ctx = fullCanvas.getContext('2d');
    if (!ctx) return;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Scale factor from display to original
    const s = img.width / canvasSize.w;

    // Draw all rects at full resolution
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    for (const r of rects) {
      ctx.fillRect(r.x * s, r.y * s, r.w * s, r.h * s);
    }

    // Draw all brush strokes at full resolution
    for (const stroke of brushStrokes) {
      ctx.beginPath();
      ctx.arc(
        (stroke.x + stroke.w / 2) * s,
        (stroke.y + stroke.h / 2) * s,
        (stroke.w / 2) * s,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Export as JPEG
    const editedUrl = fullCanvas.toDataURL('image/jpeg', 0.85);
    onSave(editedUrl);
  }

  if (canvasSize.w === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <p className="text-white">Loading…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 w-full max-w-lg">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#555] rounded-lg"
        >
          {t('assessment.photoEditorCancel')}
        </button>
        <div className="flex-1" />

        {/* Mode toggle */}
        <button
          onClick={() => setBrushMode('rect')}
          className={`px-2 py-1.5 text-[10px] font-semibold rounded-lg border ${
            brushMode === 'rect'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-white/40'
          }`}
        >
          ▬ {t('assessment.photoEditorRect')}
        </button>
        <button
          onClick={() => setBrushMode('brush')}
          className={`px-2 py-1.5 text-[10px] font-semibold rounded-lg border ${
            brushMode === 'brush'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-white/40'
          }`}
        >
          ● {t('assessment.photoEditorBrush')}
        </button>
      </div>

      {/* Brush size slider (only for brush mode) */}
      {brushMode === 'brush' && (
        <div className="flex items-center gap-2 px-3 pb-1 w-full max-w-lg">
          <span className="text-[10px] text-white/70">{t('assessment.photoEditorSize')}</span>
          <input
            type="range"
            min={8}
            max={50}
            value={brushRadius}
            onChange={(e) => setBrushRadius(Number(e.target.value))}
            className="flex-1 h-1 accent-white"
          />
        </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="rounded-lg touch-none"
          style={{ width: canvasSize.w, height: canvasSize.h }}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 w-full max-w-lg">
        <button
          onClick={handleUndo}
          disabled={rects.length === 0 && brushStrokes.length === 0}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#555] rounded-lg disabled:opacity-30"
        >
          ↩ {t('actions.undo')}
        </button>
        <button
          onClick={handleClearAll}
          disabled={rects.length === 0 && brushStrokes.length === 0}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#555] rounded-lg disabled:opacity-30"
        >
          {t('actions.clear')}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#c95a8a] rounded-lg hover:bg-[#b44d7a]"
        >
          {t('assessment.photoEditorDone')}
        </button>
      </div>

      {/* Instructions */}
      <p className="text-[10px] text-white/50 px-3 text-center mt-1">
        {t('assessment.photoEditorHelp')}
      </p>
    </div>
  );
}
