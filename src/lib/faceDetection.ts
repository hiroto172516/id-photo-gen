'use client';

import type { PhotoSpecId } from './photoSpecs';

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  box: FaceBox;
  confidence: number;
}

declare global {
  interface Window {
    __mockFaceDetectionResult?: FaceDetectionResult | null;
  }
}

let detectorPromise: Promise<{
  detect: (image: HTMLImageElement | HTMLCanvasElement) => Promise<FaceDetectionResult | null>;
}> | null = null;

const TFLITE_INFO_LOG_PATTERN = /Created TensorFlow Lite XNNPACK delegate for CPU\./;

function createConsoleMethodSuppressor<T extends keyof Console>(methodName: T) {
  const originalMethod = console[methodName];

  if (typeof originalMethod !== 'function') {
    return null;
  }

  return (...args: unknown[]) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && TFLITE_INFO_LOG_PATTERN.test(firstArg)) {
      return;
    }

    (originalMethod as (...nextArgs: unknown[]) => void).apply(console, args);
  };
}

async function withSuppressedTfliteInfoLog<T>(callback: () => Promise<T> | T) {
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  const nextInfo = createConsoleMethodSuppressor('info');
  const nextWarn = createConsoleMethodSuppressor('warn');
  const nextError = createConsoleMethodSuppressor('error');
  const nextLog = createConsoleMethodSuppressor('log');

  if (nextInfo) {
    console.info = nextInfo;
  }
  if (nextWarn) {
    console.warn = nextWarn;
  }
  if (nextError) {
    console.error = nextError;
  }
  if (nextLog) {
    console.log = nextLog;
  }

  try {
    return await callback();
  } finally {
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
    console.log = originalLog;
  }
}

async function createDetector() {
  const { FaceDetector, FilesetResolver } = await withSuppressedTfliteInfoLog(() =>
    import('@mediapipe/tasks-vision')
  );

  const fileset = await withSuppressedTfliteInfoLog(() =>
    FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm')
  );

  const detector = await withSuppressedTfliteInfoLog(() =>
    FaceDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite',
        delegate: 'CPU',
      },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5,
    })
  );

  return {
    async detect(image: HTMLImageElement | HTMLCanvasElement) {
      const result = await withSuppressedTfliteInfoLog(() => detector.detect(image));
      const detection = result.detections[0];

      if (!detection?.boundingBox) {
        return null;
      }

      const { originX, originY, width, height } = detection.boundingBox;
      return {
        box: {
          x: originX,
          y: originY,
          width,
          height,
        },
        confidence: detection.categories[0]?.score ?? 0,
      };
    },
  };
}

function getDetector() {
  if (!detectorPromise) {
    detectorPromise = createDetector();
  }

  return detectorPromise;
}

export function preloadFaceDetector() {
  if (typeof window === 'undefined') {
    return null;
  }

  return getDetector();
}

export async function detectPrimaryFace(image: HTMLImageElement | HTMLCanvasElement) {
  if (typeof window === 'undefined') {
    return null;
  }

  if ('__mockFaceDetectionResult' in window) {
    return window.__mockFaceDetectionResult ?? null;
  }

  try {
    const detector = await getDetector();
    return await detector.detect(image);
  } catch {
    return null;
  }
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropMetadata {
  specId: PhotoSpecId;
  specLabel: string;
  faceDetected: boolean;
  usedFallback: boolean;
  faceConfidence: number | null;
  cropRect: CropRect;
}
