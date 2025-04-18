import { useAppDispatch, useAppSelector } from '../../../UploadHooks';
import { selectUploadEntity, selectUploadEntityEntities } from './uploadEntitySelectors';
import { uploadClearRequest, uploadRegister, uploadRequest, uploadUpdateInternalState } from './uploadEntitySlice';
import { FileMetaData, HashCalcProgress, InputFile, LoggerType, OutputFileHashProgressData, UploadMetaData } from '@giglabo/shared';
import { v4 as uuid } from 'uuid';
import { useServices } from '../../../UploadGlobalProviderContext';
import {
  InputUploadFileMetaData,
  selectAllUploadItems,
  selectFilesByUploadId,
  uploadItemClearRequest,
  uploadItemAddItems,
  uploadItemRegisterItems,
  uploadItemUpdateIntegrityCheck,
} from '../uploadItem';
import { addLoggerRequest } from '../logger';
import { uploadPieceItemClearRequest, uploadPieceItemRegisterPieces } from '../uploadPieceItem';

export const useUploadEntity = (internalUploadId: string | null | undefined) => {
  const uploadEntity = useAppSelector((state) => selectUploadEntity(internalUploadId)(state));
  return {
    uploadEntity,
  };
};

export const useUploadEntityFiles = (internalUploadId: string | null | undefined) => {
  return useAppSelector((state) => selectFilesByUploadId(internalUploadId)(state));
};
export const useUploadEntityActions = () => {
  const dispatch = useAppDispatch();
  const { metaUploadService, uploadConfigService, hashCalculator } = useServices();
  const create = (): string => {
    return uuid();
  };
  const clear = () => {
    dispatch(uploadItemClearRequest());
    dispatch(uploadClearRequest());
    dispatch(uploadPieceItemClearRequest());
  };

  const upload = async (internalUploadId: string, filesInput: InputFile[], metaData: UploadMetaData, force: boolean) => {
    dispatch(uploadRegister({ internalUploadId, metaData, force }));
    const backoff = {
      maxRetries: uploadConfigService.metaDataApiRetry(),
      baseDelay: uploadConfigService.metaDataApiRetryBackoffDelay(),
    };

    const files: FileMetaData[] = filesInput.map((value, index) => {
      return {
        ...value,
        internalId: metaUploadService.createInternalId(value, index),
      };
    });

    const chunkHashingAlgo = uploadConfigService.chunkHashingAlgo();
    const uploadFilesMetaDataForRegistration: InputUploadFileMetaData[] = files.map((x) => {
      return {
        ...x,
        hash: '',
        type: chunkHashingAlgo,
        internalUploadId: internalUploadId,
        chunks: [],
      };
    });
    dispatch(uploadItemRegisterItems(uploadFilesMetaDataForRegistration));

    const chunkedFiles = await metaUploadService.chunks(files, backoff);

    const totalNumberOfWorkers = uploadConfigService.totalNumberOfWorkers();

    const hashCalcProgressCallback: HashCalcProgress = async (value: OutputFileHashProgressData) => {
      dispatch(uploadItemUpdateIntegrityCheck(value));
    };

    const hashes = (
      await Promise.all(
        hashCalculator.calculateHashes(
          uploadConfigService.hashingAlgo(),
          chunkHashingAlgo,
          files.map((file) => {
            const chunks = chunkedFiles.files.find((chunkedFile) => chunkedFile.relationId === file.internalId);
            return {
              ...file,
              chunks: [
                ...(chunks?.chunks || []).map((x) => {
                  return { start: x.start, end: x.end, chunkNumber: x.index };
                }),
              ],
            };
          }),
          totalNumberOfWorkers,
          uploadConfigService.readerChunkSize(),
          uploadConfigService.metaRetrieveWorker,
          hashCalcProgressCallback,
        ),
      )
    ).flatMap((y) => y);
    hashCalculator.cleanUp();

    const uploadFilesMetaData = files
      .map((x) => {
        const hashMetadata = hashes.find((y) => y.internalId === x.internalId);
        if (hashMetadata) {
          return {
            ...x,
            hash: hashMetadata.hash,
            type: hashMetadata.type,
            internalUploadId: internalUploadId,
            chunks: hashMetadata.chunks,
          };
        } else {
          return undefined;
        }
      })
      .filter((x) => !!x) as InputUploadFileMetaData[];

    dispatch(
      addLoggerRequest({
        loggerCode: 'upload',
        loggerMessage: 'files to upload',
        loggerType: LoggerType.debug,
        data: uploadFilesMetaData,
      }),
    );

    dispatch(uploadUpdateInternalState({ internalUploadId, uploadItems: uploadFilesMetaData.map((x) => x.internalId) }));

    dispatch(uploadItemAddItems(uploadFilesMetaData));
    dispatch(uploadPieceItemRegisterPieces({ chunkHashType: chunkHashingAlgo, uploadFilesMetaData }));

    dispatch(uploadRequest({ internalUploadId }));
  };
  return {
    create,
    upload,
  };
};

export const useUploadEntities = () => {
  return useAppSelector(selectUploadEntityEntities);
};
