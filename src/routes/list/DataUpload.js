import {
  faCode,
  faFile,
  faMicrochip,
  faMobileAlt,
  faPhone,
  faPhoneAlt,
  faPhoneSquare,
  faPhoneSquareAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';

const DataUpload = (props) => {
  const history = useHistory();

  return (
    <div
      style={{
        background: 'linear-gradient(rgb(26, 32, 44), rgb(45, 55, 72))',
      }}
      className="p-4 pt-4 pb-5 mb-4 data-upload-panel"
    >
      <div className="mt-2 mb-4" style={{ color: 'white', opacity: 0.7 }}>
        <b>DATA UPLOAD</b>
      </div>
      <Row>
        <Col
          className="col-sm-6 col-xl-3 col-12 p-3 d-flex flex-row align-items-start justify-content-start"
          style={{ color: 'white' }}
        >
          <div className="data-upload-icon">
            <FontAwesomeIcon icon={faMicrochip} size="xs" />
          </div>
          <div className="w-100 h-100 d-flex flex-column align-items-start justify-content-between">
            <div>
              <small>
                <b>WebBLE Direct Connect</b>
                <br />
                Learn how to prepare your Arduino{' '}
                <a
                  href="https://github.com/edge-ml/EdgeML-Arduino"
                  target="_blank"
                >
                  here
                </a>
                .
              </small>
            </div>
            <Button
              id="buttonUploadFromBle"
              className="mt-2 btn-upload align-self-stretch align-self-md-start"
              color="secondary"
              onClick={() => {
                history.push('./ble');
              }}
              style={{ padding: '0px' }}
            >
              <small>Connect BLE Device</small>
            </Button>
          </div>
        </Col>
        <Col
          className="col-sm-6 col-xl-3 col-12 p-3 d-flex flex-row align-items-start justify-content-start"
          style={{ color: 'white' }}
        >
          <div className="data-upload-icon">
            <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
          </div>
          <div className="w-100 h-100 d-flex flex-column align-items-start justify-content-between">
            <div>
              <small>
                <b>CSV File Upload</b>
                <br />
                Learn how to prepare your CSV file{' '}
                <a
                  href="https://github.com/edge-ml/EdgeML-Arduino"
                  target="_blank"
                >
                  here
                </a>
                .
              </small>
            </div>
            <Button
              id="buttonUploadFromFile"
              className="mt-2 btn-upload align-self-stretch align-self-md-start"
              color="secondary"
              onClick={e => props.toggleCreateNewDatasetModal()}
              style={{ padding: '0px' }}
            >
              <small>Upload CSV Files</small>
            </Button>
          </div>
        </Col>
        <Col
          className="col-sm-6 col-xl-3 col-12 p-3 d-flex flex-row align-items-start justify-content-start"
          style={{ color: 'white' }}
        >
          <div className="data-upload-icon">
            <FontAwesomeIcon icon={faCode}></FontAwesomeIcon>
          </div>
          <div className="w-100 h-100 d-flex flex-column align-items-start justify-content-between">
            <div>
              <small>
                <b>Library Upload</b>
                <br />
                Implement custom logic using edge-ml libraries.
              </small>
            </div>
            <Button
              id="buttonUploadFromCode"
              className="mt-2 btn-upload align-self-stretch align-self-md-start"
              color="secondary"
              onClick={() => {
                history.push('./settings/getCode');
              }}
              style={{ padding: '0px' }}
            >
              <small>Generate Code</small>
            </Button>
          </div>
        </Col>
        <Col
          className="col-sm-6 col-xl-3 col-12 p-3 d-flex flex-row align-items-start justify-content-start"
          style={{ color: 'white' }}
        >
          <div className="data-upload-icon">
            <FontAwesomeIcon icon={faMobileAlt}></FontAwesomeIcon>
          </div>
          <div className="w-100 h-100 d-flex flex-column align-items-start justify-content-between">
            <div>
              <small>
                <b>Web Sensor API</b>
                <br />
                Collect sensor data of smartphone in browser.
              </small>
            </div>
            <Button
              id="buttonUploadWeb"
              className="mt-2 btn-upload align-self-stretch align-self-md-start"
              color="secondary"
              onClick={() => {
                history.push('./uploadWeb');
              }}
              style={{ padding: '0px' }}
            >
              <small>Collect Web Sensor Data</small>
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DataUpload;
