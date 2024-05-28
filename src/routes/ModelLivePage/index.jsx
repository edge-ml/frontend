import { useEffect, useState } from 'react';
import { Container, Toast, ToastBody, ToastHeader } from 'reactstrap';
import { getModels } from '../../services/ApiServices/MlService';
import Loader from '../../modules/loader';
import SetUpBLEConnection from './SetUpBLEConnection';
import LivePage from './LivePage';
import LabelBadge from '../../components/Common/LabelBadge';

const ModelLivePage = ({ modelId }) => {
  const [model, setModel] = useState(undefined);
  const [bleDevice, setbleDevice] = useState(undefined);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getModels().then((models) => {
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
    setbleDevice(bleDevice);
  };

  if (!model) {
    return <Loader></Loader>;
  }
  return (
    <>
      {toastVisible ? (
        <div className="position-absolute fixed-bottom d-flex justify-content-center">
          <Toast>
            <ToastHeader icon="danger">Warning!</ToastHeader>
            <ToastBody>Device disconnected!</ToastBody>
          </Toast>
        </div>
      ) : null}
      <div
        className="d-flex flex-column overflow-hidden"
        style={{ height: '100vh' }}
      >
        <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2 pt-3">
          <h4 className="font-weight-bold">{'LIVE MODEL'}</h4>
          <div className="d-flex justify-content-left m-2">
            <div className="font-large mt-5">
              <h5>
                <b>Use model:</b> {model.name}
              </h5>
              <div>
                <h5 className="d-flex align-items-center">
                  <b>Labels in the model: </b>
                  {model.labels.map((elm) => (
                    <LabelBadge color={elm.color}>{elm.name}</LabelBadge>
                  ))}
                </h5>
              </div>
            </div>
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
      </div>
    </>
  );
};

export default ModelLivePage;
