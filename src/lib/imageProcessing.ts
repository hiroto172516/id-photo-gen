'use client';

import { getAllowedUploadMimeTypes, getMaxUploadFileSize } from '@/lib/uploadPolicy';

export interface ProcessedImage {
  previewUrl: string;
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
}

const MAX_IMAGE_EDGE = 1600;
const OUTPUT_MIME_TYPE = 'image/jpeg';
const OUTPUT_QUALITY = 0.9;

function validateProcessedBlob(blob: Blob) {
  if (!getAllowedUploadMimeTypes().includes(blob.type as 'image/jpeg')) {
    throw new Error('JPEG 形式の画像のみアップロードできます。');
  }

  if (blob.size <= 0 || blob.size > getMaxUploadFileSize()) {
    throw new Error('ファイルサイズは10MB以下にしてください。');
  }
}

function readUint16(view: DataView, offset: number, littleEndian = false) {
  return view.getUint16(offset, littleEndian);
}

function getExifOrientation(buffer: ArrayBuffer) {
  const view = new DataView(buffer);

  if (view.byteLength < 4 || readUint16(view, 0) !== 0xffd8) {
    return 1;
  }

  let offset = 2;

  while (offset + 4 <= view.byteLength) {
    const marker = readUint16(view, offset);
    offset += 2;

    if (marker === 0xffda || marker === 0xffd9) {
      break;
    }

    const segmentLength = readUint16(view, offset);
    if (segmentLength < 2 || offset + segmentLength > view.byteLength) {
      break;
    }

    if (marker === 0xffe1 && segmentLength >= 8) {
      const exifOffset = offset + 2;
      if (
        view.getUint32(exifOffset, false) === 0x45786966 &&
        view.getUint16(exifOffset + 4, false) === 0x0000
      ) {
        const tiffOffset = exifOffset + 6;
        const byteOrder = view.getUint16(tiffOffset, false);
        const littleEndian = byteOrder === 0x4949;

        if (!littleEndian && byteOrder !== 0x4d4d) {
          return 1;
        }

        const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
        const ifdStart = tiffOffset + firstIfdOffset;

        if (ifdStart + 2 > view.byteLength) {
          return 1;
        }

        const entryCount = view.getUint16(ifdStart, littleEndian);

        for (let i = 0; i < entryCount; i += 1) {
          const entryOffset = ifdStart + 2 + i * 12;
          if (entryOffset + 12 > view.byteLength) {
            break;
          }

          const tag = view.getUint16(entryOffset, littleEndian);
          if (tag === 0x0112) {
            const orientation = view.getUint16(entryOffset + 8, littleEndian);
            return orientation >= 1 && orientation <= 8 ? orientation : 1;
          }
        }
      }
    }

    offset += segmentLength;
  }

  return 1;
}

function getJpegDimensions(buffer: ArrayBuffer) {
  const view = new DataView(buffer);

  if (view.byteLength < 4 || readUint16(view, 0) !== 0xffd8) {
    return null;
  }

  let offset = 2;

  while (offset + 4 <= view.byteLength) {
    const marker = readUint16(view, offset);
    offset += 2;

    if (marker === 0xffd8 || marker === 0xffd9) {
      continue;
    }

    if (marker === 0xffda) {
      break;
    }

    const segmentLength = readUint16(view, offset);
    if (segmentLength < 2 || offset + segmentLength > view.byteLength) {
      break;
    }

    const isStartOfFrame =
      marker >= 0xffc0 &&
      marker <= 0xffcf &&
      marker !== 0xffc4 &&
      marker !== 0xffc8 &&
      marker !== 0xffcc;

    if (isStartOfFrame && offset + 7 <= view.byteLength) {
      return {
        height: readUint16(view, offset + 3),
        width: readUint16(view, offset + 5),
      };
    }

    offset += segmentLength;
  }

  return null;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    image.src = src;
  });
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

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('画像プレビューの生成に失敗しました'));
    reader.readAsDataURL(blob);
  });
}

function getTargetSize(width: number, height: number) {
  const longestEdge = Math.max(width, height);

  if (longestEdge <= MAX_IMAGE_EDGE) {
    return { width, height };
  }

  const scale = MAX_IMAGE_EDGE / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function drawOrientedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  orientation: number,
  width: number,
  height: number
) {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      break;
  }

  ctx.drawImage(image, 0, 0, width, height);
}

export async function processUploadedImage(file: File): Promise<ProcessedImage> {
  const buffer = await file.arrayBuffer();
  const orientation = file.type === 'image/jpeg' ? getExifOrientation(buffer) : 1;
  const jpegDimensions = file.type === 'image/jpeg' ? getJpegDimensions(buffer) : null;
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const browserAlreadyAppliedOrientation =
      orientation >= 5 &&
      orientation <= 8 &&
      jpegDimensions !== null &&
      image.width === jpegDimensions.height &&
      image.height === jpegDimensions.width;
    const effectiveOrientation = browserAlreadyAppliedOrientation ? 1 : orientation;
    const shouldSwapDimensions = [5, 6, 7, 8].includes(effectiveOrientation);
    const sourceWidth = jpegDimensions?.width ?? image.width;
    const sourceHeight = jpegDimensions?.height ?? image.height;
    const normalizedWidth = shouldSwapDimensions ? sourceHeight : image.width;
    const normalizedHeight = shouldSwapDimensions ? sourceWidth : image.height;
    const targetSize = getTargetSize(normalizedWidth, normalizedHeight);
    const canvas = document.createElement('canvas');

    canvas.width = targetSize.width;
    canvas.height = targetSize.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas API を利用できませんでした');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const drawWidth = shouldSwapDimensions ? targetSize.height : targetSize.width;
    const drawHeight = shouldSwapDimensions ? targetSize.width : targetSize.height;

    drawOrientedImage(ctx, image, effectiveOrientation, drawWidth, drawHeight);

    const blob = await canvasToBlob(canvas, OUTPUT_MIME_TYPE, OUTPUT_QUALITY);
    validateProcessedBlob(blob);
    const previewUrl = await blobToDataUrl(blob);

    return {
      previewUrl,
      blob,
      width: targetSize.width,
      height: targetSize.height,
      mimeType: OUTPUT_MIME_TYPE,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function createProcessedImageFromDataUrl(dataUrl: string): Promise<ProcessedImage> {
  const image = await loadImage(dataUrl);
  const targetSize = getTargetSize(image.width, image.height);
  const canvas = document.createElement('canvas');

  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas API を利用できませんでした');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);

  const blob = await canvasToBlob(canvas, OUTPUT_MIME_TYPE, OUTPUT_QUALITY);
  validateProcessedBlob(blob);
  const previewUrl = await blobToDataUrl(blob);

  return {
    previewUrl,
    blob,
    width: targetSize.width,
    height: targetSize.height,
    mimeType: OUTPUT_MIME_TYPE,
  };
}
