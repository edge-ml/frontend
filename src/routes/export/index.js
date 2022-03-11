import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Loader from '../../modules/loader';
import { ExportView } from './ExportView';
import { ExportDetailView } from './ExportDetailView';
import {
  useIncrement,
  useAsyncMemo,
  useBoolean
} from '../../services/ReactHooksService';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import { ML_ENDPOINTS, ML_URI } from '../../services/ApiServices/ApiConstants';

import {
  getTrainedModels,
  getTrained,
  getTrainedDeployments,
  deployTrained,
  getModels
} from '../../services/ApiServices/MlService';
import {
  getDeployment,
  deleteDeployment,
  changeDeploymentName,
  downloadDeploymentModel
} from '../../services/ApiServices/MLDeploymentService';
// import { ChangeNameModalView } from './ChangeNameModalView';
import { Empty } from './components/Empty';
import { downloadBlob } from '../../services/helpers';

// this is a small harmless hack
const buildLink = (key, platform) =>
  `${
    ML_URI.startsWith('http')
      ? ML_URI
      : `${window.location.protocol + '//' + window.location.host}/ml/`
  }${ML_ENDPOINTS.DEPLOY}/${key}/export/${platform}`;

const ExportPage = () => {
  const location = useLocation();
  const history = useHistory();
  const [selectedModelId, setSelectedModelId] = useState(
    location.state ? location.state.id : null
  );
  const [selectedDeploymentKey, setSelectedDeploymentKey] = useState(null);

  const [platform, setPlatform] = useState('python');
  const [modelModalState, openModelModal, closeModelModal] = useBoolean(false);
  // const [changeNameModalState, openChangeNameModal, closeChangeNameModal] = useBoolean(false);

  const [modelsInvalidate, refreshModels] = useIncrement();
  const [deploymentsInvalidate, refreshDeployments] = useIncrement();
  const [
    selectedDeploymentInvalidate,
    refreshSelectedDeployment
  ] = useIncrement();

  const baseModels = useAsyncMemo(async () => await getModels(), [], []);
  const models = useAsyncMemo(
    async () => await getTrainedModels(),
    [modelsInvalidate],
    []
  );
  const deployments = useAsyncMemo(
    async () => {
      if (!selectedModelId) return [];
      return getTrainedDeployments(selectedModelId);
    },
    [selectedModelId, deploymentsInvalidate],
    []
  );
  const selectedModel = useAsyncMemo(async () => {
    if (!selectedModelId) return undefined;
    return getTrained(selectedModelId);
  }, [selectedModelId]);
  const selectedDeployment = useAsyncMemo(async () => {
    if (!selectedDeploymentKey) return undefined;
    return getDeployment(selectedDeploymentKey);
  }, [selectedDeploymentKey, selectedDeploymentInvalidate]);

  const selectModel = modelId => {
    setSelectedDeploymentKey(null);
    setSelectedModelId(modelId);
  };
  const selectDeployment = key => setSelectedDeploymentKey(key);

  const del = async () => {
    await deleteDeployment(selectedDeployment.key);
    refreshDeployments();
    setSelectedDeploymentKey(null);
  };

  const deployNew = async () => {
    const deploymentKey = await deployTrained(selectedModelId);
    refreshDeployments();
    selectDeployment(deploymentKey);
  };

  const onDownloadModel = async () => {
    const blob = await downloadDeploymentModel(
      selectedDeployment.key,
      platform
    );
    // console.log(blob)
    downloadBlob(blob, `${selectedModel.name}-${platform}.bin`);
  };

  const handleDeploymentNameChange = async name => {
    await changeDeploymentName(selectedDeployment.key, name);
    refreshDeployments();
    refreshSelectedDeployment();
  };

  const availablePlatforms = [
    // TODO: need to think about how to handle this
    'python'
  ];

  useEffect(() => {
    history.replace(location.pathname, null);
  }, []);

  return (
    <Loader loading={!baseModels}>
      <ExportView
        models={models}
        deployments={deployments}
        selectedModel={selectedModel}
        selectModel={selectModel}
        selectedDeployment={selectedDeployment}
        selectDeployment={selectDeployment}
        onClickDeployNew={deployNew}
        detail={
          selectedDeployment ? (
            <ExportDetailView
              model={selectedModel}
              deployment={selectedDeployment}
              platform={platform}
              availablePlatforms={availablePlatforms}
              onPlatform={setPlatform}
              onClickDownloadModel={onDownloadModel}
              onClickDelete={del}
              onClickViewModelDetails={openModelModal}
              onChangeDeploymentName={name => handleDeploymentNameChange(name)}
              publicLink={buildLink(selectedDeployment.key, platform)}
            />
          ) : (
            <Empty>Select a deployment to see it's details</Empty>
          )
        }
      />
      {baseModels.length && selectedModel ? (
        <SelectedModelModalView
          isOpen={modelModalState}
          baseModels={baseModels}
          model={selectedModel}
          onClosed={closeModelModal}
        />
      ) : null}
      {/* {selectedDeployment ? (
        <ChangeNameModalView
          initialName={selectedDeployment.name}
          onChangeName={(name) => handleDeploymentNameChange(name)}
          isOpen={changeNameModalState}
          onClosed={closeChangeNameModal}
        />
      ) : null} */}
    </Loader>
  );
};

export default ExportPage;
