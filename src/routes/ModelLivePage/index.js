import { useEffect, useState } from 'react';
import { getModels } from '../../services/ApiServices/MlService';
import Loader from '../../modules/loader';
import SetUpBLEConnection from './SetUpBLEConnection';
import LivePage from './LivePage';

const ModelLivePage = ({ modelId }) => {
  const [model, setModel] = useState(undefined);
  const [bleDevice, setbleDevice] = useState(undefined);

  useEffect(() => {
    getModels().then((models) => {
      console.log(models);
      console.log(modelId);
      const model = models.find((elm) => elm._id === modelId);
      setModel(model);
    });
  }, []);

  const setBLEDevice = (bleDevice) => {
    console.log(bleDevice);
    setbleDevice(bleDevice);
  };

  if (!model) {
    return <Loader></Loader>;
  }
  return (
    <div className="m-2">
      <div className="d-flex justify-content-center">
        <h2>Use model: {model.name}</h2>
      </div>
      {bleDevice ? (
        <LivePage bleDevice={bleDevice}></LivePage>
      ) : (
        <SetUpBLEConnection
          model={model}
          setBLEDevice={setBLEDevice}
        ></SetUpBLEConnection>
      )}
    </div>
  );
};

export default ModelLivePage;
