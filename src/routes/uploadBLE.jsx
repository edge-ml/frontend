import React, { useRef, useState } from "react";
import { Col, Row } from "reactstrap";

import BleNotActivated from "../components/BLE/BleNotActivated";
import BlePanelSensorList from "../components/BLE/BlePanelSensorList";
import BlePanelRecorderSettings from "../components/BLE/BlePanelRecorderSettings";
import BlePanelConnectDevice from "../components/BLE/BlePanelConnectDevice";

import BlePanelRecordingDisplay from "../components/BLE/BlePanelRecordingDisplay";
import { BleLabelingMenu } from "../components/BLE/BleLabelingMenu";

import useBLEDevice from "../Hooks/useBLEDevice";
import useBLERecorder from "../Hooks/useBLERecorder";

const UploadBLE = () => {
  const componentRef = useRef(null);
  const [currentData] = useState([]);
  const [sensorKeys] = useState([]);
  const shortcutKeys = "1234567890abcdefghijklmnopqrstuvwxyz";

  const { connectedDevice, toggleBLEConnection, getOptionalServices } =
    useBLEDevice();
  // const {
  //   datasetName,
  //   setDatasetName,
  //   selectedSensors,
  //   recorderState,
  //   onClickRecordButton,
  // } = useBLERecorder(connectedDevice);

  const bleRecorder = useBLERecorder(connectedDevice);

  // const {
  //   bleConnectionChanging,
  //   connectedBLEDevice,
  //   bleStatus,
  //   deviceSensors,
  //   connectedDeviceData,
  //   hasDFUFunction,
  //   isEdgeMLInstalled,
  //   deviceNotUsable,
  //   latestEdgeMLVersion,
  //   outdatedVersionInstalled,
  //   bleDeviceProcessor,
  //   toggleBLEDeviceConnection,
  //   onDisconnection,
  // } = useBLEDevice();

  // const {
  //   datasetName,
  //   recorderState,
  //   selectedSensors,
  //   // latency,
  //   stream,
  //   fullSampleRate,
  //   labelings,
  //   selectedLabeling,
  //   currentLabel,
  //   prevLabel,
  //   onClickRecordButton,
  //   onDatasetNameChanged,
  //   onToggleSensor,
  //   onToggleStream,
  //   onToggleSampleRate,
  //   // toggleLabelingActive,
  //   // resetLabelingState,
  //   handleLabelingSelect,
  //   handleKeyDown,
  // } = useBLERecorder(bleDeviceProcessor);

  // if (!bleStatus) {
  //   return <BleNotActivated />;
  // }

  return (
    <div
      className="bleActivatedContainer"
      ref={componentRef}
      // onKeyDown={handleKeyDown}
      tabIndex="0"
      style={{ outline: "none" }}
    >
      <div className="mb-2">
        <BlePanelConnectDevice
          connectedDevice={connectedDevice}
          toggleBLEConnection={toggleBLEConnection}
          // bleConnectionChanging={bleConnectionChanging}
          // toggleBLEDeviceConnection={toggleBLEDeviceConnection}
          // connectedBLEDevice={connectedBLEDevice}
          // deviceNotUsable={deviceNotUsable}
          // connectedDeviceData={connectedDeviceData}
        />
      </div>
      {connectedDevice && (
        <Row>
          <Col>
            {console.log("connectedBLEDevice", connectedDevice)}
            <BlePanelSensorList
              bleRecorder={bleRecorder}
              bleDeviceHandler={connectedDevice}
            ></BlePanelSensorList>
          </Col>
          <Col>
            <BlePanelRecorderSettings
              bleRecorder={bleRecorder}
              bleDeviceHandler={connectedDevice}
            ></BlePanelRecorderSettings>
          </Col>
        </Row>
      )}

      {/* {deviceSensors && connectedBLEDevice && isEdgeMLInstalled ? (
        <>
          <Row>
            <Col>
              <BlePanelSensorList
                maxSampleRate={connectedDeviceData.maxSampleRate}
                selectedSensors={selectedSensors}
                onChangeSampleRate={() => {}}
                sensors={deviceSensors}
                onToggleSensor={onToggleSensor}
                disabled={recorderState !== "ready"}
              />
            </Col>
            <Col>
              <BlePanelRecorderSettings
                onDatasetNameChanged={onDatasetNameChanged}
                onGlobalSampleRateChanged={() => {}}
                datasetName={datasetName}
                sampleRate={fullSampleRate}
                onClickRecordButton={onClickRecordButton}
                recorderState={recorderState}
                sensorsSelected={selectedSensors.size > 0}
                onToggleStream={onToggleStream}
                onToggleSampleRate={onToggleSampleRate}
                fullSampleRate={fullSampleRate}
              />
              <BleLabelingMenu
                labelings={labelings}
                selectedLabeling={selectedLabeling}
                handleSelectLabeling={handleLabelingSelect}
                handleSelectLabel={() => {}}
                shortcutKeys={shortcutKeys}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {recorderState === "recording" && stream && (
                <BlePanelRecordingDisplay
                  deviceSensors={deviceSensors}
                  selectedSensors={selectedSensors}
                  lastData={currentData}
                  sensorKeys={sensorKeys}
                  fullSampleRate={fullSampleRate}
                  currentLabel={currentLabel}
                  prevLabel={prevLabel}
                />
              )}
            </Col>
          </Row>
        </>
      ) : null} */}
    </div>
  );
};

export default UploadBLE;
