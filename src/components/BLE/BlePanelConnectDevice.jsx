import React from "react";
import SpinnerButton from "../Common/SpinnerButton";
import { Button } from "reactstrap";

{/* <const getInfoText = (props) => {
  if (!props.connectedBLEDevice) {
    return <div>No device connected</div>;
  }
};> */}

// const renderDeviceName = (props) => {
//   if (!props.connectedBLEDevice) {
//     return null;
//   }
//   return (
//     <div>
//       Connected device:{" "}
//       <b>
//         {props.connectedDeviceData
//           ? props.connectedDeviceData.name
//           : props.connectedBLEDevice.name}
//       </b>
//       ({props.connectedBLEDevice.id})
//     </div>
//   );
// };

// const renderDeviceInfo = (props) => {
//   return (
//     <div>
//       Installed version:{" "}
//       <strong>{props.connectedDeviceData.installedFWVersion}</strong>
//       <br />
//       {props.basicEdgeMLArduinoFirmware &&
//         "Latest version:" + <strong>{props.latestEdgeMLVersion}</strong>}
//     </div>
//   );
// };


function BlePanelConnectDevice({connectedDevice, toggleBLEConnection}) {



  return (
    <div className="m-2">
      <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
        <h4>1. Device</h4>
      </div>
      <div className="body-wrapper p-2">
        <small className="text-danger">
          <strong>Warning: </strong>
          If your device can not be found, try to turn bluetooth off and on
          again in your settings.
        </small>
        <div className="panelDivider" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <div>No device connected</div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginRight: "2",
              padding: "4",
            }}
          >
            <SpinnerButton
              outline
              loadingtext={
                connectedDevice ? "Disconnecting..." : "Connecting..."
              }
              color={connectedDevice ? "danger" : "primary"}
              spinnercolor={connectedDevice ? "danger" : "primary"}
              // loading={props.bleConnectionChanging}
              onClick={toggleBLEConnection}
            >
              {connectedDevice
                ? "Disconnect device"
                : "Connect device"}
            </SpinnerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlePanelConnectDevice;
