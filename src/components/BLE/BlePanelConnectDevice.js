import React from 'react';
import SpinnerButton from '../Common/SpinnerButton';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';

const getInfoText = (props) => {
  if (!props.connectedBLEDevice) {
    return <div>No device connected</div>;
  }
  if (props.isEdgeMLInstalled) {
    return (
      <div>
        {renderDeviceName(props)}
        {renderDeviceInfo(props)}
        {props.outdatedVersionInstalled && props.hasDFUFunction && (
          <div>
            {' '}
            The edge-ml firmware version is outdated. You can update it to the
            latest version by clicking on the button.
          </div>
        )}
      </div>
    );
  } else {
    if (props.hasDFUFunction) {
      return (
        <div>
          {renderDeviceName(props)}
          <div>
            This device does not have the edge-ml firmware installed yet. You
            can install it by clicking on the button.
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {renderDeviceName(props)}
          <div className="text-danger">
            This device does not have the edge-ml firmware installed. Please
            install via the guide
          </div>
        </div>
      );
    }
  }
};

const renderDeviceName = (props) => {
  if (!props.connectedBLEDevice) {
    return null;
  }
  return (
    <div>
      Connected device:{' '}
      <b>
        {props.connectedDeviceData
          ? props.connectedDeviceData.name
          : props.connectedBLEDevice.name}
      </b>
      ({props.connectedBLEDevice.id})
    </div>
  );
};

const renderDeviceInfo = (props) => {
  return (
    <div>
      Installed version:{' '}
      <strong>{props.connectedDeviceData.installedFWVersion}</strong>
      <br />
      Latest version: <strong>{props.latestEdgeMLVersion}</strong>
    </div>
  );
};

const getButtonView = (props) => {
  if (!props.connectedBLEDevice) {
    return null;
  }
  if (
    (props.outdatedVersionInstalled || !props.isEdgeMLInstalled) &&
    props.hasDFUFunction
  ) {
    return (
      <div>
        <Button color="primary" onClick={props.toggleDFUModal}>
          Flash edge-ml firmware
        </Button>
      </div>
    );
  }
  return null;
};

function BlePanelConnectDevice(props) {
  return (
    <div className="p-2">
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
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          {getInfoText(props)}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginRight: '2',
              padding: '4',
            }}
          >
            <div className="mr-2">{getButtonView(props)}</div>
            <div>
              <SpinnerButton
                loadingtext={
                  props.connectedBLEDevice
                    ? 'Disconnecting...'
                    : 'Connecting...'
                }
                color={props.connectedBLEDevice ? 'danger' : 'primary'}
                loading={props.bleConnectionChanging}
                onClick={props.toggleBLEDeviceConnection}
              >
                {props.connectedBLEDevice
                  ? 'Disconnect device'
                  : 'Connect device'}
              </SpinnerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlePanelConnectDevice;
