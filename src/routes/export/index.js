import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Loader from '../../modules/loader';
import { ExportView } from './ExportView';
import { ExportDetailView } from './ExportDetailView';
import { useAsyncMemo, useBoolean } from '../../services/ReactHooksService';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';

import {
  getTrainedModels,
  getTrained,
  getModels,
} from '../../services/ApiServices/MlService';
import {
  getPlatformCode,
  downloadDeploymentModel,
} from '../../services/ApiServices/MLDeploymentService';
// import { ChangeNameModalView } from './ChangeNameModalView';
import { Empty } from './components/Empty';
import { downloadBlob } from '../../services/helpers';
import { platforms } from './platforms';

const createBasename = (platform, selectedModel) =>
  `${selectedModel.name}_${platform}`;
const createName = (platform, selectedModel) =>
  `${createBasename(platform, selectedModel)}.${
    platforms.find((x) => x.value === platform).extension || 'bin'
  }`;

const ExportPage = () => {
  const location = useLocation();
  const history = useHistory();
  const [selectedModelId, setSelectedModelId] = useState(
    location.state ? location.state.id : null
  );

  const [platform, setPlatform] = useState(null);
  const [modelModalState, openModelModal, closeModelModal] = useBoolean(false);

  const baseModels = useAsyncMemo(async () => await getModels(), [], []);
  const models = useAsyncMemo(async () => await getTrainedModels(), [], []);
  const selectedModel = useAsyncMemo(async () => {
    if (!selectedModelId) return selectedModel;
    return getTrained(selectedModelId);
  }, [selectedModelId]);

  const labels = useAsyncMemo(
    async () => {
      const { labels } = await subscribeLabelingsAndLabels();
      return labels;
    },
    [selectedModelId],
    []
  );

  const platformContents = useAsyncMemo(
    async () => {
      if (!selectedModelId || !platform) return platformContents;
      return (await getPlatformCode(selectedModelId, platform))
        .replace(
          '___DOWNLOADED_MODEL_BASENAME___',
          createBasename(platform, selectedModel)
        )
        .replace(
          '___DOWNLOADED_MODEL_NAME___',
          createName(platform, selectedModel)
        );
    },
    [selectedModelId, platform, selectedModel && selectedModel.name],
    ''
  );

  useEffect(() => {
    if (!selectedModel) return;
    setPlatform(
      selectedModel.platforms.length > 0 ? selectedModel.platforms[0] : null
    );
  }, [selectedModel]);

  const selectModel = (modelId) => {
    setSelectedModelId(modelId);
  };

  const onDownloadModel = async () => {
    const blob = await downloadDeploymentModel(selectedModelId, platform);
    downloadBlob(blob, createName(platform, selectedModel));
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
          selectedModel ? (
            <ExportDetailView
              model={selectedModel}
              platformName={platform}
              platformContents={platformContents}
              onPlatform={setPlatform}
              onClickDownloadModel={onDownloadModel}
              onClickViewModelDetails={openModelModal}
            />
          ) : (
            <Empty>Select model for details</Empty>
          )
        }
      />
      {baseModels.length && selectedModel && modelModalState ? (
        <SelectedModelModalView
          isOpen={modelModalState}
          baseModels={baseModels}
          pipeline={selectedModel.pipeline}
          labels={labels}
          onClosed={closeModelModal}
        />
      ) : null}
    </Loader>
  );
};

export default ExportPage;
