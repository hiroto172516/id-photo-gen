'use client';

import { useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { FaceGuideOverlay } from './FaceGuideOverlay';
import { CameraControls } from './CameraControls';

interface CameraViewProps {
  onUsePhoto: (dataUrl: string) => void;
}

export function CameraView({ onUsePhoto }: CameraViewProps) {
  const { state, videoRef, canvasRef, startCamera, switchCamera, capture, retake } = useCamera();

  useEffect(() => {
    startCamera('user');
    // コンポーネントアンマウント時のクリーンアップはフック側で処理
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUse = () => {
    if (state.capturedImage) {
      onUsePhoto(state.capturedImage);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 aspect-[3/4] w-full max-w-sm mx-auto">
      {/* カメラプレビュー */}
      {state.mode === 'preview' && (
        <>
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="h-full w-full object-cover"
            style={state.facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
          />
          {state.isActive && <FaceGuideOverlay />}
          {state.isActive && (
            <CameraControls
              onCapture={capture}
              onSwitch={switchCamera}
              isLoading={state.isLoading}
            />
          )}
        </>
      )}

      {/* キャプチャ後プレビュー */}
      {state.mode === 'captured' && state.capturedImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.capturedImage}
            alt="撮影した写真"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 px-6">
            <button
              onClick={retake}
              className="flex-1 rounded-full border border-white/60 bg-white/20 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              撮り直す
            </button>
            <button
              onClick={handleUse}
              className="flex-1 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition-all hover:bg-blue-700"
            >
              この写真を使う
            </button>
          </div>
        </>
      )}

      {/* ローディング */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      )}

      {/* エラー表示 */}
      {state.error && !state.isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-zinc-300">{state.error.message}</p>
          <button
            onClick={() => startCamera(state.facingMode)}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
          >
            もう一度試す
          </button>
        </div>
      )}

      {/* キャプチャ用の非表示 canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
