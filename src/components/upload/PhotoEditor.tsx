'use client';

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import {
  formatManualCropZoom,
  getManualCropOffsetPercent,
  type ManualCropState,
} from '@/lib/photoEditor';
import { PreviewWatermark } from '@/components/upload/PreviewWatermark';

interface PhotoEditorProps {
  sourceUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  baseCropRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cropRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  manualCrop: ManualCropState;
  onManualCropChange: (manualCrop: ManualCropState) => void;
  onManualCropCommit: (manualCrop: ManualCropState) => void;
  onReset: () => void;
  showWatermark?: boolean;
}

type DragState = {
  pointerId: number;
  frameWidth: number;
  frameHeight: number;
  startCenterX: number;
  startCenterY: number;
  startClientX: number;
  startClientY: number;
};

export function PhotoEditor({
  sourceUrl,
  sourceWidth,
  sourceHeight,
  baseCropRect,
  cropRect,
  manualCrop,
  onManualCropChange,
  onManualCropCommit,
  onReset,
  showWatermark = false,
}: PhotoEditorProps) {
  const dragStateRef = useRef<DragState | null>(null);
  const latestManualCropRef = useRef(manualCrop);
  useEffect(() => {
    latestManualCropRef.current = manualCrop;
  }, [manualCrop]);
  const offset = getManualCropOffsetPercent(sourceWidth, sourceHeight, baseCropRect, manualCrop);
  const imageWidthPercent = (sourceWidth / cropRect.width) * 100;
  const imageHeightPercent = (sourceHeight / cropRect.height) * 100;
  const imageLeftPercent = -(cropRect.x / cropRect.width) * 100;
  const imageTopPercent = -(cropRect.y / cropRect.height) * 100;

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      frameWidth: rect.width,
      frameHeight: rect.height,
      startCenterX: manualCrop.centerX,
      startCenterY: manualCrop.centerY,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startClientX;
    const deltaY = event.clientY - dragState.startClientY;

    const nextManualCrop = {
      ...manualCrop,
      centerX: dragState.startCenterX - (deltaX * cropRect.width) / dragState.frameWidth,
      centerY: dragState.startCenterY - (deltaY * cropRect.height) / dragState.frameHeight,
    };
    latestManualCropRef.current = nextManualCrop;
    onManualCropChange(nextManualCrop);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    onManualCropCommit(latestManualCropRef.current);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section
      data-testid="photo-editor"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">トリミングを微調整</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            写真をドラッグして位置を動かし、ズームで顔の見え方を調整できます。
          </p>
        </div>
        <button
          type="button"
          data-testid="photo-editor-reset"
          onClick={onReset}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          自動調整に戻す
        </button>
      </div>

      <div
        data-testid="photo-editor-frame"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative mt-4 aspect-[3/4] w-full max-w-sm touch-none overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"
        style={{ aspectRatio: `${cropRect.width} / ${cropRect.height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sourceUrl}
          alt="トリミング調整中のプレビュー"
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{
            width: `${imageWidthPercent}%`,
            height: `${imageHeightPercent}%`,
            left: `${imageLeftPercent}%`,
            top: `${imageTopPercent}%`,
          }}
        />
        {showWatermark && <PreviewWatermark testId="photo-preview-watermark" />}
        <div className="pointer-events-none absolute inset-0 border-[10px] border-white/55" />
        <div className="pointer-events-none absolute inset-x-[12%] top-[12%] h-px border-t border-dashed border-white/80" />
        <div className="pointer-events-none absolute inset-x-[12%] bottom-[12%] h-px border-t border-dashed border-white/80" />
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-zinc-500">
            <span>ズーム</span>
            <span data-testid="photo-editor-zoom-value">{formatManualCropZoom(manualCrop.zoom)}</span>
          </div>
          <input
            data-testid="photo-editor-zoom"
            type="range"
            min={manualCrop.minZoom}
            max={manualCrop.maxZoom}
            step={0.01}
            value={manualCrop.zoom}
            onChange={(event) => {
              const nextManualCrop = {
                ...manualCrop,
                zoom: Number(event.target.value),
              };
              latestManualCropRef.current = nextManualCrop;
              onManualCropChange(nextManualCrop);
              onManualCropCommit(nextManualCrop);
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-blue-600"
          />
        </label>

        <div
          data-testid="photo-editor-summary"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600"
        >
          左右調整: <span data-testid="photo-editor-offset-x">{offset.x}%</span> / 上下調整:{' '}
          <span data-testid="photo-editor-offset-y">{offset.y}%</span>
        </div>
      </div>
    </section>
  );
}
