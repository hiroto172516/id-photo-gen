interface CameraControlsProps {
  onCapture: () => void;
  onSwitch: () => void;
  isLoading: boolean;
}

export function CameraControls({ onCapture, onSwitch, isLoading }: CameraControlsProps) {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8">
      {/* カメラ切替ボタン */}
      <button
        onClick={onSwitch}
        disabled={isLoading}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50"
        aria-label="カメラを切り替える"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* シャッターボタン */}
      <button
        onClick={onCapture}
        disabled={isLoading}
        className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50"
        aria-label="撮影する"
      >
        <div className="h-14 w-14 rounded-full bg-white" />
      </button>

      {/* スペーサー（対称レイアウト用） */}
      <div className="h-12 w-12" />
    </div>
  );
}
