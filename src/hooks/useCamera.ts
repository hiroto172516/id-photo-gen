'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { CameraError, CameraState, FacingMode } from '@/types/camera';

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    isLoading: false,
    isActive: false,
    facingMode: 'user',
    mode: 'preview',
    capturedImage: null,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facingMode: FacingMode = 'user') => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState((prev) => ({
        ...prev,
        error: { code: 'NOT_SUPPORTED', message: 'このブラウザはカメラをサポートしていません' },
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isActive: true,
        facingMode,
        mode: 'preview',
        capturedImage: null,
        error: null,
      }));
    } catch (err) {
      stopStream();
      let cameraError: CameraError;

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          cameraError = { code: 'PERMISSION_DENIED', message: 'カメラのアクセス許可が必要です' };
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          cameraError = { code: 'DEVICE_NOT_FOUND', message: 'カメラが見つかりません' };
        } else {
          cameraError = { code: 'UNKNOWN', message: err.message };
        }
      } else {
        cameraError = { code: 'UNKNOWN', message: 'カメラの起動に失敗しました' };
      }

      setState((prev) => ({ ...prev, isLoading: false, isActive: false, error: cameraError }));
    }
  }, [stopStream]);

  const stopCamera = useCallback(() => {
    stopStream();
    setState((prev) => ({
      ...prev,
      isActive: false,
      mode: 'preview',
      capturedImage: null,
      error: null,
    }));
  }, [stopStream]);

  const switchCamera = useCallback(() => {
    const nextFacing: FacingMode = state.facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextFacing);
  }, [state.facingMode, startCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 前面カメラ時はミラー反転を解除して正像を保存
    if (state.facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopStream();
    setState((prev) => ({
      ...prev,
      isActive: false,
      mode: 'captured',
      capturedImage: dataUrl,
    }));
  }, [state.facingMode, stopStream]);

  const retake = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: 'preview',
      capturedImage: null,
    }));
    startCamera(state.facingMode);
  }, [state.facingMode, startCamera]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    capture,
    retake,
  };
}
