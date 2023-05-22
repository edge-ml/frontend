import React, { Fragment, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Loader from '../../modules/loader';
import { useIncrement } from '../../services/ReactHooksService';
import { getModels } from '../../services/ApiServices/MlService';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import TrainingWizard from '../../components/TrainingWizard';
import { Button, Container } from 'reactstrap';
import DownloadModal from './DownloadModal';
import { Table, TableEntry } from '../../components/Common/Table';
import Checkbox from '../../components/Common/Checkbox';
import { Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faFilter } from '@fortawesome/free-solid-svg-icons';
import DeployModal from './DeployModal';

const ValidationPage = () => {
  const [modelsInvalidate, modelsRefresh] = useIncrement();
  const [trainingsInvalidate, trainingsRefresh] = useIncrement();

  const [modalOpen, setModalOpen] = useState(true);

  const [labels, setLabels] = useState([]);
  const [viewedModel, setViewedModel] = useState(null);
  const [modalState, setModalState] = useState(false);
  const [modelsToDelete, setModelsToDelete] = useState([]);
  const [deleteModalState, setDeleteModalState] = useState(false);

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

  return (
    <Container>
      <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2 mt-3">
        <Fragment>
          <div className="w-100 d-flex justify-content-between align-items-center mb-2">
            <div className="font-weight-bold h4 justify-self-start">Models</div>
            <Button onClick={() => setModalOpen(true)}>Train a model</Button>
          </div>
          <Table
            header={
              <>
                <div className="ml-0 mr-0 ml-md-2 mr-md-3 ">
                  <Checkbox isSelected={false}></Checkbox>
                </div>
                <Button
                  className="ml-3 btn-delete"
                  id="deleteDatasetsButton"
                  size="sm"
                  color="secondary"
                >
                  <FontAwesomeIcon
                    className="mr-2"
                    icon={faTrashAlt}
                  ></FontAwesomeIcon>
                  Delete
                </Button>
              </>
            }
          >
            {models.map((model, index) => {
              return (
                <TableEntry index={index}>
                  <div className="m-2 d-flex">
                    <div className="d-flex align-items-center p-2 ml-2 mr-0 ml-md-3 mr-md-3">
                      <Checkbox></Checkbox>
                    </div>
                    <div className="w-100">
                      <Row>
                        <Col>
                          <b>{model.name}</b>
                          <div>{model.pipeline.classifier.name}</div>
                        </Col>
                        <Col>
                          <div className="">
                            <b>Acc: </b>
                            {metric(model.evaluator.metrics.accuracy_score)}
                          </div>
                          <div>
                            <b>F1: </b>
                            {metric(model.evaluator.metrics.f1_score)}
                          </div>
                        </Col>
                        <Col>
                          <Button
                            className="btn-edit mr-3 mr-md-4"
                            onClick={() => onViewModel(model)}
                          >
                            View
                          </Button>
                          <Button
                            className="btn-edit mr-3 mr-md-4"
                            onClick={() => setModelDownload(model)}
                          >
                            Download
                          </Button>
                          <Button
                            className="btn-edit mr-3 mr-md-4"
                            onClick={() => setModelDeploy(model)}
                          >
                            Deploy
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </TableEntry>
              );
            })}
          </Table>
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
          <DeployModal
            model={modelDeploy}
            onClose={() => setModelDeploy(undefined)}
          ></DeployModal>
        </Fragment>
      </div>
    </Container>
  );
};

export default ValidationPage;
