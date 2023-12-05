import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Progress,
  ModalFooter,
  Alert,
  ButtonGroup,
} from 'reactstrap';
import DragDrop from '../Common/DragDrop';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faTrashAlt,
  faCog,
  faCheckCircle,
  faCheck,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';

import { processCSVBackend } from '../../services/ApiServices/CSVServices';
import { DatasetConfigView } from './DatasetConfigView';

import './UploadDatasetModal.css';

import {
  getUploadProcessingProgress,
  updateDataset,
} from '../../services/ApiServices/DatasetServices';
import { useInterval } from '../../services/ReactHooksService';

export const UploadDatasetModal = ({
  isOpen,
  onCloseModal,
  onDatasetComplete,
}) => {
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0); // used to create fileId for input files
  const [showWarning, setShowWarning] = useState(false);
  const [consecutiveNoUpdateCount, setConsecutiveNoUpdateCount] = useState(0);
  const MAXIMUM_POLLING_INTERVAL = 60 * 1000; // 60 seconds

  const FileStatus = Object.freeze({
    CONFIGURATION: 'Configuration',
    UPLOADING: 'Uploading',
    PROCESSING: 'Processing',
    COMPLETE: 'Complete',
    ERROR: 'Error',
    CANCELLED: 'Cancelled',
  });

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
    setFiles([...files, ...formatted]);
    setCount(count + inputFiles.length);
    return formatted.map((f) => f.id);
  };

  const setController = (fileId, cancellationHandler) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            cancellationHandler: cancellationHandler,
          };
        }
        return file;
      })
    );
  };

  const handleProgress = (fileId, progress) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            progress,
          };
        }
        return file;
      })
    );
  };

  const handleStatus = (fileId, status) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            status: status,
            progress: status === FileStatus.ERROR ? 100 : file.progress,
          };
        }
        return file;
      })
    );
  };

  const handleCancel = (cancelledFile) => {
    cancelledFile.cancellationHandler();
  };

  const handleDelete = (fileId) => {
    setFiles((prevState) => prevState.filter((file) => file.id !== fileId));
  };

  const initConfig = (fileId, timeSeries, labelings) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            config: {
              timeSeries: timeSeries,
              labelings: labelings,
              name: file.name.endsWith('.csv')
                ? file.name.substring(0, file.name.length - 4)
                : file.name,
              editingModeActive: false,
            },
          };
        }
        return file;
      })
    );
  };

  const changeConfig = (fileId, newConfig) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            config: newConfig,
          };
        }
        return file;
      })
    );
  };

  const extractHeader = (fileId, file) => {
    return new Promise((resolve, reject) => {
      const CHUNK_SIZE = 128;
      const decoder = new TextDecoder();
      let offset = 0;
      let results = '';
      const fr = new FileReader();

      fr.onload = function () {
        results += decoder.decode(fr.result, { stream: true });
        const lines = results.split('\n');
        if (lines.length > 1) {
          resolve(lines[0]);
        }
        results = lines.pop();
        offset += CHUNK_SIZE;
        seek();
      };

      fr.onerror = function () {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, error: fr.error } : f
          )
        );
        reject(fr.error);
      };

      seek();

      function seek() {
        if (offset >= file.size) {
          resolve(results);
          return;
        }
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        fr.readAsArrayBuffer(slice);
      }
    });
  };

  const parseHeader = (header) => {
    const fields = header.split(',').map((f) => f.trim());
    const invalid = fields.find(
      (f) => !f.startsWith('sensor_') && !f.startsWith('label_') && f != 'time'
    );
    if (invalid || fields.length < 2) {
      return [undefined, undefined];
    }
    const unitPattern = /\[([^\[\]]*)\]$/;
    const timeSeries = fields
      .filter((f) => f.startsWith('sensor_'))
      .map((f, idx) => {
        const match = f.match(unitPattern);
        const name = match ? f.slice(7, match.index) : f.slice(7);
        const unit = match ? match[1] : '';
        return {
          name: name,
          originalName: name,
          unit: unit,
          removed: false,
          index: idx,
        };
      });
    const labelings = fields
      .filter((f) => f.startsWith('label_'))
      .map((f) => {
        const [, labeling, label] = f.split('_');
        return {
          name: label,
          labelingItBelongs: labeling,
        };
      })
      .reduce((acc, label, index) => {
        // reduce over labels
        const idx = acc.findIndex(
          (labeling) => labeling.name === label.labelingItBelongs
        );
        if (idx >= 0) {
          acc[idx].labels.push(label.name);
          acc[idx].indices.push(index);
        } else {
          acc.push({
            // push resulting labelings
            name: label.labelingItBelongs,
            originalName: label.labelingItBelongs,
            removed: false,
            labels: [label.name],
            indices: [index],
          });
        }
        return acc;
      }, [])
      .map((labeling, index) => ({ ...labeling, index: index }));
    return [timeSeries, labelings];
  };

  const onFileInput = async (inputFiles) => {
    const fileIds = addFiles(inputFiles);
    for (let i = 0; i < inputFiles.length; ++i) {
      const header = await extractHeader(fileIds[i], inputFiles[i]);
      const [timeSeries, labelings] = parseHeader(header);
      if (!timeSeries || !labelings) {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileIds[i]
              ? {
                  ...f,
                  error: 'Invalid format, parsing failed',
                  status: FileStatus.ERROR,
                  progress: 100,
                }
              : f
          )
        );
        continue;
      }
      initConfig(fileIds[i], timeSeries, labelings);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('CSVFile', file.csv);
    formData.append('CSVConfig', JSON.stringify(file.config));
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
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === file.id
            ? {
                ...f,
                datasetId: result.data.datasetId,
                status: FileStatus.PROCESSING,
                processingStep: 'Started processing',
              }
            : f
        )
      );
      onDatasetComplete();
    } catch (err) {
      const message = err?.response?.data?.detail || err.message;
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === file.id ? { ...f, error: message } : f))
      );
      handleStatus(file.id, FileStatus.ERROR);
      return false;
    }
    return true;
  };

  useInterval(
    async () => {
      let pollResultedInUpdate = false;
      let allComplete = true;
      for (const file of files) {
        // if the file is uploading, skip polling but not count it as complete
        allComplete = allComplete && file.status !== FileStatus.UPLOADING;
        // processing not started yet / already done, skip
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
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    processingStep: step,
                    processedTimeseries: [currentTimeseries, totalTimeseries],
                  }
                : f
            )
          );
        }
        allComplete = allComplete && progress === 100;
      }
      if (allComplete) {
        setConsecutiveNoUpdateCount(null); // stop polling
      } else if (!pollResultedInUpdate) {
        setConsecutiveNoUpdateCount((prevCount) => prevCount + 1);
      } else {
        setConsecutiveNoUpdateCount(0);
      }
    },
    consecutiveNoUpdateCount === null
      ? null
      : Math.min(
          MAXIMUM_POLLING_INTERVAL,
          1.5 ** consecutiveNoUpdateCount * 1000 + Math.random() * 100
        )
  );

  const handleUploadAll = async () => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => ({
        ...f,
        config: { ...f.config, editingModeActive: false },
      }))
    );
    for (const file of files) {
      if (file.status !== FileStatus.CONFIGURATION) {
        continue;
      }
      handleUpload(file);
    }
  };

  const confirmConfig = async (backendId, fileConfig) => {
    const updatedDataset = await updateDataset({
      _id: backendId,
      name: fileConfig.name,
      start: fileConfig.start,
      end: fileConfig.end,
      labelings: fileConfig.labelings,
      timeSeries: fileConfig.timeSeries,
    });
  };

  const handleModalClose = () => {
    const anyOngoing = files.find((f) => f.status === FileStatus.UPLOADING);
    if (anyOngoing) {
      setShowWarning(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    const anyComplete = files.find((f) => f.status === FileStatus.COMPLETE);
    for (const file of files) {
      if (file.status === FileStatus.UPLOADING) {
        handleCancel(file);
      }
    }
    setCount(0);
    setFiles([]);
    if (anyComplete) {
      onCloseModal(true);
    } else {
      onCloseModal(false);
    }
    setShowWarning(false);
  };

  const handleCancelClose = () => {
    setShowWarning(false);
  };

  return (
    <Modal className="modal-xl" data-testid="modal" isOpen={isOpen}>
      <ModalHeader>
        <span>Create new dataset</span>
        <Button
          className="modal-close-button"
          close
          onClick={handleModalClose}
        />
      </ModalHeader>
      <ModalBody>
        <Alert isOpen={showWarning} color="danger">
          <div className="d-flex align-items-center justify-content-between">
            Ongoing uploads will be cancelled if you close the menu! Are you
            sure?
            <div className="d-flex">
              <ButtonGroup>
                <Button color="primary" onClick={handleCancelClose}>
                  <FontAwesomeIcon icon={faBan} />
                </Button>
                <Button color="danger" onClick={handleConfirmClose}>
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Alert>
        <DragDrop
          style={{ height: '100px' }}
          className="my-2"
          onFileInput={onFileInput}
        />
        {files ? (
          <div className="mt-2">
            {files.map((f, idx) =>
              !f.config || !f.config.editingModeActive ? (
                <div
                  key={f.id}
                  className="d-flex align-items-center col-sm-2 col-md-4 col-lg-11"
                >
                  <div className="d-flex flex-column align-items-center mr-2 ml-2 mt-2 col-lg-2">
                    <FontAwesomeIcon icon={faFile} size="3x" />
                    <span className="text-center">{f.name}</span>
                  </div>
                  <Progress
                    className="w-75 mr-1 flex-shrink-0" //remove shrink and set w-100 to align the second button otherwise
                    striped
                    id={`progress-bar-${f.id}`}
                    value={f.progress}
                    color={
                      f.status === FileStatus.COMPLETE
                        ? 'success'
                        : f.status === FileStatus.ERROR ||
                          f.status === FileStatus.CANCELLED
                        ? 'danger'
                        : 'primary'
                    }
                  >
                    {f.status === FileStatus.ERROR
                      ? `Error: ${f.error}`
                      : `${f.status} ${
                          f.status === FileStatus.PROCESSING
                            ? f.processedTimeseries[0]
                              ? `: ${f.processingStep} - Timeseries Processed: ${f.processedTimeseries[0]}/${f.processedTimeseries[1]} `
                              : `: ${f.processingStep} `
                            : ''
                        } ${f.progress.toFixed(2)}%`}
                  </Progress>
                  <div className="d-flex align-items-center">
                    {f.status === FileStatus.COMPLETE && (
                      <Button
                        close
                        className="modal-icon-button mr-2"
                        onClick={() => handleDelete(f.id)}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          style={{ fontSize: '1.2em' }}
                          title="Removes item from list"
                        />
                      </Button>
                    )}
                    {f.status === FileStatus.CONFIGURATION && (
                      <div className="d-flex">
                        <Button close className="modal-icon-button mr-1">
                          <FontAwesomeIcon
                            icon={faCog}
                            title="Opens configuration menu"
                            style={{ fontSize: '1.2em' }}
                            onClick={(e) =>
                              changeConfig(f.id, {
                                ...f.config,
                                editingModeActive: true,
                              })
                            }
                          />
                        </Button>
                        <Button
                          close
                          title="Removes item from list"
                          className="modal-icon-button mr-2"
                          onClick={(e) => handleDelete(f.id)}
                        >
                          <FontAwesomeIcon
                            style={{ fontSize: '1.2em' }}
                            icon={faTrashAlt}
                          />
                        </Button>
                      </div>
                    )}
                    {f.status === FileStatus.UPLOADING && (
                      <Button
                        close
                        title="Cancels ongoing upload"
                        className="modal-icon-button mr-2"
                      >
                        <FontAwesomeIcon
                          icon={faBan}
                          style={{ fontSize: '1.2em' }}
                          onClick={(e) => handleCancel(f)}
                        />
                      </Button>
                    )}
                    {f.status === FileStatus.CANCELLED ||
                      (f.status === FileStatus.ERROR && (
                        <Button
                          close
                          title="Removes item from list"
                          className="modal-icon-button mr-2"
                          onClick={(e) => handleDelete(f.id)}
                        >
                          <FontAwesomeIcon
                            style={{ fontSize: '1.2em' }}
                            icon={faTrashAlt}
                          />
                        </Button>
                      ))}
                    {f.status === FileStatus.PROCESSING && (
                      <FontAwesomeIcon
                        spin
                        size="2x"
                        style={{ marginLeft: '1px' }}
                        className="mr-2"
                        icon={faSpinner}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <DatasetConfigView
                  fileId={f.id}
                  fileConfig={f.config}
                  changeConfig={changeConfig}
                  confirmConfig={confirmConfig}
                  backendId={f.backendId}
                />
              )
            )}
          </div>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <div>
          <Button
            color="primary"
            disabled={!files.find((f) => f.status === FileStatus.CONFIGURATION)}
            onClick={handleUploadAll}
          >
            Upload All
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
