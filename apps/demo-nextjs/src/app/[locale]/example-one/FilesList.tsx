import { FileItem } from '@/app/[locale]/example-one/FileUploaderWrapper';
import { formatFileSize } from '@/app/[locale]/example-one/utils';
import { Trash } from 'lucide-react';
import { UploadItem } from '@giglabo/react-upload';
import React from 'react';
import { UploadFileProgress } from '@/app/[locale]/example-one/FileUploadProgress';

interface FilesListProps {
  files: FileItem[] | UploadItem[];
  onDeleteFileAction: (id: string) => void;
  isUploading: boolean;
  allFilesCompleted: boolean;
  uploadFailed: boolean;
}
export const FilesList = ({ files, isUploading, allFilesCompleted, uploadFailed, onDeleteFileAction }: FilesListProps) => {
  if (files.length === 0) {
    return <div className="py-8 text-center text-xs text-gray-500">No files. You have not chosen any files to upload.</div>;
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border">
        <div className="w-full">
          <div className="flex border-b text-sm font-medium text-gray-500">
            <div className="flex-1 p-4">Name</div>
            <div className="flex-1 p-4">Type</div>
            <div className="flex-1 p-4">Size</div>
            {isUploading || allFilesCompleted || uploadFailed ? (
              <div className="flex-1 p-4">Status</div>
            ) : (
              <div className="flex-1 p-4 text-right">Actions</div>
            )}
          </div>
          <div className="divide-y">
            {files.map((file) => (
              <div key={file.id || file.internalId} className="flex items-center hover:bg-gray-50">
                <div className="flex-1 truncate p-4">{file.file.name}</div>
                <div className="flex-1 p-4">{file.file.type || 'Unknown'}</div>
                <div className="flex-1 p-4">{formatFileSize(file.file.size)}</div>

                {isUploading && (
                  <div className="flex-1 p-4">
                    <UploadFileProgress key={`progress-${file.internalId}`} file={file}></UploadFileProgress>
                  </div>
                )}

                {(allFilesCompleted || uploadFailed) && (
                  <div className="flex-1 p-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        file.status === 'COMPLETED'
                          ? 'border-green-200 bg-green-100 text-green-800'
                          : 'border-red-200 bg-red-100 text-red-800'
                      }`}
                    >
                      {file.status === 'COMPLETED' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                )}

                {!(isUploading || allFilesCompleted || uploadFailed) && (
                  <div className="flex-1 p-4 text-right">
                    <button className="p-1 text-gray-500 hover:text-red-600" onClick={() => onDeleteFileAction(file.id)}>
                      <Trash size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
