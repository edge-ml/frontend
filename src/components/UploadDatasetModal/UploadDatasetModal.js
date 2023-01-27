import React, { Component, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
} from 'reactstrap';
import { CloseButton } from 'react-bootstrap';
import DragDrop from '../Common/DragDrop';
import {
  FiletypeCsv,
  CheckLg,
  Check,
  Check2Circle,
  X,
  XLg,
  Trash3Fill,
  Trash3,
  Trash,
  TrashFill,
  Trash2,
  Trash2Fill,
} from 'react-bootstrap-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { processCSVBackend } from '../../services/ApiServices/CSVServices';
import { DatasetConfigView } from './DatasetConfigView';

import './UploadDatasetModal.css';

export const UploadDatasetModal = ({ isOpen, onCloseModal }) => {
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);

  const FileStatus = Object.freeze({
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
      status: FileStatus.UPLOADING,
      id: count + idx,
    }));
    console.log('before fail', files);
    setFiles([...files, ...formatted]);
    setCount(count + inputFiles.length);
    return formatted.map((f) => f.id);
  };

  const setController = (fileId, cancellationHandler) => {
    console.log('setting handler');
    console.log(fileId, cancellationHandler);
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
    // console.log('handling', fileName, progress);
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

  const initConfig = (fileId, data) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            config: {
              start: data.start,
              end: data.end,
              timeSeries: data.timeSeries,
              labelings: data.labelings,
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

  const onFileInput = async (inputFiles) => {
    console.log('onFileInput');
    console.log(inputFiles);
    const fileIds = addFiles(inputFiles);
    let results = [];
    for (let i = 0; i < inputFiles.length; ++i) {
      const formData = new FormData();
      formData.append('CSVFile', inputFiles[i]);
      const [cancellationHandler, response] = processCSVBackend(
        formData,
        fileIds[i],
        handleProgress
      );
      setController(fileIds[i], cancellationHandler);
      const result = await response;
      if (Array.isArray(result)) {
        handleStatus(fileIds[i], FileStatus.ERROR);
        return;
      }
      handleStatus(fileIds[i], FileStatus.COMPLETE);
      initConfig(fileIds[i], result.data);
      // const fileName = inputFiles[i].name;
      // results.push({
      //     dataset: {
      //         ...result.datasets[0],
      //         name: fileName.endsWith('.csv')
      //             ? fileName.substring(0, fileName.length - 4)
      //             : fileName,
      //     },
      //     labeling: result.labelings[0],
      // });
    }

    // // console.log('state')
    // // console.log(this.state.datasets)
    // // console.log('result');
    // // console.log(results.map(e => e.dataset));
    // this.setState({
    //     files: [...this.state.files, ...files],
    //     datasets: [...this.state.datasets, ...results.map((e) => e.dataset)],
    //     labelings: [
    //         ...this.state.labelings,
    //         ...results.map((elm) => elm.labeling.map((innerElm) => innerElm)),
    //     ],
    // });
  };

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
            {/* <h4 className='text-center mt-2'>Upload Overview</h4> */}
            {files.map(
              (f, idx) =>
                (!f.config || !f.config.editingModeActive) && (
                  <div className="d-flex align-items-center col-sm-2 col-md-4 col-lg-11">
                    <div className="d-flex flex-column align-items-center mr-2 ml-2 mt-2 col-lg-2">
                      <FiletypeCsv className="fa-3x" />
                      <span>{f.name}</span>
                    </div>
                    <Progress
                      className="w-100 mr-1"
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
                    >{`${f.status} ${f.progress.toFixed(2)}%`}</Progress>
                    <div className="d-flex align-items-center">
                      {f.status === FileStatus.COMPLETE && (
                        <Check2Circle className="fa-2x mr-2" />
                      )}
                      {f.status === FileStatus.UPLOADING && (
                        <Button close className="modal-icon-button mr-2">
                          <XLg size={29} onClick={(e) => handleCancel(f)} />
                        </Button>
                      )}
                      {f.status === FileStatus.CANCELLED && (
                        <Button close className="modal-icon-button mr-2">
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
                          className="mr-2"
                          icon={faSpinner}
                        />
                      )}
                      <Button
                        color="primary"
                        disabled={f.status !== FileStatus.COMPLETE}
                        onClick={(e) =>
                          changeConfig(f.id, {
                            ...f.config,
                            editingModeActive: true,
                          })
                        }
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                )
            )}
            <div className="mt-1">
              {/* <h4 className='text-center mt-2'>Configurations</h4> */}
              {files.map((f, idx) =>
                f && f.config && f.config.editingModeActive ? (
                  <DatasetConfigView
                    fileId={f.id}
                    fileConfig={f.config}
                    changeConfig={changeConfig}
                  />
                ) : null
              )}
            </div>
          </div>
        ) : null}
      </ModalBody>
      {/* <ModalFooter /> */}
    </Modal>
  );
};
