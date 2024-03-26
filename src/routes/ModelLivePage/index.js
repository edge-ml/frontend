import { useEffect, useState } from 'react';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';
import { getModels } from '../../services/ApiServices/MlService';
import Loader from '../../modules/loader';
import SetUpBLEConnection from './SetUpBLEConnection';
import LivePage from './LivePage';

const ModelLivePage = ({ modelId }) => {
  const [model, setModel] = useState(undefined);
  const [bleDevice, setbleDevice] = useState(undefined);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getModels().then((models) => {
      console.log(models);
      console.log(modelId);
      const model = models.find((elm) => elm._id === modelId);
      setModel(model);
    });
  }, []);

  const onDeviceDisconnect = () => {
    setBLEDevice(undefined);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const setBLEDevice = (bleDevice) => {
    console.log(bleDevice);
    setbleDevice(bleDevice);
  };

  console.log(bleDevice);

  if (!model) {
    return <Loader></Loader>;
  }
  return (
    <>
      {' '}
      {toastVisible ? (
        <div className="position-absolute fixed-bottom d-flex justify-content-center">
          <Toast>
            <ToastHeader icon="danger">Warning!</ToastHeader>
            <ToastBody>Device disconnected!</ToastBody>
          </Toast>
        </div>
      ) : null}
      <div className="d-flex flex-column" style={{ height: '100vh' }}>
        <div className="d-flex justify-content-center m-2">
          <h2>Use model: {model.name}</h2>
        </div>
        {bleDevice ? (
          <LivePage bleDevice={bleDevice} model={model}></LivePage>
        ) : (
          <SetUpBLEConnection
            model={model}
            setBLEDevice={setBLEDevice}
            onDeviceDisconnect={onDeviceDisconnect}
          ></SetUpBLEConnection>
        )}
      </div>
    </>
  );
};

export default ModelLivePage;
