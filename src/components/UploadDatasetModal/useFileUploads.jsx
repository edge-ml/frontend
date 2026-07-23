import { useState, useCallback, useRef } from "react";
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

const MAXIMUM_POLLING_INTERVAL = 60 * 1000;

export { FileStatus };

export const useFileUploads = (onDatasetComplete, onCloseModal) => {
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [consecutiveNoUpdateCount, setConsecutiveNoUpdateCount] = useState(0);
  const filesRef = useRef(files);
  filesRef.current = files;

  const updateFile = (fileId, updates) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
    );
  };

  const addFiles = (inputFiles) => {
    const formatted = [...inputFiles].map((f, idx) => ({
      name: f.name,
      progress: 0,
      status: FileStatus.CONFIGURATION,
      id: count + idx,
      csv: inputFiles[idx],
      error: undefined,
      datasetId: undefined,
      processingStep: undefined,
      processedTimeseries: [undefined, undefined],
    }));
    setFiles((prev) => [...prev, ...formatted]);
    setCount((prev) => prev + inputFiles.length);
    return formatted.map((f) => f.id);
  };

  const setController = (fileId, cancellationHandler) => {
    updateFile(fileId, { cancellationHandler });
  };

  const handleProgress = (fileId, progress) => {
    updateFile(fileId, { progress });
  };

  const handleStatus = (fileId, status) => {
    if (status === FileStatus.ERROR) {
      updateFile(fileId, { status, progress: 100 });
    } else {
      updateFile(fileId, { status });
    }
  };

  const handleCancel = (cancelledFile) => {
    cancelledFile.cancellationHandler();
  };

  const handleDelete = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const changeConfig = (fileId, newConfig) => {
    updateFile(fileId, { config: newConfig });
  };

  const initConfig = (fileId, timeSeries, labelings) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) return file;
        const name = file.name.endsWith(".csv")
          ? file.name.substring(0, file.name.length - 4)
          : file.name;
        return {
          ...file,
          config: { timeSeries, labelings, name, editingModeActive: false },
        };
      })
    );
  };

  const onFileInput = async (inputFiles) => {
    const fileIds = addFiles(inputFiles);
    for (let i = 0; i < inputFiles.length; ++i) {
      try {
        const header = await extractHeader(inputFiles[i]);
        const [timeSeries, labelings] = parseHeader(header);
        if (!timeSeries || !labelings) {
          updateFile(fileIds[i], {
            error: "Invalid format, parsing failed",
            status: FileStatus.ERROR,
            progress: 100,
          });
          continue;
        }
        initConfig(fileIds[i], timeSeries, labelings);
      } catch (err) {
        updateFile(fileIds[i], {
          error: err.message || "Failed to parse file",
          status: FileStatus.ERROR,
          progress: 100,
        });
      }
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("CSVFile", file.csv);
    formData.append("CSVConfig", JSON.stringify(file.config));
    handleStatus(file.id, FileStatus.UPLOADING);
    setConsecutiveNoUpdateCount(0);
    const [cancellationHandler, response] = processCSVBackend(
      formData,
      file.id,
      handleProgress
    );
    setController(file.id, cancellationHandler);
    try {
      const result = await response;
      updateFile(file.id, {
        datasetId: result.data.datasetId,
        status: FileStatus.PROCESSING,
        processingStep: "Started processing",
      });
      onDatasetComplete();
    } catch (err) {
      const message = err?.response?.data?.detail || err.message;
      updateFile(file.id, { error: message });
      handleStatus(file.id, FileStatus.ERROR);
      return false;
    }
    return true;
  };

  useInterval(
    () => {
      const currentFiles = filesRef.current;
      let pollResultedInUpdate = false;
      let allComplete = true;

      const poll = async () => {
        for (const file of currentFiles) {
          allComplete = allComplete && file.status !== FileStatus.UPLOADING;
          if (
            file.datasetId === undefined ||
            file.status === FileStatus.COMPLETE
          ) {
            continue;
          }
          const [
            step,
            progress,
            currentTimeseries = undefined,
            totalTimeseries = undefined,
          ] = await getUploadProcessingProgress(file.datasetId);
          if (
            step !== file.processingStep ||
            file.processedTimeseries[0] !== currentTimeseries
          ) {
            pollResultedInUpdate = true;
            if (progress === 100) {
              handleStatus(file.id, FileStatus.COMPLETE);
            }
            updateFile(file.id, {
              processingStep: step,
              processedTimeseries: [currentTimeseries, totalTimeseries],
            });
            allComplete = allComplete && progress === 100;
          }
        }

        if (allComplete) {
          setConsecutiveNoUpdateCount(null);
          if (currentFiles.length > 0) {
            handleModalClose();
          }
        } else if (!pollResultedInUpdate) {
          setConsecutiveNoUpdateCount((prevCount) => prevCount + 1);
        } else {
          setConsecutiveNoUpdateCount(0);
        }
      };

      poll();
    },
    consecutiveNoUpdateCount === null
      ? null
      : Math.min(
          MAXIMUM_POLLING_INTERVAL,
          1.5 ** consecutiveNoUpdateCount * 1000 + Math.random() * 100
        )
  );

  const handleUploadAll = async () => {
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        config: { ...f.config, editingModeActive: false },
      }))
    );
    await Promise.all(
      files
        .filter((elm) => elm.status === FileStatus.CONFIGURATION)
        .map((elm) => handleUpload(elm))
    );
  };

  const handleModalClose = () => {
    const anyOngoing = filesRef.current.find(
      (f) => f.status === FileStatus.UPLOADING
    );
    if (anyOngoing) {
      setShowWarning(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    const current = filesRef.current;
    const anyComplete = current.find((f) => f.status === FileStatus.COMPLETE);
    for (const file of current) {
      if (file.status === FileStatus.UPLOADING) {
        handleCancel(file);
      }
    }
    setCount(0);
    setFiles([]);
    setShowWarning(false);
    onCloseModal();
  };

  const handleCancelClose = () => {
    setShowWarning(false);
  };

  return {
    files,
    showWarning,
    onFileInput,
    handleUploadAll,
    handleModalClose,
    handleDelete,
    handleCancel,
    handleConfirmClose,
    handleCancelClose,
    changeConfig,
    FileStatus,
  };
};
