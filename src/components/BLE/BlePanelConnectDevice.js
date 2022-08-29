import React from 'react';
import SpinnerButton from '../Common/SpinnerButton';
import { Button } from 'reactstrap';

function BlePanelConnectDevice(props) {
  return (
    <div className="shadow p-3 mb-5 bg-white rounded">
      <div className="panelHeader">1. Device</div>
      <small className="text-danger">
        <strong>Warning: </strong>
        If your device can not be found, try to turn bluetooth off and on again
        in your settings.
      </small>
      <div className="panelDivider"></div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {props.connectedBLEDevice ? (
            <div>
              <b>{props.connectedBLEDevice.name}</b> (
              {props.connectedBLEDevice.id})
            </div>
          ) : (
            'No device connected'
          )}
        </div>
        <SpinnerButton
          loadingtext={
            props.connectedBLEDevice ? 'Disconnecting...' : 'Connecting...'
          }
          color={props.connectedBLEDevice ? 'danger' : 'primary'}
          loading={props.bleConnectionChanging}
          onClick={props.toggleBLEDeviceConnection}
        >
          {props.connectedBLEDevice ? 'Disconnect device' : 'Connect device'}
        </SpinnerButton>
      </div>
      {props.hasDFUFunction ? (
        <div>
          <div className="panelDivider"></div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              This device has the ability to flash the edge-ml firmware over
              BLE.
            </div>
            <Button color="primary">Flash edge-ml firmware</Button>
          </div>
        </div>
      ) : null}
      {props.deviceNotUsable ? (
        <div>
          <div className="panelDivider"></div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="text-danger">
              This device does not have the edge-ml firmware installed. Please
              install via the guide
            </div>
            <Button color="primary">Flash edge-ml firmware</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default BlePanelConnectDevice;
