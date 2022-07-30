import React from 'react';
import SpinnerButton from '../Common/SpinnerButton';
import { Button } from 'reactstrap';
import { useHistory } from 'react-router-dom';

function BlePanelFlashFirmware(props) {
  const history = useHistory();
  return (
    <div className="shadow p-3 mb-5 bg-white rounded">
      <div className="panelHeader">Firmware</div>
      <small className="text-danger">
        <strong>Warning: </strong>
        The device needs to have the edge-ml firmware running. If not already
        installed, you can flash it on the DFU page.
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
          <b>PLACEHOLDER_FIRMAWARE</b>
        </div>
        <Button
          color="primary"
          onClick={() => {
            history.push('./dfu');
          }}
        >
          Flash Firmware
        </Button>
      </div>
    </div>
  );
}

export default BlePanelFlashFirmware;
