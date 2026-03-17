import type { BackgroundPresetId } from '@/lib/backgroundOptions';
import type { OutputImageMimeType } from '@/lib/imageProcessing';
import type { PhotoSpecId } from '@/lib/photoSpecs';

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getFileExtensionFromMimeType(mimeType: OutputImageMimeType) {
  return mimeType === 'image/png' ? 'png' : 'jpg';
}

export function buildDownloadFileName(params: {
  specId: PhotoSpecId;
  backgroundPresetId: BackgroundPresetId;
  kind: 'single' | 'l-print';
  mimeType: OutputImageMimeType;
}) {
  const extension = getFileExtensionFromMimeType(params.mimeType);

  return [
    'id-photo',
    sanitizeSegment(params.specId),
    sanitizeSegment(params.backgroundPresetId),
    sanitizeSegment(params.kind),
  ].join('-') + `.${extension}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}
