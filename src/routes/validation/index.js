import React, { useEffect, useState } from 'react';
import Loader from '../../modules/loader';
import {
  getTrainedModels,
  getModels,
  getTrained,
  deleteTrained
} from '../../services/ApiServices/MlService';
import { ValidationView } from './ValidationView';
import { SelectedModelModalView } from './SelectedModelModalView';

const ValidationPage = () => {
  let [models, setModels] = useState(null);
  let [baseModels, setBaseModels] = useState(null);

  let [viewedModel, setViewedModel] = useState(null);
  let [modalState, setModalState] = useState(false);

  useEffect(() => {
    getModels().then(m => {
      setBaseModels(m);
    });

    update();
  }, []);

  const update = async () => {
    const models = await getTrainedModels();
    setModels(models); // {id: string, name: string, creation_date: number, classifier: string, accuracy: number, precision: number, f1_score: number}[]
  };

  const viewModel = async id => {
    const model = await getTrained(id);
    setViewedModel(model);
    setModalState(true);
  };

  const closeModal = () => {
    setModalState(false);
  };

  const deleteModel = model => async () => {
    const succ = await deleteTrained(model.id);
    if (succ) {
      setModalState(false);
      update();
    }
  };

  const deleteMultiple = async ids => {
    console.log(ids);
    const succ = (
      await Promise.all([...ids].map(id => deleteTrained(id)))
    ).reduce((prev, cur) => prev || cur, false);
    console.log(succ);
    if (succ) {
      update();
    }
  };

  return (
    <Loader loading={!(models && baseModels)}>
      {models ? (
        <ValidationView
          models={models}
          onViewModel={viewModel}
          handleDelete={deleteMultiple}
        />
      ) : null}
      {baseModels && viewedModel ? (
        <SelectedModelModalView
          isOpen={modalState}
          baseModels={baseModels}
          model={viewedModel}
          onClosed={closeModal}
          onDelete={deleteModel(viewedModel)}
        />
      ) : null}
    </Loader>
  );
};

export default ValidationPage;
