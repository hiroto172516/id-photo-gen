import type { CropMetadata, CropRect, FaceDetectionResult } from './faceDetection';
import { getPhotoSpecPreset, type PhotoSpecId } from './photoSpecs';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function fitRectWithinImage(rect: CropRect, imageWidth: number, imageHeight: number) {
  const width = Math.min(rect.width, imageWidth);
  const height = Math.min(rect.height, imageHeight);
  const maxX = Math.max(0, imageWidth - width);
  const maxY = Math.max(0, imageHeight - height);

  return {
    x: clamp(rect.x, 0, maxX),
    y: clamp(rect.y, 0, maxY),
    width,
    height,
  };
}

export function getFallbackCropRect(imageWidth: number, imageHeight: number, aspectRatio: number): CropRect {
  const imageAspectRatio = imageWidth / imageHeight;

  if (imageAspectRatio > aspectRatio) {
    const height = imageHeight;
    const width = height * aspectRatio;
    return {
      x: (imageWidth - width) / 2,
      y: 0,
      width,
      height,
    };
  }

  const width = imageWidth;
  const height = width / aspectRatio;
  return {
    x: 0,
    y: (imageHeight - height) / 2,
    width,
    height,
  };
}

export function calculatePhotoCrop(
  imageWidth: number,
  imageHeight: number,
  specId: PhotoSpecId,
  faceDetection: FaceDetectionResult | null
): CropMetadata {
  const spec = getPhotoSpecPreset(specId);
  const aspectRatio = spec.widthMm / spec.heightMm;

  if (!faceDetection) {
    return {
      specId,
      specLabel: spec.label,
      faceDetected: false,
      usedFallback: true,
      faceConfidence: null,
      cropRect: getFallbackCropRect(imageWidth, imageHeight, aspectRatio),
    };
  }

  const faceHeight = Math.max(faceDetection.box.height, imageHeight * 0.18);
  const targetHeight = Math.min(imageHeight, faceHeight / spec.headHeightRatio);
  const targetWidth = Math.min(imageWidth, targetHeight * aspectRatio);
  const rawRect = {
    x: faceDetection.box.x + faceDetection.box.width / 2 - targetWidth / 2,
    y: faceDetection.box.y - targetHeight * spec.topMarginRatio,
    width: targetWidth,
    height: targetHeight,
  };
  const fittedRect = fitRectWithinImage(rawRect, imageWidth, imageHeight);
  const actualAspectRatio = fittedRect.width / fittedRect.height;

  if (Math.abs(actualAspectRatio - aspectRatio) > 0.02) {
    const fallbackRect = getFallbackCropRect(imageWidth, imageHeight, aspectRatio);
    return {
      specId,
      specLabel: spec.label,
      faceDetected: true,
      usedFallback: true,
      faceConfidence: faceDetection.confidence,
      cropRect: fallbackRect,
    };
  }

  return {
    specId,
    specLabel: spec.label,
    faceDetected: true,
    usedFallback: false,
    faceConfidence: faceDetection.confidence,
    cropRect: fittedRect,
  };
}
