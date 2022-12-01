import React from 'react';
import SpinnerButton from '../Common/SpinnerButton';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';

const getInfoText = (props) => {
  if (!props.connectedBLEDevice) {
    return <div>Not device connected</div>;
  }
  return (
    <div>
      {props.isEdgeMLInstalled ? (
        <p>
          The edge-ml firmware version is outdated. You can update it to the
          latest version by clicking on the button.
        </p>
      ) : (
        <p>
          edge-ml is not installed. You can install the latest version by
          clicking on the button.
        </p>
      )}
      <br />
      Installed version:{' '}
      <strong>
        {props.connectedDeviceData
          ? props.connectedDeviceData.installedFWVersion
          : '-'}
      </strong>
      <br />
      Latest version: <strong>{props.latestEdgeMLVersion}</strong>
    </div>
  );
};

const getButtonView = (props) => {
  if (
    props.outdatedVersionInstalled ||
    (props.hasDFUFunction && !props.isEdgeMLInstalled)
  ) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
        }}
      >
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
    <Card className="text-left">
      <CardHeader>
        <h4>1. Device</h4>
      </CardHeader>
      <CardBody>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {getInfoText(props)}
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
        <small className="text-danger">
          <strong>Warning: </strong>
          If your device can not be found, try to turn bluetooth off and on
          again in your settings.
        </small>
        {getButtonView(props)}
      </CardBody>
    </Card>
  );
}

export default BlePanelConnectDevice;
