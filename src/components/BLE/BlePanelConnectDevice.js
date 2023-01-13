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
        {props.outdatedVersionInstalled && props.hasDFUFunction && (
          <div>
            {' '}
            The edge-ml firmware version is outdated. You can update it to the
            latest version by clicking on the button.
          </div>
        )}
        {renderDeviceInfo(props)}
      </div>
    );
  } else {
    if (props.hasDFUFunction) {
      return (
        <div>
          This device does not have the edge-ml firmware installed yet. You can
          install it by clicking on the button.
        </div>
      );
    } else {
      return (
        <div className="text-danger">
          This device does not have the edge-ml firmware installed. Please
          install via the guide
        </div>
      );
    }
  }
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
    <Card className="text-left mb-2">
      <CardHeader>
        <h4>1. Device</h4>
      </CardHeader>
      <CardBody>
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
      </CardBody>
    </Card>
  );
}

export default BlePanelConnectDevice;
