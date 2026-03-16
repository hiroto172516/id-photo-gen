'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';

const fileSchema = z.object({
  type: z.string().refine(
    (t) => ['image/jpeg', 'image/png', 'image/webp'].includes(t),
    { message: 'JPEG、PNG、WebP 形式のファイルを選択してください' }
  ),
  size: z.number().max(10 * 1024 * 1024, { message: 'ファイルサイズは10MB以下にしてください' }),
});

export interface FileUploadState {
  file: File | null;
  isDragging: boolean;
  error: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isDragging: false,
    error: null,
  });

  const processFile = useCallback((file: File) => {
    const result = fileSchema.safeParse({ type: file.type, size: file.size });

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        error: result.error.issues[0].message,
        file: null,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      file,
      error: null,
      isDragging: false,
    }));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const onDragLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: false }));
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }, [processFile]);

  const reset = useCallback(() => {
    setState({ file: null, isDragging: false, error: null });
  }, []);

  return {
    state,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange,
    reset,
  };
}
