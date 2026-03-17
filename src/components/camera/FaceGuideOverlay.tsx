export function FaceGuideOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg
        data-testid="face-guide-overlay"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="face-guide-mask">
            {/* マスク全体を白で塗りつぶす（表示領域） */}
            <rect width="100" height="100" fill="white" />
            {/* 楕円部分を黒で塗りつぶす（穴） */}
            <ellipse cx="50" cy="45" rx="22" ry="30" fill="black" />
          </mask>
        </defs>
        {/* 半透明オーバーレイ（楕円の穴あき） */}
        <rect
          width="100"
          height="100"
          fill="rgba(0,0,0,0.45)"
          mask="url(#face-guide-mask)"
        />
        {/* 楕円の枠線 */}
        <ellipse
          cx="50"
          cy="45"
          rx="22"
          ry="30"
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          strokeDasharray="3 1.5"
          className="animate-pulse"
        />
      </svg>
      {/* ガイドテキスト */}
      <p className="absolute bottom-[18%] left-0 right-0 text-center text-sm font-medium text-white drop-shadow-md">
        顔をここに合わせてください
      </p>
    </div>
  );
}
