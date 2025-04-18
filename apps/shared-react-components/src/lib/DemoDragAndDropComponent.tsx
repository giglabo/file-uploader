'use client';
import { Upload } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface DragAndDropProps {
  onFileSelect: (files: FileList | null) => void;
  isUploading: boolean;
}
export function DemoDragAndDropComponent({ onFileSelect, isUploading }: DragAndDropProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('border-orange-500');
      dropAreaRef.current.classList.remove('border-gray-300');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-orange-500');
      dropAreaRef.current.classList.add('border-gray-300');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-orange-500');
      dropAreaRef.current.classList.add('border-gray-300');
    }

    const droppedFiles = e.dataTransfer.files;
    onFileSelect(droppedFiles);
  };

  return (
    <div
      ref={dropAreaRef}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="group relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-all duration-300 hover:border-orange-400"
    >
      <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-r from-orange-100/30 to-rose-100/30 opacity-0 transition-opacity group-hover:opacity-100"></div>
      <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 p-4">
        <Upload className="h-12 w-12 text-orange-500" />
      </div>
      <p className="mb-3 text-2xl font-medium text-gray-700">{t('live.dragFiles')}</p>
      <p className="mb-4 text-lg text-gray-500">{t('live.supportMultiple')}</p>
      <div className="inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">{t('live.demoLimit')}</div>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => !isUploading && onFileSelect(e.target.files)} />
    </div>
  );
}
