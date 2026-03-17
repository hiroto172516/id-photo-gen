'use client';

import { useCallback, useState, useTransition } from 'react';
import Link from 'next/link';
import { CameraView } from '@/components/camera/CameraView';
import { FileDropZone } from '@/components/upload/FileDropZone';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { serviceName } from '@/lib/brand';
import {
  createProcessedImageFromDataUrl,
  processUploadedImage,
  type ProcessedImage,
} from '@/lib/imageProcessing';
import { getUploadTtlHours } from '@/lib/uploadPolicy';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Tab = 'camera' | 'file';
type UploadState = 'idle' | 'uploading' | 'success';

type UploadedAsset = {
  bucket: string;
  objectPath: string;
  expiresAt: string;
};

export default function ShootPage() {
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpload = useCallback(async () => {
    if (!selectedImage) {
      return;
    }

    setUploadError(null);
    setUploadState('uploading');

    try {
      const signResponse = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mimeType: selectedImage.mimeType,
          fileSize: selectedImage.blob.size,
        }),
      });

      const signResult = (await signResponse.json().catch(() => null)) as
        | {
            ok: true;
            bucket: string;
            objectPath: string;
            path: string;
            token: string;
            expiresAt: string;
          }
        | {
            ok: false;
            message: string;
          }
        | null;

      const signErrorMessage =
        signResult && !signResult.ok ? signResult.message : 'アップロードの準備に失敗しました。';

      if (!signResponse.ok || !signResult || !signResult.ok) {
        throw new Error(signErrorMessage);
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase の公開設定が未完了のため、アップロードできません。');
      }

      const { error } = await supabase.storage
        .from(signResult.bucket)
        .uploadToSignedUrl(signResult.path, signResult.token, selectedImage.blob, {
          contentType: selectedImage.mimeType,
          upsert: false,
        });

      if (error) {
        throw new Error('画像のアップロードに失敗しました。');
      }

      setUploadedAsset({
        bucket: signResult.bucket,
        objectPath: signResult.objectPath,
        expiresAt: signResult.expiresAt,
      });
      setUploadState('success');
    } catch (error) {
      setUploadState('idle');
      setUploadError(
        error instanceof Error
          ? error.message
          : 'アップロードに失敗しました。時間をおいて再度お試しください。'
      );
    }
  }, [selectedImage]);

  const handleUsePhoto = useCallback(async (dataUrl: string) => {
    setProcessingError(null);
    setUploadError(null);
    setUploadState('idle');
    setUploadedAsset(null);
    setIsProcessing(true);

    try {
      const processed = await createProcessedImageFromDataUrl(dataUrl);
      startTransition(() => {
        setSelectedImage(processed);
      });
    } catch {
      setProcessingError('撮影画像の読み込みに失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    setProcessingError(null);
    setUploadError(null);
    setUploadState('idle');
    setUploadedAsset(null);
    setIsProcessing(true);

    try {
      const processed = await processUploadedImage(file);
      startTransition(() => {
        setSelectedImage(processed);
      });
    } catch {
      setProcessingError('画像の補正に失敗しました。別の画像で再度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setProcessingError(null);
    setUploadError(null);
    setUploadState('idle');
    setUploadedAsset(null);
  }, []);

  const uploadTtlHours = getUploadTtlHours();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-zinc-100/80 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              S
            </div>
            <span className="text-sm font-bold">{serviceName}</span>
          </Link>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
            β版
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* 未ログイン案内バナー */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">ゲストモードで利用中。</span>
          <Link href="/auth" className="ml-1 underline underline-offset-2 hover:text-amber-900">
            ログイン
          </Link>
          すると処理履歴を保存できます。
        </div>

        <h1 className="mb-6 text-2xl font-bold tracking-tight">写真を用意する</h1>

        {selectedImage ? (
          /* 確認画面 */
          <div className="flex flex-col gap-6">
            <ImagePreview
              src={selectedImage.previewUrl}
              alt="補正後のプレビュー"
              onRetake={handleReset}
              retakeLabel={activeTab === 'camera' ? '撮り直す' : '選び直す'}
              onUse={handleUpload}
              useLabel={uploadState === 'success' ? 'アップロード済み' : 'アップロードして次へ'}
              metaLabel={
                activeTab === 'file'
                  ? `補正後プレビュー ${selectedImage.width}×${selectedImage.height}px`
                  : `撮影プレビュー ${selectedImage.width}×${selectedImage.height}px`
              }
              isRetakeDisabled={uploadState === 'uploading'}
              isUseDisabled={uploadState !== 'idle'}
            />

            {uploadState === 'uploading' && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                画像をアップロードしています。完了まで数秒お待ちください。
              </div>
            )}

            {uploadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uploadError}
              </div>
            )}

            {uploadState === 'success' && uploadedAsset && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  アップロード完了。次の加工ステップへ進む準備ができました。
                </p>
                <p className="mt-2 text-xs text-emerald-700">
                  保存先: {uploadedAsset.bucket}/{uploadedAsset.objectPath}
                </p>
                <p className="mt-2 text-xs text-emerald-700">
                  自動削除予定: {new Date(uploadedAsset.expiresAt).toLocaleString('ja-JP')}
                </p>
                <p className="mt-2 text-xs text-emerald-700">
                  AI処理本体は Day11 以降で接続予定です。現時点では保存完了まで確認できます。
                </p>
              </div>
            )}
          </div>
        ) : (
          /* タブUI */
          <div className="flex flex-col gap-6">
            {/* タブ切替 */}
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === 'camera'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                カメラで撮る
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === 'file'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                ファイルを選ぶ
              </button>
            </div>

            {/* タブコンテンツ */}
            {activeTab === 'camera' ? (
              <CameraView onUsePhoto={handleUsePhoto} />
            ) : (
              <FileDropZone onFileSelected={handleFileSelected} />
            )}

            {processingError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {processingError}
              </div>
            )}

            {(isProcessing || isPending) && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                画像を処理しています。数秒お待ちください。
              </div>
            )}

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-600">
              アップロードは JPEG・10MB 以下に正規化して送信します。保存画像は {uploadTtlHours} 時間後に自動削除され、
              署名URLの発行は短時間あたり回数制限があります。
            </div>

            {/* 撮影ヒント */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">撮影のコツ</p>
              <ul className="space-y-1.5 text-sm text-zinc-500">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-blue-400">✓</span>
                  明るい場所で正面から撮影してください
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-blue-400">✓</span>
                  無地の背景（白・グレー）が理想的です
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-blue-400">✓</span>
                  顔がガイド枠に収まるように調整してください
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
