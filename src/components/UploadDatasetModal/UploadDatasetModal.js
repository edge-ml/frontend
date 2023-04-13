import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Progress, ModalFooter } from 'reactstrap';
import DragDrop from '../Common/DragDrop';
import { FiletypeCsv, Check2Circle, XLg, Trash2, Gear, Upload } from 'react-bootstrap-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { processCSVBackend } from '../../services/ApiServices/CSVServices';
import { DatasetConfigView } from './DatasetConfigView';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import './UploadDatasetModal.css';

import { updateDataset } from '../../services/ApiServices/DatasetServices';

export const UploadDatasetModal = ({ isOpen, onCloseModal }) => {
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);

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
            status:
              progress === 100 ? FileStatus.PROCESSING : FileStatus.UPLOADING,
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
          };
        }
        return file;
      })
    );
  };

  const handleCancel = (cancelledFile) => {
    cancelledFile.cancellationHandler();
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === cancelledFile.id) {
          return {
            ...file,
            status: FileStatus.CANCELLED,
          };
        }
        return file;
      })
    );
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

  const extractHeader = (file) => {
    return new Promise((resolve, reject) => {
      const CHUNK_SIZE = 128;
      const decoder = new TextDecoder();
      let offset = 0;
      let results = '';
      const fr = new FileReader();
  
      fr.onload = function() {
        results += decoder.decode(fr.result, {stream: true});
        const lines = results.split('\n');
        if (lines.length > 1) {
          resolve(lines[0]);
        }
        results = lines.pop();
        offset += CHUNK_SIZE;
        seek();
      };
  
      fr.onerror = function() {
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
  }

  const parseHeader = (header) => {
    const fields = header.split(',');
    const unitPattern = /\[([^\[\]]*)\]$/;
    const timeSeries = fields
      .filter(f => f.startsWith('sensor_'))
      .map((f, idx) => {
        const match = f.match(unitPattern);
        const name = match ? f.slice(7, match.index) : f.slice(7);
        const unit = match ? match[1] : '';
        return {
          name: name,
          originalName: name,
          unit: unit,
          removed: false,
          index: idx
        };
      });
      const labelings = fields
      .filter(f => f.startsWith('label_'))
      .map(f => {
        const [, labeling, label] = f.split('_');
        return {
          name: label,
          labelingItBelongs: labeling
        };
      })
      .reduce((acc, label, index) => { // reduce over labels
        const idx = acc.findIndex(labeling => labeling.name === label.labelingItBelongs);
        if (idx >= 0) {
          acc[idx].labels.push(label.name);
          acc[idx].indices.push(index);
        } else {
          acc.push({ // push resulting labelings
            name: label.labelingItBelongs,
            originalName: label.labelingItBelongs,
            removed: false,
            labels: [label.name],
            indices: [index]
          });
        }
        return acc;
      }, [])
      .map((labeling, index) => ({...labeling, index: index}))
    return [timeSeries, labelings];
  }

  const onFileInput = async (inputFiles) => {
    const fileIds = addFiles(inputFiles);
    for (let i = 0; i < inputFiles.length; ++i) {
      const header = await extractHeader(inputFiles[i])
      const [timeSeries, labelings] = parseHeader(header);
      initConfig(fileIds[i], timeSeries, labelings);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('CSVFile', file.csv);
    formData.append('CSVConfig', JSON.stringify(file.config));
    setFiles(prevFiles => prevFiles.map(f => f === file ? { ...f, status: FileStatus.UPLOADING } : f));
    const [cancellationHandler, response] = processCSVBackend(
      formData,
      file.id,
      handleProgress
    );
    setController(file.id, cancellationHandler);
    try {
      const result = await response;
    } catch (err) {
      handleStatus(file.id, FileStatus.ERROR)
      return;
    }
    handleStatus(file.id, FileStatus.COMPLETE);
  }

  const handleUploadAll = () => {
    setFiles(prevFiles => prevFiles.map(f => ({...f, config: {...f.config, editingModeActive: false}})))
    for (const file of files) {
      if (file.status !== FileStatus.CONFIGURATION) {
        continue;
      }
      handleUpload(file)
    }
  }

  const confirmConfig = async (backendId, fileConfig) => {
    const updatedDataset = await updateDataset({
      _id: backendId, 
      name: fileConfig.name,
      start: fileConfig.start,
      end: fileConfig.end,
      labelings: fileConfig.labelings,
      timeSeries: fileConfig.timeSeries,
    })
  }

  return (
    <Modal className="modal-xl" data-testid="modal" isOpen={isOpen}>
      <ModalHeader>
        <span>Create new dataset</span>
        <Button className="modal-close-button" close onClick={onCloseModal} />
      </ModalHeader>
      <ModalBody>
        <DragDrop
          style={{ height: '100px' }}
          className="my-2"
          onFileInput={onFileInput}
        />
        {files ? (
          <div className="mt-2">
            {files.map(
              (f, idx) =>
                (!f.config || !f.config.editingModeActive) ? (
                  <div className="d-flex align-items-center col-sm-2 col-md-4 col-lg-11">
                    <div className="d-flex flex-column align-items-center mr-2 ml-2 mt-2 col-lg-2">
                      <FiletypeCsv className="fa-3x" />
                      <span className='text-center'>{f.name}</span>
                    </div>
                    <Progress
                      className="w-75 mr-1 flex-shrink-0" //remove shrink and set w-100 to align the second button otherwise
                      striped
                      id={`progress-bar-${idx}`}
                      value={f.progress}
                      color={
                        f.status === FileStatus.COMPLETE
                          ? 'success'
                          : f.status === FileStatus.ERROR ||
                            f.status === FileStatus.CANCELLED
                          ? 'danger'
                          : 'primary'
                      }
                    >{f.status === FileStatus.ERROR ? f.status : `${f.status} ${f.progress.toFixed(2)}%`}
                    </Progress>
                    <div className="d-flex align-items-center">
                      {f.status === FileStatus.COMPLETE && (
                        <Button close className="modal-icon-button mr-2" onClick={() => handleDelete(f.id)}>
                          <Check2Circle 
                            size={33}
                            title='Removes item from list'
                            />
                        </Button>
                      )}
                      {f.status === FileStatus.CONFIGURATION && (
                        <div className='d-flex'>
                          <Button close className="modal-icon-button mr-1">
                            <Gear size={29} title='Opens configuration menu' onClick={(e) => changeConfig(f.id, {
                              ...f.config,
                              editingModeActive: true,
                            })} />
                          </Button>
                          <Button close className='modal-icon-button mr-2' onClick={(e) => handleUpload(f)}>
                            <Upload size={29} title='Initiates upload for this file'/>
                          </Button>
                        </div>
                      )}
                      {f.status === FileStatus.UPLOADING && (
                        <Button close title='Cancels ongoing upload' className="modal-icon-button mr-2">
                          <XLg size={29} onClick={(e) => handleCancel(f)} />
                        </Button>
                      )}
                      {f.status === FileStatus.CANCELLED || f.status === FileStatus.ERROR && (
                        <Button close title='Removes item from list' className="modal-icon-button mr-2">
                          <Trash2
                            size={29}
                            onClick={(e) => handleDelete(f.id)}
                          />
                        </Button>
                      )}
                      {f.status === FileStatus.PROCESSING && (
                        <FontAwesomeIcon
                          spin
                          size="2x"
                          style={{marginLeft: '1px'}}
                          className="mr-2"
                          icon={faSpinner}
                        />
                      )}
                    </div>
                  </div>
                ) : 
                (
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
          <Button color='primary'
            disabled={!files.find(f => f.status === FileStatus.CONFIGURATION)}
            onClick={handleUploadAll}
          >
            Upload All
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
