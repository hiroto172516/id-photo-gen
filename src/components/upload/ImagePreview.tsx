interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRetake?: () => void;
  onUse?: () => void;
  retakeLabel?: string;
  useLabel?: string;
  metaLabel?: string;
  isRetakeDisabled?: boolean;
  isUseDisabled?: boolean;
}

export function ImagePreview({
  src,
  alt = 'プレビュー',
  onRetake,
  onUse,
  retakeLabel = '選び直す',
  useLabel = 'この写真を使う',
  metaLabel,
  isRetakeDisabled = false,
  isUseDisabled = false,
}: ImagePreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        data-testid="image-preview"
        className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>

      {metaLabel && (
        <p data-testid="image-preview-meta" className="text-center text-xs font-medium text-zinc-500">
          {metaLabel}
        </p>
      )}

      {(onRetake || onUse) && (
        <div className="flex w-full max-w-sm gap-3">
          {onRetake && (
            <button
              data-testid="retake-button"
              onClick={onRetake}
              disabled={isRetakeDisabled}
              className="flex-1 rounded-full border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {retakeLabel}
            </button>
          )}
          {onUse && (
            <button
              data-testid="use-photo-button"
              onClick={onUse}
              disabled={isUseDisabled}
              className="flex-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-md"
            >
              {useLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
