import React, { useEffect, useState } from 'react';
import Loader from '../../modules/loader';
import {
  getTrainedModels,
  getModels,
  getTrained
} from '../../services/ApiServices/MlService';
import { ValidationView } from './ValidationView';
import { SelectedModelModalView } from './SelectedModelModalView';

const ValidationPage = () => {
  let [models, setModels] = useState(null);
  let [baseModels, setBaseModels] = useState(null);

  let [viewedModel, setViewedModel] = useState(null);
  let [modalState, setModalState] = useState(false);

  useEffect(() => {
    getTrainedModels().then(m => {
      setModels(m); // {id: string, name: string, creation_date: number, classifier: string, accuracy: number, precision: number, f1_score: number}[]
    });

    getModels().then(m => {
      setBaseModels(m);
    });
  }, []);

  const viewModel = async id => {
    const model = await getTrained(id);
    setViewedModel(model);
    setModalState(true);
  };

  const closeModal = () => {
    setModalState(false);
  };

  return (
    <Loader loading={!(models && baseModels)}>
      {models ? (
        <ValidationView models={models} onViewModel={viewModel} />
      ) : null}
      {baseModels && viewedModel ? (
        <SelectedModelModalView
          isOpen={modalState}
          baseModels={baseModels}
          model={viewedModel}
          onClosed={closeModal}
        />
      ) : null}
    </Loader>
  );
};

export default ValidationPage;
