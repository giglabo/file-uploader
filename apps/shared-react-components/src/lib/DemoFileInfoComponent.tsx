import { FileText } from 'lucide-react';
import React from 'react';
import { formatFileSize } from './utils';

interface FileProps {
  file: File;
}

export function DemoFileInfoComponent({ file}: FileProps) {
  return (
    <div className="flex items-start space-x-4">
      <FileText className="mt-0.5 h-6 w-6 text-gray-400" />
      <div>
        <p className="max-w-xs truncate text-lg font-medium text-gray-800">{file.name}</p>
        <p className="mt-1 text-sm text-gray-500">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}
