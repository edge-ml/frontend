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
} from 'react-bootstrap-icons';
import { ProgressBar } from 'react-bootstrap';
import { processCSVBackend } from '../../services/ApiServices/CSVServices';

import './UploadDatasetModal.css';

export const UploadDatasetModal = ({ isOpen, onCloseModal }) => {
  const [files, setFiles] = useState([]);

  const FileStatus = Object.freeze({
    UPLOADING: 'Uploading',
    PROCESSING: 'Processing',
    COMPLETE: 'Complete',
    ERROR: 'Error',
    CANCELLED: 'Cancelled',
  });

  const addFiles = (inputFiles) => {
    const formatted = [...inputFiles].map((f) => ({
      name: f.name,
      progress: 0,
      status: FileStatus.UPLOADING,
    }));
    setFiles([...files, ...formatted]);
  };

  const handleProgress = (fileName, progress) => {
    console.log('handling', fileName, progress);
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.name === fileName) {
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

  const handleStatus = (fileName, status) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.name === fileName) {
          return {
            ...file,
            status: status,
          };
        }
        return file;
      })
    );
  };

  const onFileInput = async (inputFiles) => {
    console.log('onFileInput');
    console.log(inputFiles);
    // const formatted = [...inputFiles].map(f => ({ name: f.name, progress: 0, status: FileStatus.UPLOADING }))
    // setFiles(formatted);
    addFiles(inputFiles);
    let results = [];
    for (let i = 0; i < inputFiles.length; ++i) {
      const formData = new FormData();
      formData.append('CSVFile', inputFiles[i]);
      const result = await processCSVBackend(
        formData,
        inputFiles[i].name,
        handleProgress
      );
      if (Array.isArray(result)) {
        handleStatus(inputFiles[i].name, FileStatus.ERROR);
        return;
      }
      handleStatus(inputFiles[i].name, FileStatus.COMPLETE);
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
          <div className="d-flex flex-column align-items-start mt-1">
            {files.map((f, idx) => (
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
                  {f.status === FileStatus.COMPLETE ? (
                    <Check2Circle className="fa-2x mr-2" />
                  ) : (
                    <Button close className="modal-cancel-button mr-2">
                      <XLg size={29} onClick={(e) => console.log('pressed')} />
                    </Button>
                  )}
                  <Button
                    color="primary"
                    disabled={f.status !== FileStatus.COMPLETE}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </ModalBody>
      <ModalFooter />
    </Modal>
  );
};
