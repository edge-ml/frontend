import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Loader from '../../modules/loader';
import { useAsyncMemo, useIncrement } from '../../services/ReactHooksService';
import {
  getTrainedModels,
  getModels,
  getTrained,
  deleteTrained,
  getAllActiveTrainings
} from '../../services/ApiServices/MlService';
import { ValidationView } from './ValidationView';
import { DeleteConfirmationModalView } from './DeleteConfirmationModalView';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { TrainedModelsView } from './TrainedModelsView';
import { OngoingTrainingsView } from './OngoingTrainingsView';

const REFRESH_INTERVAL = 500;

const ValidationPage = () => {
  const [modelsInvalidate, modelsRefresh] = useIncrement();
  const [trainingsInvalidate, trainingsRefresh] = useIncrement();

  const [labels, setLabels] = useState([]);
  const [viewedModel, setViewedModel] = useState(null);
  const [modalState, setModalState] = useState(false);
  const [modelsToDelete, setModelsToDelete] = useState([]);
  const [deleteModalState, setDeleteModalState] = useState(false);
  const location = useLocation();
  const history = useHistory();

  const baseModels = useAsyncMemo(getModels, [], []);
  const models = useAsyncMemo(getTrainedModels, [modelsInvalidate], []);
  const trainings = useAsyncMemo(
    getAllActiveTrainings,
    [trainingsInvalidate],
    []
  );

  const [prevTrainingsLength, setPrevTrainingsLength] = useState(0);

  useEffect(() => {
    setPrevTrainingsLength(trainings.length);
    if (trainings.length !== 0) {
      setTimeout(() => {
        trainingsRefresh();
        if (prevTrainingsLength !== trainings.length) {
          modelsRefresh();
        }
      }, REFRESH_INTERVAL);
    }
  }, [trainings, trainingsInvalidate]);

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
      modelsRefresh();
    }
  };

  const deleteMultiple = async ids => {
    const succ = (
      await Promise.all([...ids].map(id => deleteTrained(id)))
    ).reduce((prev, cur) => prev || cur, false);
    if (succ) {
      modelsRefresh();
    }
  };

  return (
    <Loader loading={!(models && baseModels)}>
      {models ? (
        <ValidationView
          trained={
            <TrainedModelsView
              models={models}
              onViewModel={viewModel}
              onDeployModel={deployModel}
              handleDelete={showConfirmation}
            />
          }
          ongoing={
            trainings.length ? (
              <OngoingTrainingsView trainings={trainings} />
            ) : null
          }
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
