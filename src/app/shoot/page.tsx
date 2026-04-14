'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CameraView } from '@/components/camera/CameraView';
import { ShootFeedbackForm } from '@/components/feedback/ShootFeedbackForm';
import { LegalLinks } from '@/components/LegalLinks';
import { PhotoEditor } from '@/components/upload/PhotoEditor';
import { SuitGenerationPanel } from '@/components/upload/SuitGenerationPanel';
import { PreviewWatermark } from '@/components/upload/PreviewWatermark';
import { FileDropZone } from '@/components/upload/FileDropZone';
import { preloadBackgroundRemoval } from '@/lib/backgroundRemoval';
import {
  BACKGROUND_PRESETS,
  DEFAULT_BACKGROUND_PRESET_ID,
  DEFAULT_CUSTOM_BACKGROUND_COLOR,
  createBackgroundSettings,
  type BackgroundPresetId,
} from '@/lib/backgroundOptions';
import {
  createProcessedImageFromBlob,
  createProcessedImageFromDataUrl,
  exportEditedPhoto,
  processUploadedImage,
  renderEditedPhoto,
  type OutputImageMimeType,
  type ProcessedImage,
} from '@/lib/imageProcessing';
import { buildDownloadFileName, downloadBlob } from '@/lib/downloads';
import { preloadFaceDetector } from '@/lib/faceDetection';
import { trackEvent } from '@/lib/analytics';
import { generateLPrintLayout, type LPrintLayoutResult } from '@/lib/printLayout';
import {
  createManualCropState,
  getCropRectFromManualCrop,
  type ManualCropState,
} from '@/lib/photoEditor';
import {
  DEFAULT_PHOTO_SPEC_ID,
  PHOTO_SPEC_PRESETS,
  getPhotoSpecPreset,
  type PhotoSpecId,
} from '@/lib/photoSpecs';
import { publicAppUrl, serviceName } from '@/lib/brand';
import { getUploadTtlHours } from '@/lib/uploadPolicy';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Tab = 'camera' | 'file';
type UploadState = 'idle' | 'uploading' | 'success';
type PreviewTier = 'free' | 'premium-ai';
type PaymentResumeDraft = {
  sourceDataUrl: string;
  sourceKind: 'camera' | 'file' | 'generated';
  specId: PhotoSpecId;
  backgroundPresetId: BackgroundPresetId;
  customBackgroundColor: string;
};
type SourceImage =
  | { kind: 'camera'; dataUrl: string; accessTier: PreviewTier }
  | { kind: 'file'; file: File; accessTier: PreviewTier }
  | { kind: 'generated'; dataUrl: string; accessTier: PreviewTier };

type UploadedAsset = {
  bucket: string;
  objectPath: string;
  expiresAt: string;
};

type DownloadTarget = 'single' | 'l-print';
const PAYMENT_RESUME_STORAGE_KEY = 'shoot-payment-resume-draft';

export default function ShootPage() {
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [selectedSpecId, setSelectedSpecId] = useState<PhotoSpecId>(DEFAULT_PHOTO_SPEC_ID);
  const [selectedBackgroundPresetId, setSelectedBackgroundPresetId] =
    useState<BackgroundPresetId>(DEFAULT_BACKGROUND_PRESET_ID);
  const [customBackgroundColor, setCustomBackgroundColor] = useState(DEFAULT_CUSTOM_BACKGROUND_COLOR);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [manualCrop, setManualCrop] = useState<ManualCropState | null>(null);
  const [printLayout, setPrintLayout] = useState<LPrintLayoutResult | null>(null);
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [printLayoutError, setPrintLayoutError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditorRendering, setIsEditorRendering] = useState(false);
  const [isLayoutRendering, setIsLayoutRendering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cutLinesEnabled, setCutLinesEnabled] = useState(true);
  const [shareSupported, setShareSupported] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isPremiumLocked, setIsPremiumLocked] = useState(true);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const [selectedImageTier, setSelectedImageTier] = useState<PreviewTier>('free');
  const editorRenderSequenceRef = useRef(0);
  const layoutRenderSequenceRef = useRef(0);
  const selectedSpec = getPhotoSpecPreset(selectedSpecId);
  const backgroundSettings = createBackgroundSettings(
    selectedBackgroundPresetId,
    customBackgroundColor
  );
  const router = useRouter();

  // 決済状況チェック（session_id を渡すと Webhook 未着時のフォールバック検証も行う）
  const checkPaymentStatus = useCallback(async (sessionId?: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const url = sessionId
        ? `/api/stripe/status?session_id=${encodeURIComponent(sessionId)}`
        : '/api/stripe/status';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as { hasAccess: boolean; expiresAt: string | null };
      if (data.hasAccess) {
        setIsPremiumLocked(false);
        setPremiumExpiresAt(data.expiresAt ?? null);
        trackEvent('payment_completed');
        return;
      }

      setIsPremiumLocked(true);
      setPremiumExpiresAt(null);
    } catch {
      // ネットワークエラー時はロック状態を維持
    }
  }, []);

  // マウント時に決済状況を確認
  useEffect(() => {
    void checkPaymentStatus();
  }, [checkPaymentStatus]);

  // Stripe リダイレクト後（?payment=success）に session_id 付きで再確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        const sessionId = params.get('session_id') ?? undefined;
        void checkPaymentStatus(sessionId);
      }
    }
  }, [checkPaymentStatus]);

  // Stripe Checkout 開始
  const handlePaymentRequired = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/auth?redirect=/shoot');
      return;
    }

    trackEvent('payment_initiated');

    try {
      if (typeof window !== 'undefined' && selectedImage) {
        const draft: PaymentResumeDraft = {
          sourceDataUrl:
            sourceImage?.kind === 'camera' || sourceImage?.kind === 'generated'
              ? sourceImage.dataUrl
              : selectedImage.editorState.sourceUrl,
          sourceKind: sourceImage?.kind ?? 'generated',
          specId: selectedSpecId,
          backgroundPresetId: selectedBackgroundPresetId,
          customBackgroundColor,
        };
        window.sessionStorage.setItem(PAYMENT_RESUME_STORAGE_KEY, JSON.stringify(draft));
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as { ok: boolean; url?: string; alreadyPaid?: boolean };

      if (data.alreadyPaid) {
        void checkPaymentStatus();
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // エラー時は何もしない（次回再試行可能）
    }
  }, [
    checkPaymentStatus,
    customBackgroundColor,
    router,
    selectedBackgroundPresetId,
    selectedImage,
    selectedSpecId,
    sourceImage,
  ]);

  useEffect(() => {
    setShareSupported(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const preload = () => {
      void preloadFaceDetector();
      void preloadBackgroundRemoval();
    };

    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(preload, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = globalThis.setTimeout(preload, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  const runLayoutGeneration = useCallback(async (
    nextSelectedImage: ProcessedImage,
    nextCutLinesEnabled: boolean
  ) => {
    const nextSequence = layoutRenderSequenceRef.current + 1;
    layoutRenderSequenceRef.current = nextSequence;
    setIsLayoutRendering(true);
    setPrintLayoutError(null);

    try {
      const nextPrintLayout = await generateLPrintLayout(nextSelectedImage, {
        cutLinesEnabled: nextCutLinesEnabled,
      });

      if (layoutRenderSequenceRef.current !== nextSequence) {
        return null;
      }

      return nextPrintLayout;
    } catch {
      if (layoutRenderSequenceRef.current === nextSequence) {
        setPrintLayoutError('L版レイアウトの生成に失敗しました。別の画像で再度お試しください。');
      }

      return null;
    } finally {
      if (layoutRenderSequenceRef.current === nextSequence) {
        setIsLayoutRendering(false);
      }
    }
  }, []);

  const runProcessing = useCallback(async (
    nextSourceImage: SourceImage,
    nextSpecId: PhotoSpecId,
    nextBackgroundPresetId: BackgroundPresetId,
    nextCustomBackgroundColor: string,
    errorMessage: string
  ) => {
    editorRenderSequenceRef.current += 1;
    layoutRenderSequenceRef.current += 1;
    setProcessingError(null);
    setPrintLayoutError(null);
    setUploadError(null);
    setDownloadError(null);
    setShareError(null);
    setCopiedShareUrl(false);
    setUploadState('idle');
    setUploadedAsset(null);
    setIsProcessing(true);
    trackEvent('shoot_started', {
      source_kind: nextSourceImage.kind,
      spec_id: nextSpecId,
      background_preset_id: nextBackgroundPresetId,
    });

    try {
      const nextBackgroundSettings = createBackgroundSettings(
        nextBackgroundPresetId,
        nextCustomBackgroundColor
      );
      const processed =
        nextSourceImage.kind === 'camera' || nextSourceImage.kind === 'generated'
          ? await createProcessedImageFromDataUrl(
              nextSourceImage.dataUrl,
              nextSpecId,
              nextBackgroundSettings
            )
          : await processUploadedImage(nextSourceImage.file, nextSpecId, nextBackgroundSettings);
      const nextPrintLayout = await runLayoutGeneration(processed, cutLinesEnabled);

      startTransition(() => {
        setSelectedImage(processed);
        setSelectedImageTier(nextSourceImage.accessTier);
        setManualCrop(processed.editorState.manualCrop);
        setPrintLayout(nextPrintLayout);
      });
      trackEvent('photo_processed', {
        source_kind: nextSourceImage.kind,
        spec_id: processed.cropMetadata.specId,
        face_detected: processed.cropMetadata.faceDetected,
        used_fallback: processed.cropMetadata.usedFallback,
        background_fallback: processed.backgroundMetadata.usedFallback,
      });
    } catch {
      setProcessingError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [cutLinesEnabled, runLayoutGeneration]);

  useEffect(() => {
    if (typeof window === 'undefined' || selectedImage) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(PAYMENT_RESUME_STORAGE_KEY);
    if (!rawDraft) {
      return;
    }

    let cancelled = false;

    const restoreDraft = async () => {
      try {
        const draft = JSON.parse(rawDraft) as PaymentResumeDraft;
        setSelectedSpecId(draft.specId);
        setSelectedBackgroundPresetId(draft.backgroundPresetId);
        setCustomBackgroundColor(draft.customBackgroundColor);

        const nextSourceImage: SourceImage = {
          kind: draft.sourceKind === 'file' ? 'generated' : draft.sourceKind,
          dataUrl: draft.sourceDataUrl,
          accessTier: 'free',
        };

        if (cancelled) {
          return;
        }

        setSourceImage(nextSourceImage);
        await runProcessing(
          nextSourceImage,
          draft.specId,
          draft.backgroundPresetId,
          draft.customBackgroundColor,
          '決済後の編集内容を復元できませんでした。画像を再度選択してください。'
        );
      } finally {
        window.sessionStorage.removeItem(PAYMENT_RESUME_STORAGE_KEY);
      }
    };

    void restoreDraft();

    return () => {
      cancelled = true;
    };
  }, [runProcessing, selectedImage]);

  const handleUpload = useCallback(async () => {
    if (!selectedImage) {
      return;
    }

    setUploadError(null);
    setDownloadError(null);
    setShareError(null);
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
      trackEvent('upload_completed', {
        spec_id: selectedImage.cropMetadata.specId,
        source_kind: sourceImage?.kind ?? 'file',
        asset_tier: selectedImageTier,
      });
    } catch (error) {
      setUploadState('idle');
      setUploadError(
        error instanceof Error
          ? error.message
          : 'アップロードに失敗しました。時間をおいて再度お試しください。'
      );
    }
  }, [selectedImage, selectedImageTier, sourceImage?.kind]);

  const handleUsePhoto = useCallback(async (dataUrl: string) => {
    const nextSourceImage: SourceImage = { kind: 'camera', dataUrl, accessTier: 'free' };
    setSourceImage(nextSourceImage);
    await runProcessing(
      nextSourceImage,
      selectedSpecId,
      selectedBackgroundPresetId,
      customBackgroundColor,
      '撮影画像の読み込みに失敗しました。もう一度お試しください。'
    );
  }, [customBackgroundColor, runProcessing, selectedBackgroundPresetId, selectedSpecId]);

  const handleFileSelected = useCallback(async (file: File) => {
    const nextSourceImage: SourceImage = { kind: 'file', file, accessTier: 'free' };
    setSourceImage(nextSourceImage);
    await runProcessing(
      nextSourceImage,
      selectedSpecId,
      selectedBackgroundPresetId,
      customBackgroundColor,
      '画像の補正に失敗しました。別の画像で再度お試しください。'
    );
  }, [customBackgroundColor, runProcessing, selectedBackgroundPresetId, selectedSpecId]);

  const handleReset = useCallback(() => {
    editorRenderSequenceRef.current += 1;
    setSourceImage(null);
    setSelectedImage(null);
    setManualCrop(null);
    setPrintLayout(null);
    setProcessingError(null);
    setPrintLayoutError(null);
    setUploadError(null);
    setDownloadError(null);
    setShareError(null);
    setCopiedShareUrl(false);
    setUploadState('idle');
    setUploadedAsset(null);
    setSelectedImageTier('free');
  }, []);

  const handleManualCropCommit = useCallback(async (nextManualCrop: ManualCropState) => {
    if (!selectedImage) {
      return;
    }

    const nextSequence = editorRenderSequenceRef.current + 1;
    editorRenderSequenceRef.current = nextSequence;
    setIsEditorRendering(true);
    setProcessingError(null);
    setPrintLayoutError(null);
    setUploadError(null);
    setDownloadError(null);
    setShareError(null);
    setCopiedShareUrl(false);
    setUploadState('idle');
    setUploadedAsset(null);

    try {
      const rendered = await renderEditedPhoto(
        selectedImage.editorState,
        selectedImage.cropMetadata,
        selectedImage.backgroundMetadata,
        nextManualCrop
      );

      if (editorRenderSequenceRef.current !== nextSequence) {
        return;
      }

      const nextPrintLayout = await runLayoutGeneration(rendered, cutLinesEnabled);

      if (editorRenderSequenceRef.current !== nextSequence) {
        return;
      }

      startTransition(() => {
        setSelectedImage(rendered);
        setManualCrop(rendered.editorState.manualCrop);
        setPrintLayout(nextPrintLayout);
      });
    } catch {
      if (editorRenderSequenceRef.current === nextSequence) {
        setProcessingError('トリミングの再調整に失敗しました。別の画像で再度お試しください。');
      }
    } finally {
      if (editorRenderSequenceRef.current === nextSequence) {
        setIsEditorRendering(false);
      }
    }
  }, [cutLinesEnabled, runLayoutGeneration, selectedImage]);

  const handleManualCropReset = useCallback(() => {
    if (!selectedImage) {
      return;
    }

    const nextManualCrop = createManualCropState(
      selectedImage.editorState.sourceWidth,
      selectedImage.editorState.sourceHeight,
      selectedImage.editorState.aspectRatio,
      selectedImage.editorState.baseCropRect
    );
    setManualCrop(nextManualCrop);
    void handleManualCropCommit(nextManualCrop);
  }, [handleManualCropCommit, selectedImage]);

  const handleSpecChange = useCallback(async (nextSpecId: PhotoSpecId) => {
    setSelectedSpecId(nextSpecId);

    if (!sourceImage) {
      return;
    }

    await runProcessing(
      sourceImage,
      nextSpecId,
      selectedBackgroundPresetId,
      customBackgroundColor,
      '画像の再処理に失敗しました。別の画像で再度お試しください。'
    );
  }, [customBackgroundColor, runProcessing, selectedBackgroundPresetId, sourceImage]);

  const handleBackgroundPresetChange = useCallback(async (nextPresetId: BackgroundPresetId) => {
    setSelectedBackgroundPresetId(nextPresetId);

    if (!sourceImage) {
      return;
    }

    await runProcessing(
      sourceImage,
      selectedSpecId,
      nextPresetId,
      customBackgroundColor,
      '背景処理の再適用に失敗しました。時間をおいて再度お試しください。'
    );
  }, [customBackgroundColor, runProcessing, selectedSpecId, sourceImage]);

  const handleCustomBackgroundColorChange = useCallback(async (nextColor: string) => {
    setCustomBackgroundColor(nextColor);

    if (!sourceImage) {
      return;
    }

    await runProcessing(
      sourceImage,
      selectedSpecId,
      selectedBackgroundPresetId,
      nextColor,
      '背景処理の再適用に失敗しました。時間をおいて再度お試しください。'
    );
  }, [runProcessing, selectedBackgroundPresetId, selectedSpecId, sourceImage]);

  const handleCutLinesChange = useCallback(async (nextCutLinesEnabled: boolean) => {
    setCutLinesEnabled(nextCutLinesEnabled);

    if (!selectedImage) {
      return;
    }

    const nextPrintLayout = await runLayoutGeneration(selectedImage, nextCutLinesEnabled);
    startTransition(() => {
      setPrintLayout(nextPrintLayout);
    });
  }, [runLayoutGeneration, selectedImage]);

  const handleDownload = useCallback(async (
    target: DownloadTarget,
    mimeType: OutputImageMimeType
  ) => {
    if (!selectedImage) {
      return;
    }

    setDownloadError(null);
    setShareError(null);
    setIsDownloading(true);

    try {
      const fileName = buildDownloadFileName({
        specId: selectedImage.cropMetadata.specId,
        backgroundPresetId: selectedBackgroundPresetId,
        kind: target,
        mimeType,
      });

      if (target === 'single') {
        const asset =
          mimeType === selectedImage.mimeType
            ? { blob: selectedImage.blob }
            : await exportEditedPhoto(
                selectedImage.editorState,
                manualCrop ?? selectedImage.editorState.manualCrop,
                mimeType
              );

        downloadBlob(asset.blob, fileName);
        trackEvent('single_download', {
          spec_id: selectedImage.cropMetadata.specId,
          mime_type: mimeType,
          background_preset_id: selectedBackgroundPresetId,
          asset_tier: selectedImageTier,
        });
      } else {
        const layout =
          printLayout && printLayout.mimeType === mimeType
            ? printLayout
            : await generateLPrintLayout(selectedImage, {
                cutLinesEnabled,
                mimeType,
              });

        downloadBlob(layout.blob, fileName);
        trackEvent('lprint_download', {
          spec_id: selectedImage.cropMetadata.specId,
          mime_type: mimeType,
          cut_lines_enabled: cutLinesEnabled,
          asset_tier: selectedImageTier,
        });
      }
    } catch {
      setDownloadError('ダウンロード用の画像生成に失敗しました。別の画像で再度お試しください。');
    } finally {
      setIsDownloading(false);
    }
  }, [
    cutLinesEnabled,
    manualCrop,
    printLayout,
    selectedBackgroundPresetId,
    selectedImage,
    selectedImageTier,
  ]);

  const handleGeneratedPremiumImage = useCallback(async ({ blob }: { previewUrl: string; blob: Blob }) => {
    setProcessingError(null);
    setPrintLayoutError(null);
    setUploadError(null);
    setDownloadError(null);
    setShareError(null);
    setCopiedShareUrl(false);
    setUploadState('idle');
    setUploadedAsset(null);
    setIsProcessing(true);

    try {
      const processed = await createProcessedImageFromBlob(blob, selectedSpecId, backgroundSettings);
      const nextPrintLayout = await runLayoutGeneration(processed, cutLinesEnabled);
      const nextSourceImage: SourceImage = {
        kind: 'generated',
        dataUrl: processed.editorState.sourceUrl,
        accessTier: 'premium-ai',
      };

      startTransition(() => {
        setSourceImage(nextSourceImage);
        setSelectedImage(processed);
        setSelectedImageTier('premium-ai');
        setManualCrop(processed.editorState.manualCrop);
        setPrintLayout(nextPrintLayout);
      });

      trackEvent('suit_generation_applied', {
        spec_id: processed.cropMetadata.specId,
        background_preset_id: selectedBackgroundPresetId,
      });
    } catch {
      setProcessingError('AI画像の反映に失敗しました。もう一度生成してください。');
    } finally {
      setIsProcessing(false);
    }
  }, [backgroundSettings, cutLinesEnabled, runLayoutGeneration, selectedBackgroundPresetId, selectedSpecId]);

  const shareUrl = `${publicAppUrl}/shoot`;
  const shareText = `${serviceName}で${selectedSpec.label}の証明写真をスマホから整えられます。背景変更とL版レイアウトまで無料で試せます。`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl} #証明写真 #スマホ証明写真`)}`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

  const handleNativeShare = useCallback(async () => {
    if (!shareSupported) {
      return;
    }

    setShareError(null);
    setCopiedShareUrl(false);

    try {
      await navigator.share({
        title: serviceName,
        text: shareText,
        url: shareUrl,
      });
      trackEvent('share_clicked', {
        method: 'native',
        spec_id: selectedSpecId,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      setShareError('共有メニューを開けませんでした。下のリンク共有をご利用ください。');
    }
  }, [selectedSpecId, shareSupported, shareText, shareUrl]);

  const handleCopyShareUrl = useCallback(async () => {
    setShareError(null);
    setCopiedShareUrl(false);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareUrl(true);
      trackEvent('share_clicked', {
        method: 'copy',
        spec_id: selectedSpecId,
      });
    } catch {
      setShareError('共有URLのコピーに失敗しました。ブラウザの設定をご確認ください。');
      setCopiedShareUrl(false);
    }
  }, [selectedSpecId, shareUrl]);

  const uploadTtlHours = getUploadTtlHours();
  const feedbackContext =
    selectedImage && sourceImage
      ? {
          page: '/shoot',
          specId: selectedImage.cropMetadata.specId,
          backgroundPresetId: selectedBackgroundPresetId,
          backgroundLabel: selectedImage.backgroundMetadata.colorLabel,
          faceDetected: selectedImage.cropMetadata.faceDetected,
          usedFallbacks: [
            ...(selectedImage.cropMetadata.usedFallback ? ['face-crop'] : []),
            ...(selectedImage.backgroundMetadata.usedFallback ? ['background-removal'] : []),
          ],
          sourceKind: sourceImage.kind === 'generated' ? 'file' : sourceImage.kind,
        }
      : null;
  const previewCropRect =
    selectedImage && manualCrop
      ? getCropRectFromManualCrop(
          selectedImage.editorState.sourceWidth,
          selectedImage.editorState.sourceHeight,
          selectedImage.editorState.aspectRatio,
          selectedImage.editorState.baseCropRect,
          manualCrop
        )
      : null;
  const premiumExpiryText = premiumExpiresAt
    ? new Date(premiumExpiresAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

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
        <div
          data-testid="guest-banner"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span className="font-semibold">ゲストモードで利用中。</span>
          <Link href="/auth" className="ml-1 underline underline-offset-2 hover:text-amber-900">
            ログイン
          </Link>
          すると処理履歴を保存できます。
        </div>

        <h1 className="mb-6 text-2xl font-bold tracking-tight">写真を用意する</h1>

        <section
          data-testid="photo-spec-selector"
          className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">証明写真の規格を選択</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                顔の大きさと余白を用途に合わせて自動調整します。初期値は履歴書です。
              </p>
            </div>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              自動クロップ
            </span>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">用途</span>
            <select
              data-testid="photo-spec-select"
              value={selectedSpecId}
              onChange={(event) => void handleSpecChange(event.target.value as PhotoSpecId)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm font-medium text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {PHOTO_SPEC_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <p data-testid="photo-spec-note" className="mt-3 text-xs text-zinc-500">
            現在の設定: {selectedSpec.label}
          </p>
        </section>

        <section
          data-testid="background-selector"
          className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">背景を整える</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                背景を自動で切り抜き、証明写真向けの色へ差し替えます。初回はモデルの読み込みで少し時間がかかる場合があります。
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              WASM 背景除去
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedBackgroundPresetId;

              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`background-preset-${preset.id}`}
                  aria-pressed={isSelected}
                  onClick={() => void handleBackgroundPresetChange(preset.id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-900/10'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <span
                    className="mb-2 block h-8 w-full rounded-xl border border-black/5"
                    style={{ backgroundColor: preset.id === 'custom' ? customBackgroundColor : preset.colorHex }}
                  />
                  <span className="block text-sm font-semibold">{preset.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
              <span>カスタム背景色</span>
              <input
                data-testid="background-color-picker"
                type="color"
                value={customBackgroundColor}
                onChange={(event) => void handleCustomBackgroundColorChange(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
              />
            </label>
            <p data-testid="background-note" className="text-xs text-zinc-500">
              現在の背景: {backgroundSettings.label}
            </p>
          </div>
        </section>

        {selectedImage ? (
          /* 確認画面 */
          <div className="flex flex-col gap-6">
            {manualCrop && previewCropRect && (
              <PhotoEditor
                sourceUrl={selectedImage.editorState.sourceUrl}
                sourceWidth={selectedImage.editorState.sourceWidth}
                sourceHeight={selectedImage.editorState.sourceHeight}
                baseCropRect={selectedImage.editorState.baseCropRect}
                cropRect={previewCropRect}
                manualCrop={manualCrop}
                onManualCropChange={setManualCrop}
                onManualCropCommit={(nextManualCrop) => {
                  void handleManualCropCommit(nextManualCrop);
                }}
                onReset={handleManualCropReset}
                showWatermark={selectedImageTier === 'free'}
              />
            )}

            <SuitGenerationPanel
              sourceBlob={selectedImage.blob}
              sourceMimeType={selectedImage.mimeType}
              isPremiumLocked={isPremiumLocked}
              hasPremiumAccess={!isPremiumLocked}
              onPaymentRequired={() => { void handlePaymentRequired(); }}
              onGenerated={(result) => {
                void handleGeneratedPremiumImage(result);
              }}
            />

            <div
              data-testid="image-preview-meta"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-xs font-medium text-zinc-500"
            >
              {activeTab === 'file' ? '補正後' : '撮影'}プレビュー {selectedImage.width}×{selectedImage.height}px
            </div>

            {selectedImageTier === 'free' ? (
              <div
                data-testid="free-preview-note"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                無料プレビューには透かしを重ねて表示しています。通常のダウンロード画像そのものには透かしを入れません。AIスーツ着せ替えは決済後に高解像度保存へ反映できます。
              </div>
            ) : (
              <div
                data-testid="premium-preview-note"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                AIスーツ着せ替えの購入済みプレビューです。透かしは解除されており、このまま高解像度で保存できます。
                {premiumExpiryText ? ` 利用期限: ${premiumExpiryText}` : ''}
              </div>
            )}

            <section
              data-testid="l-print-layout"
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">L版印刷レイアウト</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    現在の証明写真を L版 89×127mm・300dpi の印刷用シートへ自動配置します。
                  </p>
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                  自動最適配置
                </span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                  <div
                    className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                    style={{ aspectRatio: '89 / 127' }}
                  >
                    {printLayout ? (
                      <div className="relative h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          data-testid="l-print-layout-preview"
                          src={printLayout.previewUrl}
                          alt="L版印刷レイアウトのプレビュー"
                          className="h-full w-full object-contain"
                        />
                        {selectedImageTier === 'free' && (
                          <PreviewWatermark testId="l-print-preview-watermark" />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-xs text-zinc-400">
                        {isLayoutRendering ? 'L版レイアウトを生成しています。' : 'L版レイアウトを準備しています。'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    <p className="font-semibold text-zinc-900">
                      配置枚数: <span data-testid="l-print-copy-count">{printLayout?.copyCount ?? 0}枚</span>
                    </p>
                    <p data-testid="l-print-photo-size" className="mt-2 text-xs text-zinc-500">
                      1枚あたり {selectedImage.cropMetadata.specLabel} ({printLayout?.photoWidthMm ?? selectedSpec.widthMm}
                      ×{printLayout?.photoHeightMm ?? selectedSpec.heightMm}mm / {printLayout?.photoWidthPx ?? 0}
                      ×{printLayout?.photoHeightPx ?? 0}px)
                    </p>
                    <p data-testid="l-print-resolution" className="mt-2 text-xs text-zinc-500">
                      シートサイズ {printLayout?.sheetWidthPx ?? 1051}×{printLayout?.sheetHeightPx ?? 1500}px / 300dpi
                    </p>
                    {printLayout && (
                      <p data-testid="l-print-grid" className="mt-2 text-xs text-zinc-500">
                        配置グリッド {printLayout.columns}列 × {printLayout.rows}行
                      </p>
                    )}
                  </div>

                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                    <div>
                      <p className="font-semibold text-zinc-900">カットラインを表示</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        印刷後に切り分けやすいよう、各写真の外周にガイド線を表示します。
                      </p>
                    </div>
                    <input
                      data-testid="l-print-cut-lines-toggle"
                      type="checkbox"
                      checked={cutLinesEnabled}
                      onChange={(event) => void handleCutLinesChange(event.target.checked)}
                      className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <p data-testid="l-print-cut-lines-status" className="text-xs text-zinc-500">
                    カットライン: {cutLinesEnabled ? '表示中' : '非表示'}
                  </p>
                </div>
              </div>

              {printLayoutError && (
                <div
                  data-testid="l-print-layout-error"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {printLayoutError}
                </div>
              )}
            </section>

            <section
              data-testid="download-actions"
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">画像を保存する</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    単体写真と L版レイアウトを JPEG / PNG で保存できます。保存する画像には透かしを入れません。
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {selectedImageTier === 'premium-ai' ? '高解像度保存' : '透かしなし保存'}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  data-testid="download-single-jpeg"
                  onClick={() => void handleDownload('single', 'image/jpeg')}
                  disabled={isDownloading || isEditorRendering}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="text-sm font-semibold text-zinc-900">単体写真を JPEG で保存</p>
                  <p className="mt-1 text-xs text-zinc-500">提出用や履歴書貼付用の基本保存です。</p>
                </button>
                <button
                  type="button"
                  data-testid="download-single-png"
                  onClick={() => void handleDownload('single', 'image/png')}
                  disabled={isDownloading || isEditorRendering}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="text-sm font-semibold text-zinc-900">単体写真を PNG で保存</p>
                  <p className="mt-1 text-xs text-zinc-500">背景を保ったまま、再利用しやすい形式で保存します。</p>
                </button>
                <button
                  type="button"
                  data-testid="download-l-print-jpeg"
                  onClick={() => void handleDownload('l-print', 'image/jpeg')}
                  disabled={isDownloading || isLayoutRendering || !printLayout}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="text-sm font-semibold text-zinc-900">L版を JPEG で保存</p>
                  <p className="mt-1 text-xs text-zinc-500">コンビニプリントへ持ち込みやすい標準保存です。</p>
                </button>
                <button
                  type="button"
                  data-testid="download-l-print-png"
                  onClick={() => void handleDownload('l-print', 'image/png')}
                  disabled={isDownloading || isLayoutRendering || !printLayout}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="text-sm font-semibold text-zinc-900">L版を PNG で保存</p>
                  <p className="mt-1 text-xs text-zinc-500">再圧縮を避けたい場合の保存用です。</p>
                </button>
              </div>

              {downloadError && (
                <div
                  data-testid="download-error"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {downloadError}
                </div>
              )}
            </section>

            <section
              data-testid="print-guide"
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <p className="text-sm font-semibold text-zinc-900">コンビニプリント用ガイド</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                保存した L版画像は元サイズのまま印刷し、自動補正や拡大縮小を避けるとレイアウトが崩れにくくなります。
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                <li data-testid="print-guide-sheet-size">L判 89×127mm / 300dpi のまま印刷してください。</li>
                <li data-testid="print-guide-photo-size">
                  1枚サイズは {printLayout?.photoWidthMm ?? selectedSpec.widthMm}×{printLayout?.photoHeightMm ?? selectedSpec.heightMm}mm、
                  今回の配置は {printLayout?.copyCount ?? 0}枚です。
                </li>
                <li>機械側の自動拡大・縮小や余白調整は OFF を優先してください。</li>
                <li>フチあり / フチなしの設定差で見切れる場合があるため、最終プレビューを確認してください。</li>
              </ul>
            </section>

            <section
              data-testid="share-actions"
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">SNS で共有する</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    公開ページへの導線を共有します。写真そのものは送信せず、サービス紹介のテキストと URL を渡します。
                  </p>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  共有リンク
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {shareSupported ? (
                  <>
                    <button
                      type="button"
                      data-testid="share-native-button"
                      onClick={() => void handleNativeShare()}
                      className="rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      共有メニューを開く
                    </button>
                    <button
                      type="button"
                      data-testid="share-copy-button"
                      onClick={() => void handleCopyShareUrl()}
                      className="rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      URL をコピー
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      data-testid="share-x-button"
                      href={xShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        trackEvent('share_clicked', {
                          method: 'x',
                          spec_id: selectedSpecId,
                        })
                      }
                      className="rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      X で共有
                    </a>
                    <a
                      data-testid="share-line-button"
                      href={lineShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        trackEvent('share_clicked', {
                          method: 'line',
                          spec_id: selectedSpecId,
                        })
                      }
                      className="rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      LINE で共有
                    </a>
                    <button
                      type="button"
                      data-testid="share-copy-button"
                      onClick={() => void handleCopyShareUrl()}
                      className="rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                    >
                      URL をコピー
                    </button>
                  </>
                )}
              </div>

              <p data-testid="share-url-note" className="mt-3 text-xs text-zinc-500">
                共有先: {shareUrl}
              </p>
              {copiedShareUrl && (
                <p data-testid="share-copy-success" className="mt-2 text-xs text-emerald-700">
                  共有URLをコピーしました。
                </p>
              )}
              {shareError && (
                <div
                  data-testid="share-error"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {shareError}
                </div>
              )}
            </section>

            {feedbackContext && (
              <ShootFeedbackForm
                context={feedbackContext}
                onSubmitted={() => {
                  trackEvent('feedback_submitted', {
                    spec_id: feedbackContext.specId,
                    source_kind: feedbackContext.sourceKind,
                  });
                }}
              />
            )}

            <div className="flex w-full gap-3">
              <button
                data-testid="retake-button"
                onClick={handleReset}
                disabled={uploadState === 'uploading' || isEditorRendering || isDownloading}
                className="flex-1 rounded-full border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activeTab === 'camera' ? '撮り直す' : '選び直す'}
              </button>
              <button
                type="button"
                data-testid="use-photo-button"
                onClick={() => void handleUpload()}
                disabled={uploadState !== 'idle' || isEditorRendering || isDownloading}
                className="flex-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-md"
              >
                {uploadState === 'success' ? 'アップロード済み' : 'アップロードして次へ'}
              </button>
            </div>

            <div
              data-testid="photo-spec-summary"
              className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"
            >
              <p className="font-semibold">
                適用規格: <span data-testid="selected-spec-label">{selectedImage.cropMetadata.specLabel}</span>
              </p>
              <p className="mt-1 text-xs text-blue-700">
                顔位置をもとに証明写真向けに自動クロップしました。
              </p>
              {manualCrop && (
                <p className="mt-1 text-xs text-blue-700">
                  手動調整を反映したプレビューをそのまま保存します。
                </p>
              )}
              {selectedImage.cropMetadata.usedFallback && (
                <p data-testid="face-detection-fallback" className="mt-2 text-xs text-amber-700">
                  顔を特定できなかったため、中央基準の安全なトリミングに切り替えています。
                </p>
              )}
            </div>

            <div
              data-testid="background-summary"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 rounded-full border border-black/10"
                  style={{ backgroundColor: selectedImage.backgroundMetadata.colorHex }}
                />
                <p className="font-semibold">
                  背景色: <span data-testid="selected-background-label">{selectedImage.backgroundMetadata.colorLabel}</span>
                </p>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {selectedImage.backgroundMetadata.removalApplied
                  ? '背景除去を適用し、選択した色へ差し替えました。'
                  : '背景除去に失敗したため、元の背景を保持しています。'}
              </p>
              {selectedImage.backgroundMetadata.usedFallback && (
                <p data-testid="background-removal-fallback" className="mt-2 text-xs text-amber-700">
                  背景処理が安定しない環境のため、再試行または別の画像での処理をおすすめします。
                </p>
              )}
            </div>

            {uploadState === 'uploading' && (
              <div
                data-testid="upload-status"
                className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
              >
                画像をアップロードしています。完了まで数秒お待ちください。
              </div>
            )}

            {uploadError && (
              <div
                data-testid="upload-error"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {uploadError}
              </div>
            )}

            {uploadState === 'success' && uploadedAsset && (
              <div
                data-testid="upload-success"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
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
                  顔検出・自動トリミング・背景処理を反映した画像を保存しています。
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
                data-testid="tab-camera"
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
                data-testid="tab-file"
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
              <div
                data-testid="processing-error"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {processingError}
              </div>
            )}

            {(isProcessing || isPending || isEditorRendering || isLayoutRendering) && (
              <div
                data-testid="processing-status"
                className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
              >
                {isEditorRendering
                  ? 'トリミングを再調整しています。数秒お待ちください。'
                  : isLayoutRendering
                    ? 'L版印刷レイアウトを生成しています。数秒お待ちください。'
                  : '画像を処理しています。数秒お待ちください。'}
              </div>
            )}

            <div
              data-testid="upload-policy-note"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-6 text-zinc-600"
            >
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

      <footer className="border-t border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-8 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 {serviceName}. All rights reserved.</p>
          <LegalLinks
            className="flex items-center gap-4"
            linkClassName="hover:text-zinc-600"
          />
        </div>
      </footer>
    </div>
  );
}
