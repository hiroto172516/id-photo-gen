'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import type { Gender, SuitColor, InnerColor } from '@/lib/geminiGeneration';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface SuitGenerationPanelProps {
  sourceBlob: Blob;
  sourceMimeType: string;
  onGenerated?: (result: { previewUrl: string; blob: Blob }) => void;
  isPremiumLocked?: boolean;
  onPaymentRequired?: () => void;
  hasPremiumAccess?: boolean;
}

type GenerationState = 'idle' | 'generating' | 'success' | 'error';
type ActionRequired = 'login' | 'payment' | null;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function SuitGenerationPanel({
  sourceBlob,
  sourceMimeType,
  onGenerated,
  isPremiumLocked = false,
  onPaymentRequired,
  hasPremiumAccess = false,
}: SuitGenerationPanelProps) {
  const [gender, setGender] = useState<Gender>('male');
  const [suitColor, setSuitColor] = useState<SuitColor>('black');
  const [innerColor, setInnerColor] = useState<InnerColor>('white-shirt');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [actionRequired, setActionRequired] = useState<ActionRequired>(null);

  const prevPreviewUrlRef = useRef<string | null>(null);

  // メモリリーク対策: URLが変わったら古いURLを解放
  useEffect(() => {
    const prev = prevPreviewUrlRef.current;
    prevPreviewUrlRef.current = generatedPreviewUrl;

    return () => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
    };
  }, [generatedPreviewUrl]);

  // 元画像をdataURLに変換（FileReaderの非同期コールバックでsetStateするためlint許容）
  useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled) setSourceDataUrl(reader.result as string);
    };
    reader.readAsDataURL(sourceBlob);
    return () => {
      cancelled = true;
    };
  }, [sourceBlob]);

  const handleGenderChange = useCallback((newGender: Gender) => {
    setGender(newGender);
    setInnerColor(newGender === 'male' ? 'white-shirt' : 'white-blouse');
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerationState('generating');
    setErrorMessage(null);
    setActionRequired(null);

    trackEvent('suit_generation_started', { gender, suit_color: suitColor });

    try {
      const mimeType = sourceMimeType === 'image/png' ? 'image/png' : 'image/jpeg';
      const imageBase64 = await blobToBase64(sourceBlob);
      const supabase = getSupabaseBrowserClient();
      const sessionResult = supabase ? await supabase.auth.getSession() : null;
      const accessToken = sessionResult?.data.session?.access_token;

      const response = await fetch('/api/ai/generate-suit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          imageBase64,
          imageMimeType: mimeType,
          gender,
          suitColor,
          innerColor,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        imageBase64?: string;
        imageMimeType?: string;
        qualityScore?: number;
        message?: string;
      };

      if (!data.ok || !data.imageBase64 || !data.imageMimeType) {
        let reason = 'api_error';
        if (response.status === 401) {
          reason = 'unauthorized';
          setActionRequired('login');
          setErrorMessage('AIスーツ着せ替えを使うにはログインが必要です。');
        } else if (response.status === 402) {
          reason = 'payment_required';
          setActionRequired('payment');
          setErrorMessage('AIスーツ着せ替えを使うには300円の決済が必要です。');
          trackEvent('payment_required', { source: 'suit_generation' });
        } else if (response.status === 429) {
          reason = 'rate_limited';
          setErrorMessage(data.message ?? '画像生成に失敗しました。');
        } else {
          setErrorMessage(data.message ?? '画像生成に失敗しました。');
        }
        trackEvent('suit_generation_failed', { gender, reason });
        setGenerationState('error');
        return;
      }

      // base64 → Blob → ObjectURL
      const binaryStr = atob(data.imageBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.imageMimeType });
      const previewUrl = URL.createObjectURL(blob);

      trackEvent('suit_generation_succeeded', {
        gender,
        suit_color: suitColor,
        quality_score: data.qualityScore ?? 0,
      });

      setGeneratedBlob(blob);
      setGeneratedPreviewUrl(previewUrl);
      setSliderValue(50);
      setActionRequired(null);
      setGenerationState('success');
    } catch {
      trackEvent('suit_generation_failed', { gender, reason: 'network_error' });
      setErrorMessage('ネットワークエラーが発生しました。再度お試しください。');
      setGenerationState('error');
    }
  }, [sourceBlob, sourceMimeType, gender, suitColor, innerColor]);

  const handleUseImage = useCallback(() => {
    if (generatedPreviewUrl && generatedBlob && onGenerated) {
      onGenerated({ previewUrl: generatedPreviewUrl, blob: generatedBlob });
    }
  }, [generatedPreviewUrl, generatedBlob, onGenerated]);

  const handleRegenerate = useCallback(() => {
    setRetryCount((c) => c + 1);
    void handleGenerate();
  }, [handleGenerate]);

  const isDisabled = isPremiumLocked || generationState === 'generating';

  return (
    <section
      data-testid="suit-generation-panel"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">AIスーツ着せ替え</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            アップロードした写真にスーツを着せたプロフィール写真を生成します。
          </p>
        </div>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
          プレミアム
        </span>
      </div>

      {/* ロックオーバーレイ付きコンテンツ */}
      <div className="relative mt-4">
        {/* 操作UI */}
        <div className={isPremiumLocked ? 'pointer-events-none select-none opacity-40' : ''}>
          {/* 性別選択 */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-zinc-700">性別</p>
            <div className="flex gap-3">
              {(['male', 'female'] as const).map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="suit-gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => handleGenderChange(g)}
                    disabled={isDisabled}
                    className="accent-violet-600"
                  />
                  <span className="text-sm text-zinc-700">{g === 'male' ? '男性' : '女性'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* スーツ色選択 */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-zinc-700">スーツの色</p>
            <div className="flex gap-2">
              {([
                { value: 'black' as const, label: 'ブラック' },
                { value: 'navy' as const, label: 'ネイビー' },
                { value: 'gray' as const, label: 'グレー' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSuitColor(value)}
                  disabled={isDisabled}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    suitColor === value
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* インナー選択 */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium text-zinc-700">インナー</p>
            <div className="flex gap-2">
              {gender === 'male' ? (
                <button
                  type="button"
                  onClick={() => setInnerColor('white-shirt')}
                  disabled={isDisabled}
                  className="rounded-lg border border-violet-500 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                >
                  白シャツ＋ネクタイ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setInnerColor('white-blouse')}
                  disabled={isDisabled}
                  className="rounded-lg border border-violet-500 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                >
                  白ブラウス
                </button>
              )}
            </div>
          </div>

          {/* 生成ボタン */}
          {generationState !== 'success' && (
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isDisabled}
              data-testid="suit-generate-button"
              className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generationState === 'generating' ? '生成中...' : 'スーツ画像を生成する'}
            </button>
          )}

          {/* エラーバナー */}
          {generationState === 'error' && errorMessage && (
            <div
              data-testid="suit-error-banner"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <p>{errorMessage}</p>
              {actionRequired && onPaymentRequired && (
                <button
                  type="button"
                  onClick={onPaymentRequired}
                  data-testid="suit-error-action"
                  className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  {actionRequired === 'login' ? 'ログインして続ける' : '決済して続ける'}
                </button>
              )}
            </div>
          )}

          {/* 成功時：ビフォーアフター比較 */}
          {generationState === 'success' && generatedPreviewUrl && sourceDataUrl && (
            <div data-testid="suit-preview" className="mt-3">
              {/* 比較スライダー */}
              <div
                data-testid="suit-before-after"
                className="relative aspect-[3/4] w-full touch-none select-none overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
              >
                {/* 変更前（下レイヤー） */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceDataUrl}
                  alt="変更前"
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
                {/* 変更後（clip-pathで左側を表示） */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedPreviewUrl}
                    alt="変更後"
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
                {/* 区切り線とハンドル */}
                <div
                  className="pointer-events-none absolute inset-y-0 flex items-center"
                  style={{ left: `${sliderValue}%` }}
                >
                  <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]" />
                  <div className="relative -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-zinc-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                    </svg>
                  </div>
                </div>
                {/* ラベル */}
                <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  変更前
                </span>
                <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-violet-600/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  変更後
                </span>
                {/* スライダー入力（透明・全面） */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="absolute inset-0 h-full w-full cursor-col-resize opacity-0"
                  aria-label="ビフォーアフター比較スライダー"
                />
              </div>
              {/* アクションボタン */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleUseImage}
                  data-testid="suit-use-button"
                  className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  この画像を使う
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  data-testid="suit-regenerate-button"
                  disabled={isDisabled}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  再生成する
                </button>
              </div>
            </div>
          )}
        </div>

        {/* プレミアムロックオーバーレイ */}
        {isPremiumLocked && (
          <div
            data-testid="suit-premium-overlay"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/60 backdrop-blur-[2px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <p className="text-sm font-semibold text-violet-700">AIスーツ着せ替え</p>
            <p className="text-xs text-zinc-500">1回300円（24時間有効）</p>
            <button
              type="button"
              onClick={onPaymentRequired}
              data-testid="suit-payment-button"
              className="mt-1 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              300円で使う
            </button>
          </div>
        )}
      </div>

      {hasPremiumAccess && (
        <div
          data-testid="suit-premium-ready"
          className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800"
        >
          決済済みです。AIスーツ着せ替えの生成結果を、そのまま高解像度の保存用画像へ反映できます。
        </div>
      )}

      {/* retryCountはレンダリングに使用しない（型エラー回避のため参照） */}
      <span className="sr-only" aria-hidden="true" data-retry={retryCount} />
    </section>
  );
}
