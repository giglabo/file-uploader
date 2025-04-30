import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { FilesList } from './FilesList';
import { InputFile, UploadEntityStatusEnum } from '@giglabo/upload-shared';
import { UploadItem, useUploadEntity, useUploadEntityActions, useUploadEntityFiles } from '@giglabo/react-upload';

export type FileItem = {
  id: string;
  file: File;
  checksum?: string;
  checksumAlgorithm?: string;
};

export default function FileUploaderWrapper() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allFilesCompleted, setAllFilesCompleted] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const { create, upload } = useUploadEntityActions();
  const [internalUploadUid, setInternalUploadUid] = React.useState<string | null>(null);
  const { uploadEntity } = useUploadEntity(internalUploadUid);
  const uploadFiles: UploadItem[] = useUploadEntityFiles(internalUploadUid);
  const completed = uploadEntity?.status === UploadEntityStatusEnum.COMPLETED;
  const failed = uploadEntity?.status === UploadEntityStatusEnum.FAILED;

  useEffect(() => {
    if (failed) {
      setIsUploading(false);
      setUploadFailed(true);
    }
  }, [failed]);

  useEffect(() => {
    (async () => {
      if (completed) {
        setIsUploading(false);
        setAllFilesCompleted(true);
      }
    })();
  }, [completed, uploadEntity]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFilesArray = Array.from(selectedFiles).map((file) => {
      const fileItem: FileItem = {
        id: uuid(),
        file,
      };
      return fileItem;
    });
    setFiles((prev) => [...prev, ...newFilesArray]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (!isUploading) {
        const dataTransfer = new DataTransfer();
        acceptedFiles.forEach((file) => {
          dataTransfer.items.add(file);
        });
        handleFileSelect(dataTransfer.files);
      }
    },
    disabled: isUploading,
    noClick: true,
    multiple: true,
  });

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setAllFilesCompleted(false);
    setUploadFailed(false);
    setFiles([]);
  };

  const startUpload = async () => {
    setIsUploading(true);
    const inputFiles: InputFile[] = files.map((value) => {
      return {
        file: value.file,
        metaData: {},
      };
    });

    const internalUploadUid = create();
    setInternalUploadUid(internalUploadUid);
    try {
      await upload(internalUploadUid, inputFiles, {}, false);
    } catch (error) {
      cancelUpload();
    }
  };

  return (
    <div {...getRootProps()} className="relative flex h-screen flex-col">
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 z-50 flex h-full items-center justify-center bg-gray-400 bg-opacity-100">
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <UploadCloud size={48} className="mx-auto mb-3 text-orange-400" />
            <h3 className="text-lg font-medium text-gray-700">Drop files here</h3>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8">
          <h1 className="mb-6 text-2xl font-semibold">Upload</h1>
          <p className="mb-6 text-sm text-gray-600">Add the files and folders you want to upload to S3</p>

          {allFilesCompleted || uploadFailed ? (
            <></>
          ) : (
            <div className="flex flex-grow flex-col">
              <div className="rounded-md border-2 border-dashed bg-white p-6 text-center transition-colors hover:border-gray-400">
                <UploadCloud size={48} className={`mx-auto mb-3 ${isDragActive ? 'text-orange-400' : 'text-gray-400'}`} />
                <h3 className="mb-1 text-lg font-medium text-gray-700">Drag and drop files here</h3>
                <p className="mb-4 text-sm text-gray-500">or</p>
                <label className="cursor-pointer rounded bg-orange-400 px-4 py-2 text-white transition-colors hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50">
                  Browse files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length && !isUploading) {
                        handleFileSelect(e.target.files);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                <p className="mt-3 text-xs text-gray-500">Upload multiple files (max 512MB per file, but no more than 1GB)</p>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Files</h3>
                <p className="text-sm text-gray-500">All files in this table will be uploaded.</p>
              </div>
              <div>
                {files.length > 0 && (
                  <div className="flex space-x-4">
                    <button
                      onClick={cancelUpload}
                      className="cursor-pointer rounded bg-gray-400 px-4 py-2 text-white transition-colors hover:bg-gray-500"
                    >
                      Back
                    </button>
                    {!allFilesCompleted && !uploadFailed && (
                      <button
                        onClick={startUpload}
                        disabled={isUploading}
                        className="cursor-pointer rounded bg-orange-400 px-4 py-2 text-white transition-colors hover:bg-orange-500"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <FilesList
              files={!isUploading && !allFilesCompleted && !uploadFailed ? files : uploadFiles}
              isUploading={isUploading}
              allFilesCompleted={allFilesCompleted}
              uploadFailed={uploadFailed}
              onDeleteFileAction={handleDeleteFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
