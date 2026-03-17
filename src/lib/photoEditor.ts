import type { CropRect } from './faceDetection';
import { getFallbackCropRect } from './photoCrop';

const MAX_MANUAL_ZOOM = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export interface ManualCropState {
  centerX: number;
  centerY: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface PhotoEditorState {
  sourceUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  aspectRatio: number;
  baseCropRect: CropRect;
  manualCrop: ManualCropState;
}

export function createManualCropState(
  sourceWidth: number,
  sourceHeight: number,
  aspectRatio: number,
  baseCropRect: CropRect
): ManualCropState {
  const maxViewportRect = getFallbackCropRect(sourceWidth, sourceHeight, aspectRatio);
  const minZoom = clamp(baseCropRect.width / maxViewportRect.width, 0.35, 1);

  return {
    centerX: baseCropRect.x + baseCropRect.width / 2,
    centerY: baseCropRect.y + baseCropRect.height / 2,
    zoom: 1,
    minZoom,
    maxZoom: MAX_MANUAL_ZOOM,
  };
}

export function clampManualCropState(
  sourceWidth: number,
  sourceHeight: number,
  aspectRatio: number,
  baseCropRect: CropRect,
  manualCrop: ManualCropState
): ManualCropState {
  const minZoom = clamp(manualCrop.minZoom, 0.35, 1);
  const maxZoom = Math.max(manualCrop.maxZoom, 1);
  const zoom = clamp(manualCrop.zoom, minZoom, maxZoom);
  const cropRect = getCropRectFromManualCrop(
    sourceWidth,
    sourceHeight,
    aspectRatio,
    baseCropRect,
    { ...manualCrop, zoom, minZoom, maxZoom }
  );

  return {
    centerX: cropRect.x + cropRect.width / 2,
    centerY: cropRect.y + cropRect.height / 2,
    zoom,
    minZoom,
    maxZoom,
  };
}

export function getCropRectFromManualCrop(
  sourceWidth: number,
  sourceHeight: number,
  aspectRatio: number,
  baseCropRect: CropRect,
  manualCrop: ManualCropState
): CropRect {
  const zoom = clamp(manualCrop.zoom, manualCrop.minZoom, manualCrop.maxZoom);
  const width = Math.min(sourceWidth, baseCropRect.width / zoom);
  const height = Math.min(sourceHeight, width / aspectRatio);
  const fittedWidth = Math.min(sourceWidth, height * aspectRatio);
  const fittedHeight = Math.min(sourceHeight, fittedWidth / aspectRatio);
  const x = clamp(manualCrop.centerX - fittedWidth / 2, 0, Math.max(0, sourceWidth - fittedWidth));
  const y = clamp(manualCrop.centerY - fittedHeight / 2, 0, Math.max(0, sourceHeight - fittedHeight));

  return {
    x,
    y,
    width: fittedWidth,
    height: fittedHeight,
  };
}

export function createPhotoEditorState(
  sourceUrl: string,
  sourceWidth: number,
  sourceHeight: number,
  aspectRatio: number,
  baseCropRect: CropRect
): PhotoEditorState {
  return {
    sourceUrl,
    sourceWidth,
    sourceHeight,
    aspectRatio,
    baseCropRect,
    manualCrop: createManualCropState(sourceWidth, sourceHeight, aspectRatio, baseCropRect),
  };
}

export function formatManualCropZoom(zoom: number) {
  return `${Math.round(zoom * 100)}%`;
}

export function getManualCropOffsetPercent(
  sourceWidth: number,
  sourceHeight: number,
  baseCropRect: CropRect,
  manualCrop: ManualCropState
) {
  const baseCenterX = baseCropRect.x + baseCropRect.width / 2;
  const baseCenterY = baseCropRect.y + baseCropRect.height / 2;

  return {
    x: Math.round(((manualCrop.centerX - baseCenterX) / sourceWidth) * 100),
    y: Math.round(((manualCrop.centerY - baseCenterY) / sourceHeight) * 100),
  };
}

export function isSameManualCropState(a: ManualCropState, b: ManualCropState) {
  return (
    Math.abs(a.centerX - b.centerX) < 0.5 &&
    Math.abs(a.centerY - b.centerY) < 0.5 &&
    Math.abs(a.zoom - b.zoom) < 0.001 &&
    Math.abs(a.minZoom - b.minZoom) < 0.001 &&
    Math.abs(a.maxZoom - b.maxZoom) < 0.001
  );
}
