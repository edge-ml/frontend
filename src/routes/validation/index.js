import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Loader from '../../modules/loader';
import { useIncrement } from '../../services/ReactHooksService';
import { getModels } from '../../services/ApiServices/MlService';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import TrainingWizard from '../../components/TrainingWizard';
import { Button } from 'reactstrap';
import DownloadModal from './DownloadModal';

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
  const [modalModel, setModalModel] = useState(undefined);
  const [modelDownload, setModelDownload] = useState(undefined);
  const [modelDeploy, setModelDeploy] = useState(undefined);

  useEffect(() => {
    getModels().then((models) => {
      setModels(models);
    });
  }, []);

  const metric = (metric) => Math.round(metric * 100 * 100) / 100;

  const onViewModel = (model) => {
    setModalModel(model);
  };

  const closeViewModal = () => {
    setModalModel(undefined);
  };

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
                    <div>{model.pipeline.classifier.name}</div>
                    <div className="d-flex">
                      <div className="">
                        <b>Acc: </b>
                        {metric(model.evaluator.metrics.accuracy_score)}
                      </div>
                      <div>
                        <b>F1: </b>
                        {metric(model.evaluator.metrics.f1_score)}
                      </div>
                    </div>
                    <Button onClick={() => onViewModel(model)}>View</Button>
                    <Button onClick={() => setModelDownload(model)}>
                      Download
                    </Button>
                    <Button onClick={() => setModelDeploy(model)}>
                      Deploy
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {modalOpen ? (
        <TrainingWizard
          modalOpen={true}
          onClose={() => setModalOpen(false)}
        ></TrainingWizard>
      ) : null}
      <SelectedModelModalView
        model={modalModel}
        onClosed={() => setModalModel(false)}
      ></SelectedModelModalView>
      <DownloadModal
        model={modelDownload}
        onClose={() => setModelDownload(undefined)}
      ></DownloadModal>
    </Loader>
  );
};

export default ValidationPage;
