'use client';

import type { BackgroundSettings } from './backgroundOptions';

export interface BackgroundProcessingMetadata {
  colorHex: string;
  colorLabel: string;
  removalApplied: boolean;
  usedFallback: boolean;
  engine: 'imgly-browser-wasm' | 'mock' | 'none';
}

declare global {
  interface Window {
    __mockBackgroundRemovalMode?: 'success' | 'failure';
  }
}

let removeBackgroundPromise: Promise<
  (imageSource: Blob, config?: Record<string, unknown>) => Promise<Blob>
> | null = null;
type RemoveBackgroundFn = (imageSource: Blob, config?: Record<string, unknown>) => Promise<Blob>;

async function getRemoveBackground() {
  if (!removeBackgroundPromise) {
    removeBackgroundPromise = import('@imgly/background-removal').then((module) => {
      const removeBackground = ('default' in module ? module.default : module) as unknown as RemoveBackgroundFn;
      return removeBackground;
    });
  }

  return removeBackgroundPromise;
}

export function preloadBackgroundRemoval() {
  if (typeof window === 'undefined') {
    return null;
  }

  return getRemoveBackground();
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('画像の書き出しに失敗しました'));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    image.src = src;
  });
}

async function blobToObjectUrl(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(objectUrl);
    return { image, objectUrl };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export async function applyBackgroundRemoval(
  sourceCanvas: HTMLCanvasElement,
  backgroundSettings: BackgroundSettings
): Promise<{ canvas: HTMLCanvasElement; metadata: BackgroundProcessingMetadata }> {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;

  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) {
    throw new Error('Canvas API を利用できませんでした');
  }

  outputCtx.fillStyle = backgroundSettings.colorHex;
  outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

  if (typeof window !== 'undefined' && window.__mockBackgroundRemovalMode === 'success') {
    outputCtx.drawImage(sourceCanvas, 0, 0);
    return {
      canvas: outputCanvas,
      metadata: {
        colorHex: backgroundSettings.colorHex,
        colorLabel: backgroundSettings.label,
        removalApplied: true,
        usedFallback: false,
        engine: 'mock',
      },
    };
  }

  if (typeof window !== 'undefined' && window.__mockBackgroundRemovalMode === 'failure') {
    outputCtx.drawImage(sourceCanvas, 0, 0);
    return {
      canvas: outputCanvas,
      metadata: {
        colorHex: backgroundSettings.colorHex,
        colorLabel: backgroundSettings.label,
        removalApplied: false,
        usedFallback: true,
        engine: 'mock',
      },
    };
  }

  try {
    const removeBackground = await getRemoveBackground();
    const inputBlob = await canvasToBlob(sourceCanvas, 'image/png');
    const foregroundBlob = await removeBackground(inputBlob, {
      device: 'cpu',
      model: 'isnet_quint8',
      output: {
        format: 'image/png',
        quality: 0.9,
        type: 'foreground',
      },
    });
    const { image, objectUrl } = await blobToObjectUrl(foregroundBlob);

    try {
      outputCtx.drawImage(image, 0, 0, outputCanvas.width, outputCanvas.height);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    return {
      canvas: outputCanvas,
      metadata: {
        colorHex: backgroundSettings.colorHex,
        colorLabel: backgroundSettings.label,
        removalApplied: true,
        usedFallback: false,
        engine: 'imgly-browser-wasm',
      },
    };
  } catch {
    outputCtx.drawImage(sourceCanvas, 0, 0);

    return {
      canvas: outputCanvas,
      metadata: {
        colorHex: backgroundSettings.colorHex,
        colorLabel: backgroundSettings.label,
        removalApplied: false,
        usedFallback: true,
        engine: 'none',
      },
    };
  }
}
