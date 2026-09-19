import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { processCSVBackend } from "../../services/ApiServices/CSVServices";
import { getUploadProcessingProgress } from "../../services/ApiServices/DatasetServices";
import { useInterval } from "../../services/ReactHooksService";
import { extractHeader, parseHeader } from "./csvParser";

const FileStatus = Object.freeze({
  CONFIGURATION: "Configuration",
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  COMPLETE: "Complete",
  ERROR: "Error",
  CANCELLED: "Cancelled",
});

const INITIAL_POLLING_INTERVAL = 1000;
const MAXIMUM_POLLING_INTERVAL = 60 * 1000;

export { FileStatus };

export const useFileUploads = (onDatasetComplete, onCloseModal) => {
  const [files, setFiles] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(
    INITIAL_POLLING_INTERVAL
  );
  const nextFileId = useRef(0);
  const filesRef = useRef(files);
  filesRef.current = files;

  const updateFile = useCallback((fileId, updates) => {
    setFiles((previousFiles) => {
      const nextFiles = previousFiles.map((file) =>
        file.id === fileId ? { ...file, ...updates } : file
      );
      filesRef.current = nextFiles;
      return nextFiles;
    });
  }, []);

  const addFiles = useCallback((inputFiles) => {
    const formattedFiles = Array.from(inputFiles, (file) => ({
      name: file.name,
      progress: 0,
      status: FileStatus.CONFIGURATION,
      id: nextFileId.current++,
      csv: file,
      error: undefined,
      datasetId: undefined,
      processingStep: undefined,
      processedTimeseries: [undefined, undefined],
    }));

    setFiles((previousFiles) => {
      const nextFiles = [...previousFiles, ...formattedFiles];
      filesRef.current = nextFiles;
      return nextFiles;
    });

    return formattedFiles;
  }, []);

  const onFileInput = useCallback(
    async (inputFiles) => {
      const addedFiles = addFiles(inputFiles);

      for (let index = 0; index < inputFiles.length; index += 1) {
        const file = addedFiles[index];
        try {
          const header = await extractHeader(inputFiles[index]);
          const [timeSeries, labelings] = parseHeader(header);

          if (!timeSeries || !labelings) {
            updateFile(file.id, {
              error: "Invalid format, parsing failed",
              status: FileStatus.ERROR,
              progress: 100,
            });
            continue;
          }

          const name = file.name.endsWith(".csv")
            ? file.name.slice(0, -4)
            : file.name;
          updateFile(file.id, {
            config: {
              timeSeries,
              labelings,
              name,
              editingModeActive: false,
            },
          });
        } catch (error) {
          updateFile(file.id, {
            error: error.message || "Failed to parse file",
            status: FileStatus.ERROR,
            progress: 100,
          });
        }
      }
    },
    [addFiles, updateFile]
  );

  const handleProgress = useCallback(
    (fileId, progress) => updateFile(fileId, { progress }),
    [updateFile]
  );

  const handleUpload = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("CSVFile", file.csv);
      formData.append(
        "CSVConfig",
        JSON.stringify({ ...file.config, editingModeActive: false })
      );
      updateFile(file.id, {
        status: FileStatus.UPLOADING,
        error: undefined,
      });

      const [cancellationHandler, response] = processCSVBackend(
        formData,
        file.id,
        handleProgress
      );
      updateFile(file.id, { cancellationHandler });

      try {
        const result = await response;
        updateFile(file.id, {
          datasetId: result.data.datasetId,
          status: FileStatus.PROCESSING,
          processingStep: "Started processing",
        });
        return true;
      } catch (error) {
        const cancelled =
          axios.isCancel(error) || error?.code === "ERR_CANCELED";
        updateFile(file.id, {
          status: cancelled ? FileStatus.CANCELLED : FileStatus.ERROR,
          progress: 100,
          error: cancelled
            ? "Upload cancelled"
            : error?.response?.data?.detail ||
              error.message ||
              "Failed to upload file",
        });
        return false;
      }
    },
    [handleProgress, updateFile]
  );

  const handleCancel = useCallback(
    (file) => {
      file.cancellationHandler?.();
      updateFile(file.id, {
        status: FileStatus.CANCELLED,
        progress: 100,
        error: "Upload cancelled",
      });
    },
    [updateFile]
  );

  const handleDelete = useCallback((fileId) => {
    setFiles((previousFiles) => {
      const nextFiles = previousFiles.filter((file) => file.id !== fileId);
      filesRef.current = nextFiles;
      return nextFiles;
    });
  }, []);

  const changeConfig = useCallback(
    (fileId, newConfig) => updateFile(fileId, { config: newConfig }),
    [updateFile]
  );

  const handleConfirmClose = useCallback(() => {
    filesRef.current
      .filter((file) => file.status === FileStatus.UPLOADING)
      .forEach((file) => file.cancellationHandler?.());

    filesRef.current = [];
    setFiles([]);
    setShowWarning(false);
    setPollingInterval(INITIAL_POLLING_INTERVAL);
    onCloseModal();
  }, [onCloseModal]);

  const handleModalClose = useCallback(() => {
    const hasOngoingUpload = filesRef.current.some(
      (file) => file.status === FileStatus.UPLOADING
    );
    if (hasOngoingUpload) {
      setShowWarning(true);
      return;
    }
    handleConfirmClose();
  }, [handleConfirmClose]);

  const handleUploadAll = useCallback(async () => {
    const uploadableFiles = filesRef.current
      .filter((file) => file.status === FileStatus.CONFIGURATION && file.config)
      .map((file) => ({
        ...file,
        config: { ...file.config, editingModeActive: false },
      }));

    setFiles((previousFiles) => {
      const nextFiles = previousFiles.map((file) => {
        const uploadable = uploadableFiles.find((item) => item.id === file.id);
        return uploadable ? { ...file, config: uploadable.config } : file;
      });
      filesRef.current = nextFiles;
      return nextFiles;
    });

    await Promise.all(uploadableFiles.map(handleUpload));
  }, [handleUpload]);

  const pollProcessingFiles = useCallback(async () => {
    const currentFiles = filesRef.current;
    const processingFiles = currentFiles.filter(
      (file) => file.status === FileStatus.PROCESSING && file.datasetId
    );

    if (processingFiles.length === 0) {
      setPollingInterval(INITIAL_POLLING_INTERVAL);
      return;
    }

    const progressResults = await Promise.all(
      processingFiles.map(async (file) => {
        try {
          const progress = await getUploadProcessingProgress(file.datasetId);
          return { file, progress };
        } catch (error) {
          return { file, error };
        }
      })
    );

    let completedFile = false;
    let changed = false;
    const nextFiles = currentFiles.map((file) => {
      const result = progressResults.find((item) => item.file.id === file.id);
      if (!result) return file;

      if (result.error) {
        changed = true;
        return {
          ...file,
          status: FileStatus.ERROR,
          progress: 100,
          error:
            result.error?.response?.data?.detail ||
            result.error.message ||
            "Failed to read processing progress",
        };
      }

      const [processingStep, progress, currentTimeseries, totalTimeseries] =
        result.progress;
      const complete = progress >= 100;
      changed = true;
      if (complete && file.status !== FileStatus.COMPLETE) {
        completedFile = true;
      }

      return {
        ...file,
        status: complete ? FileStatus.COMPLETE : FileStatus.PROCESSING,
        progress,
        processingStep,
        processedTimeseries: [currentTimeseries, totalTimeseries],
      };
    });

    if (!changed) return;

    filesRef.current = nextFiles;
    setFiles(nextFiles);

    if (completedFile) {
      onDatasetComplete?.();
      if (nextFiles.every((file) => file.status === FileStatus.COMPLETE)) {
        handleConfirmClose();
        return;
      }
      setPollingInterval(INITIAL_POLLING_INTERVAL);
    } else {
      setPollingInterval((previous) =>
        Math.min(MAXIMUM_POLLING_INTERVAL, previous * 1.5)
      );
    }
  }, [handleConfirmClose, onDatasetComplete]);

  const hasProcessingFiles = files.some(
    (file) => file.status === FileStatus.PROCESSING
  );
  useInterval(pollProcessingFiles, hasProcessingFiles ? pollingInterval : null);

  return {
    files,
    showWarning,
    onFileInput,
    handleUploadAll,
    handleModalClose,
    handleDelete,
    handleCancel,
    handleConfirmClose,
    handleCancelClose: () => setShowWarning(false),
    changeConfig,
    FileStatus,
  };
};
