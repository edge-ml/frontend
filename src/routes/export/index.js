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
  getModels
} from '../../services/ApiServices/MlService';
import {
  getDeployment,
  getPlatform,
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

  const [platform, setPlatform] = useState('python');
  const [modelModalState, openModelModal, closeModelModal] = useBoolean(false);
  // const [changeNameModalState, openChangeNameModal, closeChangeNameModal] = useBoolean(false);

  const [modelsInvalidate, refreshModels] = useIncrement();

  const baseModels = useAsyncMemo(async () => await getModels(), [], []);
  const models = useAsyncMemo(
    async () => await getTrainedModels(),
    [modelsInvalidate],
    []
  );
  const [selectedModel, selectedDeployment] = useAsyncMemo(
    async () => {
      if (!selectedModelId) return [undefined, undefined];
      return [
        await getTrained(selectedModelId),
        await getDeployment(selectedModelId)
      ];
    },
    [selectedModelId],
    [undefined, undefined]
  );
  const selectedPlatform = useAsyncMemo(async () => {
    if (!selectedModelId) return undefined;
    if (!platform) return undefined;
    return getPlatform(selectedModelId, platform);
  }, [selectedModelId, platform]);

  const selectModel = modelId => {
    setSelectedModelId(modelId);
  };

  const onDownloadModel = async () => {
    if (!selectedPlatform.model) return;

    const blob = await downloadDeploymentModel(selectedModelId);
    // console.log(blob)
    downloadBlob(blob, `${selectedModel.name}-${platform}.bin`);
  };

  useEffect(() => {
    history.replace(location.pathname, null);
  }, []);

  return (
    <Loader loading={!baseModels}>
      <ExportView
        models={models}
        selectedModel={selectedModel}
        selectModel={selectModel}
        detail={
          selectedDeployment ? (
            <ExportDetailView
              model={selectedModel}
              platformName={platform}
              platformContents={selectedPlatform}
              availablePlatforms={selectedDeployment.platforms}
              onPlatform={setPlatform}
              onClickDownloadModel={onDownloadModel}
              onClickViewModelDetails={openModelModal}
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
