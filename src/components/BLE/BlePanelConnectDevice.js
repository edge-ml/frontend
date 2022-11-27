import React from 'react';
import SpinnerButton from '../Common/SpinnerButton';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';

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
        <small className="text-danger">
          <strong>Warning: </strong>
          If your device can not be found, try to turn bluetooth off and on
          again in your settings.
        </small>
        {props.hasDFUFunction &&
        props.connectedBLEDevice &&
        ((props.isEdgeMLInstalled && props.outdatedVersionInstalled) ||
          !props.isEdgeMLInstalled) ? (
          <div>
            <hr />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {props.isEdgeMLInstalled ? (
                <div>
                  The edge-ml firmware version is outdated. You can update it to
                  the latest version by clicking on the button.
                  <br />
                  Installed version:{' '}
                  <strong>{props.connectedDeviceData.generation}</strong>
                  <br />
                  Latest version: <strong>{props.latestEdgeMLVersion}</strong>
                </div>
              ) : (
                <div>
                  This device does not have the edge-ml firmware installed yet.
                  You can install it by clicking on the button.
                </div>
              )}

              <Button color="primary" onClick={props.toggleDFUModal}>
                Flash edge-ml firmware
              </Button>
            </div>
          </div>
        ) : null}
        {props.deviceNotUsable && props.connectedBLEDevice ? (
          <div>
            <hr />
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
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

export default BlePanelConnectDevice;
