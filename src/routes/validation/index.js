import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Loader from '../../modules/loader';
import {
  getTrainedModels,
  getModels,
  getTrained,
  deleteTrained
} from '../../services/ApiServices/MlService';
import { ValidationView } from './ValidationView';
import { DeleteConfirmationModalView } from './DeleteConfirmationModalView';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';

const ValidationPage = () => {
  let [models, setModels] = useState(null);
  let [baseModels, setBaseModels] = useState(null);
  let [labels, setLabels] = useState([]);

  let [viewedModel, setViewedModel] = useState(null);
  let [modalState, setModalState] = useState(false);
  let [modelsToDelete, setModelsToDelete] = useState([]);
  let [deleteModalState, setDeleteModalState] = useState(false);
  const location = useLocation();
  const history = useHistory();

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
    const { labels } = await subscribeLabelingsAndLabels();
    setLabels(labels);
    setViewedModel(model);
    setModalState(true);
  };

  const deployModel = id => {
    history.push({
      pathname: location.pathname.replace('Validation', 'Deploy'),
      state: { id }
    });
  };

  const closeModal = () => {
    setModalState(false);
  };

  const showConfirmation = ids => {
    setModelsToDelete(ids);
    setDeleteModalState(true);
  };

  const closeConfirmation = () => {
    setDeleteModalState(false);
  };

  const deleteModel = model => async () => {
    const succ = await deleteTrained(model.id);
    if (succ) {
      setModalState(false);
      update();
    }
  };

  const deleteMultiple = async ids => {
    const succ = (
      await Promise.all([...ids].map(id => deleteTrained(id)))
    ).reduce((prev, cur) => prev || cur, false);
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
          onDeployModel={deployModel}
          handleDelete={showConfirmation}
        />
      ) : null}
      {baseModels && viewedModel && modalState ? (
        <SelectedModelModalView
          isOpen={modalState}
          baseModels={baseModels}
          model={viewedModel}
          labels={labels}
          onClosed={closeModal}
          onDelete={deleteModel(viewedModel)}
        />
      ) : null}
      {baseModels && modelsToDelete.length ? (
        <DeleteConfirmationModalView
          isOpen={deleteModalState}
          modelsToDelete={modelsToDelete}
          onClosed={closeConfirmation}
          onDelete={deleteMultiple}
        />
      ) : null}
    </Loader>
  );
};

export default ValidationPage;
