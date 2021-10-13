import React from 'react';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  Spinner
} from 'reactstrap';

function BlePanelConnectDevice(props) {
  return (
    <div className="shadow p-3 mb-5 bg-white rounded">
      <div className="panelHeader">1. Device</div>
      <div className="panelDivider"></div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
        <Button
          color={props.connectedBLEDevice ? 'danger' : 'primary'}
          onClick={props.toggleBLEDeviceConnection}
        >
          {props.connectedBLEDevice ? 'Disconnect device' : 'Connect device'}
        </Button>
      </div>
    </div>
  );
}

export default BlePanelConnectDevice;
