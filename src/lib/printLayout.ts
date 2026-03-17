'use client';

import type { OutputImageMimeType, ProcessedImage } from '@/lib/imageProcessing';
import { getPhotoSpecPreset } from '@/lib/photoSpecs';

const PRINT_DPI = 300;
const L_PRINT_WIDTH_MM = 89;
const L_PRINT_HEIGHT_MM = 127;
const MM_PER_INCH = 25.4;
const SHEET_PADDING_PX = 35;
const MIN_GAP_PX = 16;
const OUTPUT_MIME_TYPE = 'image/jpeg';
const OUTPUT_QUALITY = 0.95;

export interface LPrintLayoutOptions {
  cutLinesEnabled: boolean;
  mimeType?: OutputImageMimeType;
}

export interface LPrintPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LPrintLayoutResult {
  previewUrl: string;
  blob: Blob;
  mimeType: string;
  sheetWidthPx: number;
  sheetHeightPx: number;
  photoWidthPx: number;
  photoHeightPx: number;
  photoWidthMm: number;
  photoHeightMm: number;
  copyCount: number;
  columns: number;
  rows: number;
  cutLinesEnabled: boolean;
  placements: LPrintPlacement[];
}

function mmToPx(mm: number) {
  return Math.round((mm / MM_PER_INCH) * PRINT_DPI);
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
        reject(new Error('レイアウト画像の書き出しに失敗しました'));
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
    reader.onerror = () => reject(new Error('レイアウト画像のプレビュー生成に失敗しました'));
    reader.readAsDataURL(blob);
  });
}

function scorePlacement(
  copyCount: number,
  remainingWidth: number,
  remainingHeight: number,
  columns: number,
  rows: number
) {
  return (
    copyCount * 1_000_000 -
    Math.abs(remainingWidth - remainingHeight) * 100 -
    (remainingWidth + remainingHeight) -
    Math.abs(columns - rows) * 10
  );
}

function calculateOptimalLPrintPlacement(photoWidthPx: number, photoHeightPx: number) {
  const sheetWidthPx = mmToPx(L_PRINT_WIDTH_MM);
  const sheetHeightPx = mmToPx(L_PRINT_HEIGHT_MM);
  const availableWidth = sheetWidthPx - SHEET_PADDING_PX * 2;
  const availableHeight = sheetHeightPx - SHEET_PADDING_PX * 2;
  const maxColumns = Math.max(1, Math.floor((availableWidth + MIN_GAP_PX) / (photoWidthPx + MIN_GAP_PX)));
  const maxRows = Math.max(1, Math.floor((availableHeight + MIN_GAP_PX) / (photoHeightPx + MIN_GAP_PX)));

  let bestCandidate:
    | {
        columns: number;
        rows: number;
        remainingWidth: number;
        remainingHeight: number;
      }
    | null = null;

  for (let columns = 1; columns <= maxColumns; columns += 1) {
    for (let rows = 1; rows <= maxRows; rows += 1) {
      const requiredWidth = columns * photoWidthPx + (columns - 1) * MIN_GAP_PX;
      const requiredHeight = rows * photoHeightPx + (rows - 1) * MIN_GAP_PX;

      if (requiredWidth > availableWidth || requiredHeight > availableHeight) {
        continue;
      }

      const remainingWidth = availableWidth - requiredWidth;
      const remainingHeight = availableHeight - requiredHeight;
      const nextCandidate = {
        columns,
        rows,
        remainingWidth,
        remainingHeight,
      };

      if (!bestCandidate) {
        bestCandidate = nextCandidate;
        continue;
      }

      const nextCopyCount = columns * rows;
      const currentCopyCount = bestCandidate.columns * bestCandidate.rows;

      if (
        scorePlacement(
          nextCopyCount,
          remainingWidth,
          remainingHeight,
          columns,
          rows
        ) >
        scorePlacement(
          currentCopyCount,
          bestCandidate.remainingWidth,
          bestCandidate.remainingHeight,
          bestCandidate.columns,
          bestCandidate.rows
        )
      ) {
        bestCandidate = nextCandidate;
      }
    }
  }

  const placement = bestCandidate ?? {
    columns: 1,
    rows: 1,
    remainingWidth: Math.max(0, availableWidth - photoWidthPx),
    remainingHeight: Math.max(0, availableHeight - photoHeightPx),
  };

  const offsetX = SHEET_PADDING_PX + placement.remainingWidth / 2;
  const offsetY = SHEET_PADDING_PX + placement.remainingHeight / 2;
  const placements: LPrintPlacement[] = [];

  for (let row = 0; row < placement.rows; row += 1) {
    for (let column = 0; column < placement.columns; column += 1) {
      placements.push({
        x: Math.round(offsetX + column * (photoWidthPx + MIN_GAP_PX)),
        y: Math.round(offsetY + row * (photoHeightPx + MIN_GAP_PX)),
        width: photoWidthPx,
        height: photoHeightPx,
      });
    }
  }

  return {
    sheetWidthPx,
    sheetHeightPx,
    columns: placement.columns,
    rows: placement.rows,
    placements,
  };
}

function renderCutLines(ctx: CanvasRenderingContext2D, placements: LPrintPlacement[]) {
  ctx.save();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);

  for (const placement of placements) {
    ctx.strokeRect(placement.x, placement.y, placement.width, placement.height);
  }

  ctx.restore();
}

export async function generateLPrintLayout(
  processedImage: ProcessedImage,
  options: LPrintLayoutOptions
): Promise<LPrintLayoutResult> {
  const outputMimeType = options.mimeType ?? OUTPUT_MIME_TYPE;
  const spec = getPhotoSpecPreset(processedImage.cropMetadata.specId);
  const photoWidthPx = mmToPx(spec.widthMm);
  const photoHeightPx = mmToPx(spec.heightMm);
  const layout = calculateOptimalLPrintPlacement(photoWidthPx, photoHeightPx);
  const canvas = document.createElement('canvas');

  canvas.width = layout.sheetWidthPx;
  canvas.height = layout.sheetHeightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas API を利用できませんでした');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const photoImage = await loadImage(processedImage.previewUrl);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (const placement of layout.placements) {
    ctx.drawImage(photoImage, placement.x, placement.y, placement.width, placement.height);
  }

  if (options.cutLinesEnabled) {
    renderCutLines(ctx, layout.placements);
  }

  const blob = await canvasToBlob(
    canvas,
    outputMimeType,
    outputMimeType === 'image/jpeg' ? OUTPUT_QUALITY : undefined
  );
  const previewUrl = await blobToDataUrl(blob);

  return {
    previewUrl,
    blob,
    mimeType: outputMimeType,
    sheetWidthPx: layout.sheetWidthPx,
    sheetHeightPx: layout.sheetHeightPx,
    photoWidthPx,
    photoHeightPx,
    photoWidthMm: spec.widthMm,
    photoHeightMm: spec.heightMm,
    copyCount: layout.placements.length,
    columns: layout.columns,
    rows: layout.rows,
    cutLinesEnabled: options.cutLinesEnabled,
    placements: layout.placements,
  };
}
