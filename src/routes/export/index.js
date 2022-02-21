import React, { useState, useEffect } from 'react';
import Loader from '../../modules/loader';
import { ExportView } from './ExportView';
import { ExportDetailView } from './ExportDetailView';

import {
  getTrainedModels,
  getTrained
} from '../../services/ApiServices/MlService';
import { useSelect } from '../../services/hooks';

const ExportPage = () => {
  const [models, setModels] = useState([]); // {id: string, name: string, creation_date: number, classifier: string, accuracy: number, precision: number, f1_score: number}[]
  const [selectedModel, setSelectedModel] = useState(null);
  const { list: dSourceList, setIndex: setDSource, index: dSource } = useSelect(
    [
      { label: 'Online', name: 'online' },
      { label: 'Offline', name: 'offline' }
    ]
  );

  const {
    list: platformList,
    setIndex: setPlatform,
    index: platform
  } = useSelect([
    { label: 'Python', name: 'python' },
    { label: 'Arduino', name: 'arduino' }
  ]);

  useEffect(() => {
    update();
  }, []);

  const update = async () => setModels(await getTrainedModels());

  const select = async modelId => setSelectedModel(await getTrained(modelId));

  return (
    <Loader loading={false}>
      <ExportView
        models={models}
        selectModel={select}
        detail={
          selectedModel ? (
            <ExportDetailView
              model={selectedModel}
              dSource={dSource}
              dSourceList={dSourceList}
              setDSource={setDSource}
              platform={platform}
              platformList={platformList}
              setPlatform={setPlatform}
            />
          ) : null
        }
      />
    </Loader>
  );
};

export default ExportPage;
