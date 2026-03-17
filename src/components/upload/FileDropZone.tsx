'use client';

import { useRef, useState, useCallback } from 'react';
import { z } from 'zod';

const fileSchema = z.object({
  type: z.string().refine(
    (t) => ['image/jpeg', 'image/png', 'image/webp'].includes(t),
    { message: 'JPEG、PNG、WebP 形式のファイルを選択してください' }
  ),
  size: z.number().max(10 * 1024 * 1024, { message: 'ファイルサイズは10MB以下にしてください' }),
});

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
}

export function FileDropZone({ onFileSelected }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateAndSelect = useCallback((file: File) => {
    const result = fileSchema.safeParse({ type: file.type, size: file.size });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    // イベントハンドラから呼ぶので render フェーズ外 → React 19 でも安全
    onFileSelected(file);
  }, [onFileSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        data-testid="file-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100'
        }`}
      >
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${isDragging ? 'bg-blue-100' : 'bg-white'}`}>
          <svg
            className={`h-8 w-8 transition-colors ${isDragging ? 'text-blue-500' : 'text-zinc-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-zinc-700">
            {isDragging ? 'ここにドロップ' : '写真をドラッグ&ドロップ'}
          </p>
          <p className="mt-1 text-sm text-zinc-400">または クリックして選択</p>
          <p className="mt-2 text-xs text-zinc-400">JPEG / PNG / WebP・10MB以下</p>
        </div>

        <input
          data-testid="file-input"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p data-testid="file-dropzone-error" className="mt-3 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
