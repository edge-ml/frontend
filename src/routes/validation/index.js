import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Loader from '../../modules/loader';
import { useAsyncMemo, useIncrement } from '../../services/ReactHooksService';
import {
  getTrainedModels,
  getModels,
  getTrained,
  deleteTrained,
  getAllActiveTrainings,
} from '../../services/ApiServices/MlService';
import { ValidationView } from './ValidationView';
import { DeleteConfirmationModalView } from './DeleteConfirmationModalView';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { TrainedModelsView } from './TrainedModelsView';
import { OngoingTrainingsView } from './OngoingTrainingsView';
import TrainingWizard from '../../components/TrainingWizard';
import { Button } from 'reactstrap';

const REFRESH_INTERVAL = 500;

const ValidationPage = () => {
  const [modelsInvalidate, modelsRefresh] = useIncrement();
  const [trainingsInvalidate, trainingsRefresh] = useIncrement();

  const [modalOpen, setModalOpen] = useState(false);

  const [labels, setLabels] = useState([]);
  const [viewedModel, setViewedModel] = useState(null);
  const [modalState, setModalState] = useState(false);
  const [modelsToDelete, setModelsToDelete] = useState([]);
  const [deleteModalState, setDeleteModalState] = useState(false);
  const location = useLocation();
  const history = useHistory();

  const [models, setModels] = useState([]);

  useEffect(() => {
    getModels().then((models) => {
      setModels(models);
    });
  }, []);

  // const baseModels = useAsyncMemo(getModels, [], []);
  // const models = useAsyncMemo(getTrainedModels, [modelsInvalidate], []);
  // const trainings = useAsyncMemo(
  //   getAllActiveTrainings,
  //   [trainingsInvalidate],
  //   []
  // );

  // useEffect(() => {
  //   if (trainings.length !== 0) {
  //     setTimeout(() => {
  //       trainingsRefresh();
  //     }, REFRESH_INTERVAL);
  //   }
  // }, [trainings, trainingsInvalidate]);

  // useEffect(() => {
  //   modelsRefresh();
  // }, [trainings.length]);

  // const viewModel = async (id) => {
  //   const model = await getTrained(id);
  //   const { labels } = await subscribeLabelingsAndLabels();
  //   setLabels(labels);
  //   setViewedModel(model);
  //   setModalState(true);
  // };

  // const deployModel = (id) => {
  //   history.push({
  //     pathname: location.pathname.replace('Validation', 'Deploy'),
  //     state: { id },
  //   });
  // };

  // const closeModal = () => {
  //   setModalState(false);
  // };

  // const showConfirmation = (ids) => {
  //   setModelsToDelete(ids);
  //   setDeleteModalState(true);
  // };

  // const closeConfirmation = () => {
  //   setDeleteModalState(false);
  // };

  // const deleteModel = (model) => async () => {
  //   const succ = await deleteTrained(model.id);
  //   if (succ) {
  //     setModalState(false);
  //     modelsRefresh();
  //   }
  // };

  // const deleteMultiple = async (ids) => {
  //   const succ = (
  //     await Promise.all([...ids].map((id) => deleteTrained(id)))
  //   ).reduce((prev, cur) => prev || cur, false);
  //   if (succ) {
  //     modelsRefresh();
  //   }
  // };

  const metric = (metric) => Math.round(metric * 100 * 100) / 100;

  console.log(models);
  return (
    <Loader loading={false}>
      <div className="p-2 pl-md-4 pr-md-4">
        <div className="w-100 d-flex flex-row justify-content-between align-items-center">
          <div className="font-weight-bold h4">DATASETS</div>
          <Button onClick={() => setModalOpen(true)}>Train a model</Button>
        </div>
        <div>
          {models.map((model) => {
            return (
              <div style={{ backgroundColor: 'beige' }} className="m-2">
                <div>
                  <b>{model.name}</b>
                </div>
                {model.status === 'done' ? (
                  <div>
                    <div>{model.model.classifier.name}</div>
                    <div className="d-flex">
                      <div className="">
                        <b>Acc: </b>
                        {metric(model.model.metrics.accuracy_score)}
                      </div>
                      <div>
                        <b>F1: </b>
                        {metric(model.model.metrics.f1_score)}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {/*} <Loader loading={!(models && baseModels)}>
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
      ) : null} */}
      {modalOpen ? (
        <TrainingWizard
          modalOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        ></TrainingWizard>
      ) : null}
    </Loader>
  );
};

export default ValidationPage;
