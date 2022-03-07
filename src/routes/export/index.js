import React, { useState, useEffect } from 'react';
import Loader from '../../modules/loader';
import { ExportView } from './ExportView';
import { ExportDetailView } from './ExportDetailView';

import {
  getTrainedModels,
  getTrained,
  getDeployment,
  getModelDeployments,
  deleteDeployment,
  deployModel,
  getModels
} from '../../services/ApiServices/MlService';

const ExportPage = () => {
  const [models, setModels] = useState([]); // {id: string, name: string, creation_date: number, classifier: string, accuracy: number, precision: number, f1_score: number}[]
  const [deployments, setDeployments] = useState([]); // {key: string, name: string, creation_date: number}[]
  let [selectedModel, setSelectedModel] = useState(null);
  let [selectedDeployment, setSelectedDeployment] = useState(null);
  const [baseModels, setBaseModels] = useState(null);

  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    getModels().then(m => {
      setBaseModels(m);
    });

    update();
  }, []);

  const update = async () => setModels(await getTrainedModels());
  const updateDeployments = async modelId =>
    setDeployments(await getModelDeployments(modelId));

  const selectModel = async modelId => {
    const model = await getTrained(modelId);
    setSelectedModel(model);

    await updateDeployments();
  };
  const selectDeployment = async key =>
    setSelectedDeployment(await getDeployment(key));
  const del = async key => {
    await deleteDeployment(key);

    setSelectedDeployment(null);
    await updateDeployments(selectedModel.id);
  };
  const deployNew = async () => {
    const deploymentKey = await deployModel();
    const deployment = await getDeployment();

    setSelectedDeployment(deployment);
    await updateDeployments(selectedModel.id);
  };
  const changeDeploymentName = async (key, name) => {
    await changeDeploymentName(key, name);
    await updateDeployments(selectedModel.id);
    await selectDeployment(key);
  };

  selectedDeployment = {
    key: 'wehdfijulawehcf3iu4tghoqw3984'
  };

  selectedModel = {
    id: 1,
    name: 'modelname'
  };

  return (
    <Loader loading={!baseModels}>
      <ExportView
        models={models}
        deployments={deployments}
        selectModel={selectModel}
        selectDeployment={selectDeployment}
        onDeployNew={deployNew}
        detail={
          true ? (
            <ExportDetailView
              model={selectedModel}
              baseModels={baseModels}
              deployment={selectedDeployment}
              platform={platform}
              onPlatform={setPlatform}
            />
          ) : null
        }
      />
    </Loader>
  );
};

export default ExportPage;
