import { useEffect, useState, useMemo } from 'react';
import {
  ModalHeader,
  Button,
  Progress,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { getArduinoFirmware } from '../../../services/ApiServices/ArduinoFirmwareServices';
import DFUManager from './DFU';

const DFUModal = ({
  onDisconnection,
  connectedBLEDevice,
  connectedDeviceData,
  latestEdgeMLVersion,
  isEdgeMLInstalled,
  showDFUModal,
  toggleDFUModal,
}) => {
  const [flashState, setFlashState] = useState('start'); //start, connected, downloadingFW, uploading, finished
  const [flashError, setFlashError] = useState(undefined);
  const [flashProgress, setFlashProgress] = useState(0);
  const [connectedDevice, setConnectedDevice] = useState(connectedBLEDevice);

  const dfuManager = useMemo(
    () =>
      new DFUManager(
        setFlashState,
        setFlashError,
        setFlashProgress,
        setConnectedDevice
      ),
    []
  );

  useEffect(() => {
    dfuManager.connectGATTdfu(connectedDevice);
    return () => {
      setFlashState('start');
      setFlashProgress(0);
      setConnectedDevice(undefined);
    };
  }, []);

  useEffect(() => {
    if (flashError) {
      console.log(flashError);
      onDisconnection();
    }
  }, [flashError]);

  const downLoadAndInstallFW = async () => {
    downloadFirmware()
      .then((firmware) => dfuManager.flashFirmware(firmware))
      .catch((err) => {
        setFlashError(err);
      });
  };

  const downloadFirmware = async () => {
    setFlashState('downloadingFW');
    let downloadName = '';
    switch (connectedDeviceData ? connectedDeviceData.name : undefined) {
      case 'NICLA':
        downloadName = 'nicla';
        break;
      case 'NANO':
        downloadName = 'nano';
        break;
      case 'Seeed XIAO':
        downloadName = 'xiao';
        break;
      default:
        downloadName = 'nicla';
        break;
    }
    return getArduinoFirmware(downloadName);
  };

  const renderProgressInfo = () => {
    switch (flashState) {
      case 'start':
        return 'Update has not started yet';
      case 'downloadingFW':
        return 'Downloading firmware...';
      case 'uploading':
        return 'Flashing firmware over BLE...';
      case 'finished':
        return 'The firmware update is completed';
    }
  };

  const renderModalBody = () => {
    if (flashError) {
      return <div className="text-danger">{flashError}</div>;
    } else {
      return (
        <div className="align-items-center">
          <div>
            Connected BLE device:{' '}
            {
              <strong>
                {connectedDeviceData
                  ? connectedDeviceData.name
                  : connectedBLEDevice.name}
              </strong>
            }
          </div>
          <div>
            Latest edge-ml version: <strong>{latestEdgeMLVersion}</strong>
          </div>
          <div>
            {isEdgeMLInstalled
              ? 'This device already has edge-ml installed, but an update is possible. Please do not close this window, while the firmware is flashing.'
              : 'This device does not have edge-ml installed. Flash now to install the firmware. Please do not close this window, while the firmware is flashing.'}
          </div>
          <div className="panelDivider"></div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              You can download and install the latest version of the edge-ml
              firmware by clicking on the update button.
            </div>
            <Button
              outline
              color="primary"
              disabled={flashState !== 'connected'}
              onClick={downLoadAndInstallFW}
            >
              Update firmware
            </Button>
          </div>
          <div className="panelDivider"></div>

          <div className="mt-3">
            <Progress
              color={flashState === 'uploadFinished' ? 'primary' : 'success'}
              value={flashProgress}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderProgressInfo()}
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <Modal
        isOpen={showDFUModal}
        className="modal-xl"
        backdrop="static"
        keyboard={false}
      >
        <ModalHeader>Update firmware</ModalHeader>
        <ModalBody>{renderModalBody()}</ModalBody>
        <ModalFooter>
          <Button
            outline
            color="danger"
            onClick={toggleDFUModal}
            disabled={
              flashState === 'downloadingFW' || flashState === 'uploading'
            }
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
export default DFUModal;
