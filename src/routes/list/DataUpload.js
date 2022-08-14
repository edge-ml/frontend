import { faCode, faFile, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React from 'react';
import { Button } from 'reactstrap';

const DataUpload = () => {
  return (
    <div className="card d-flex flex-row mb-4" style={{ display: 'flex' }}>
      <div className="card-body d-flex flex-column text-left">
        <div className="mb-3">
          <b>Data Upload</b>
        </div>
        <div className="d-flex flex-row align-items-stretch">
          <div
            className="d-flex flex-row justify-content-center align-items-start mr-5"
            style={{ flex: '1 1 0px' }}
          >
            <FontAwesomeIcon
              className="mr-3 mt-1"
              icon={faMicrochip}
              style={{ fontSize: 'x-large' }}
            ></FontAwesomeIcon>
            <div className="d-flex flex-column justify-content-between h-100">
              <div className="d-flex flex-column">
                <div>
                  <small>
                    <b>Direct Connect</b>
                  </small>
                </div>
                <small>
                  If you own a{' '}
                  <a
                    href="https://docs.arduino.cc/hardware/nicla-sense-me"
                    target="_blank"
                  >
                    Bosch Arduino Nicle Sense ME
                  </a>{' '}
                  or a{' '}
                  <a
                    href="https://docs.arduino.cc/hardware/nano-33-ble-sense"
                    target="_blank"
                  >
                    Arduino Nano 33 BLE Sense
                  </a>{' '}
                  you can connect to it directly from your browser using WebBLE.
                  Simply follow the instructions on{' '}
                  <a
                    href="https://github.com/edge-ml/EdgeML-Arduino"
                    target="_blank"
                  >
                    EdgeML-Arduino-Github
                  </a>{' '}
                  to get your device ready.
                </small>
              </div>

              <Button
                id="buttonUploadFromBle"
                block
                className="mt-2"
                color="success"
                outline
                onClick={this.onUploadBLE}
                style={{ padding: '0px' }}
              >
                <small>Connect to Bluetooth Device</small>
              </Button>
            </div>
          </div>
          <div
            className="d-flex flex-row justify-content-center align-items-start mr-5"
            style={{ flex: '1 1 0px' }}
          >
            <FontAwesomeIcon
              className="mr-3 mt-1"
              icon={faFile}
              style={{ fontSize: 'x-large' }}
            ></FontAwesomeIcon>
            <div className="d-flex flex-column justify-content-between h-100">
              <div className="d-flex flex-column">
                <div>
                  <small>
                    <b>File Upload</b>
                  </small>
                </div>
                <small>
                  If you have already collected data you can upload it to
                  edge-ml by following our{' '}
                  <a
                    href="https://github.com/edge-ml/edge-ml/wiki#CSV-Header-Format"
                    target="_blank"
                  >
                    pre-defined CSV format
                  </a>
                  . Click{' '}
                  <a href="/example_file.csv" download="example_file.csv">
                    here
                  </a>{' '}
                  to download an example CSV file. You can also upload
                  pre-labeled data.
                </small>
              </div>
              <Button
                id="buttonCreateDatasets"
                className="mt-2"
                color="success"
                outline
                onClick={this.toggleCreateNewDatasetModal}
                style={{ padding: '0px' }}
              >
                <small>Upload CSV Files</small>
              </Button>
            </div>
          </div>
          <div
            className="d-flex flex-row justify-content-center align-items-start"
            style={{ flex: '1 1 0px' }}
          >
            <FontAwesomeIcon
              className="mr-3 mt-1"
              icon={faCode}
              style={{ fontSize: 'x-large' }}
            ></FontAwesomeIcon>
            <div className="d-flex flex-column justify-content-between h-100">
              <div className="d-flex flex-column">
                <div>
                  <small>
                    <b>Library Upload</b>
                  </small>
                </div>
                <small>
                  If you have built a custom device and would like to upload
                  data from it directly to edge-ml you can use our dedicated
                  libraries for{' '}
                  <a href="https://github.com/edge-ml/arduino" target="_blank">
                    Arduino&nbsp;(ESP32)
                  </a>
                  ,{' '}
                  <a href="https://github.com/edge-ml/node" target="_blank">
                    node.js
                  </a>
                  , and{' '}
                  <a href="https://github.com/edge-ml/java" target="_blank">
                    Java&nbsp;(Android)
                  </a>
                  .
                </small>
              </div>
              <Button
                id="buttonUploadFromCode"
                block
                className="mt-2"
                color="success"
                outline
                onClick={this.onUploadFromCode}
                style={{ padding: '0px' }}
              >
                <small>Generate Code for my Device</small>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
