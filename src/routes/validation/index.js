import React, { Fragment, useEffect, useState } from 'react';
import {
  getModels,
  deleteModel,
  getStepOptions,
} from '../../services/ApiServices/MlService';
import { SelectedModelModalView } from '../../components/SelectedModelModalView/SelectedModelModalView';
import TrainingWizard from '../../components/TrainingWizard';
import {
  Button,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Spinner,
  UncontrolledTooltip,
  Row,
  Col,
} from 'reactstrap';
import DownloadModal from './DownloadModal';
import { Table, TableEntry } from '../../components/Common/Table';
import Checkbox from '../../components/Common/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt,
  faDownload,
  faInfoCircle,
  faMicrochip,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import DeployModal from './DeployModal';

const ValidationPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const [models, setModels] = useState([]);
  const [modalModel, setModalModel] = useState(undefined);
  const [modelDownload, setModelDownload] = useState(undefined);
  const [modelDeploy, setModelDeploy] = useState(undefined);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModels, setUpdateModels] = useState(false);
  const [error, setError] = useState(undefined);
  const [stepOptions, setStepOptions] = useState(undefined);

  useEffect(() => {
    refreshModels();
    getStepOptions().then((data) => setStepOptions(data));
  }, []);

  const refreshModels = async () => {
    getModels()
      .then((models) => {
        setModels(models);
        setError(undefined);
      })
      .catch(() => {
        setError(true);
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshModels();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [modalOpen]);

  const metric = (metric) => Math.round(metric * 100 * 100) / 100;

  const onViewModel = (model) => {
    if (model.error === '' || model.error === undefined) {
      setModalModel(model);
    }
  };

  const clickCheckBox = (model) => {
    const id = model._id;
    if (selectedModels.includes(id)) {
      setSelectedModels(selectedModels.filter((elm) => elm != id));
    } else {
      setSelectedModels([...selectedModels, id]);
    }
  };

  const onOpenDeleteModal = () => {
    toggleDeleteModal();
  };

  const onDeleteSelectedModels = () => {
    console.log(selectedModels);
    selectedModels.forEach((elm) => {
      deleteModel(elm);
    });
    setSelectedModels([]);
    toggleDeleteModal();
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  const onWizardClose = () => {
    console.log('wizard close');
    setModalOpen(false);
    getModels().then((models) => setModels(models));
  };

  console.log(error);

  if (error) {
    return (
      <Container style={{ height: '100vh' }}>
        <div className="h-100 d-flex justify-content-center align-items-center">
          <h2 className="font-weight-bold">Cannot connect to the backend</h2>
        </div>
      </Container>
    );
  }

  const checkExportC = (model) => {
    const res = model.pipeline.selectedPipeline.steps.map((step) => {
      const stepOption = stepOptions.find(
        (elm) => elm.name === step.options.name
      );
      if (
        ['PRE', 'CORE'].includes(stepOption.type) &&
        !stepOption.platforms.includes('C')
      ) {
        console.log(stepOption.name, stepOption.platforms);
        return false;
      }
      return true;
    });
    return res.every((elm) => elm === true);
  };

  return (
    <Container>
      <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2 mt-3">
        <Fragment>
          <div className="w-100 d-flex justify-content-between align-items-center mb-2">
            <h4 className="font-weight-bold">MODELS</h4>
            <Button className="btn-neutral" onClick={() => setModalOpen(true)}>
              Train a model
            </Button>
          </div>
          {models.length === 0 ? (
            <div
              style={{ marginTop: '30vh', fontSize: 'large' }}
              className="d-flex h-100 justify-content-center align-items-center font-weight-bold"
            >
              No models trained yet!
            </div>
          ) : (
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
                    divor="secondary"
                    onClick={onOpenDeleteModal}
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
                const metrics =
                  model.error || model.trainStatus !== 'done'
                    ? undefined
                    : model.pipeline.selectedPipeline.steps.filter(
                        (elm) => elm.type === 'EVAL'
                      )[0].options.metrics.metrics;
                return (
                  <TableEntry index={index}>
                    <div className="p-2 d-flex">
                      <div className="d-flex align-items-center ml-2 mr-0 ml-md-3 mr-md-3">
                        <Checkbox
                          onClick={() => clickCheckBox(model)}
                        ></Checkbox>
                      </div>
                      <Row
                        className="w-100 d-flex justify-content-between align-items-center"
                        onClick={() => onViewModel(model)}
                      >
                        <Col>
                          <b>{model.name}</b>
                          <div>{model.pipeline.selectedPipeline.name}</div>
                        </Col>
                        <Col>
                          {model.error == '' ? null : (
                            <>
                              <div
                                className="ml-5 flex-grow-1 d-flex justify-content-center align-items-center"
                                style={{ color: 'red' }}
                              >
                                An error occured while training!
                                <FontAwesomeIcon
                                  id={'tooltip' + model._id}
                                  className="m-2"
                                  icon={faCircleInfo}
                                ></FontAwesomeIcon>
                              </div>
                              <UncontrolledTooltip
                                target={'tooltip' + model._id}
                              >
                                {model.error}
                              </UncontrolledTooltip>
                            </>
                          )}
                          {model.trainStatus === 'done' ? (
                            <div>
                              <div>
                                <b>Acc: </b>
                                {metric(metrics.accuracy_score)}%
                              </div>
                              <div>
                                <b>F1: </b>
                                {metric(metrics.f1_score)}%
                              </div>
                            </div>
                          ) : null}
                        </Col>
                        <Col className="d-flex justify-content-end">
                          {model.trainStatus === 'done' ? (
                            <div>
                              <Button
                                className="btn-edit mr-3 mr-md-4"
                                onClick={(e) => {
                                  onViewModel(model);
                                  e.stopPropagation();
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faInfoCircle}
                                ></FontAwesomeIcon>
                              </Button>
                              <Button
                                className="btn-edit mr-3 mr-md-4"
                                onClick={(e) => {
                                  setModelDownload(model);
                                  e.stopPropagation();
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faDownload}
                                ></FontAwesomeIcon>
                              </Button>
                              <Button
                                className="btn-edit mr-3 mr-md-4"
                                disabled={!checkExportC(model)}
                                onClick={(e) => {
                                  setModelDeploy(model);
                                  setDeployModalOpen(true);
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faMicrochip}
                                ></FontAwesomeIcon>
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {model.error === '' ? (
                                <div className="mr-3 mr-md-4">
                                  <Spinner color="primary"></Spinner>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </TableEntry>
                );
              })}
            </Table>
          )}
          {modalOpen ? (
            <TrainingWizard
              modalOpen={true}
              onClose={onWizardClose}
            ></TrainingWizard>
          ) : null}
          <SelectedModelModalView
            model={modalModel}
            onClosed={() => setModalModel(false)}
            onButtonDownload={(model) => {
              setModelDownload(model);
            }}
            onButtonDeploy={(model) => {
              setModelDeploy(model);
              setDeployModalOpen(true);
            }}
          ></SelectedModelModalView>
          <DownloadModal
            model={modelDownload}
            onClose={() => setModelDownload(undefined)}
          ></DownloadModal>
          {deployModalOpen ? (
            <DeployModal
              model={modelDeploy}
              onClose={() => {
                setModelDeploy(undefined);
                setDeployModalOpen(false);
              }}
            ></DeployModal>
          ) : null}
        </Fragment>
      </div>
      <Modal isOpen={deleteModalOpen} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Delete models</ModalHeader>
        <ModalBody>
          Are you sure to delete the following models?
          {selectedModels.map((id) => {
            const model = models.find((elm) => elm._id === id);
            if (!model) {
              return;
            }
            return (
              <React.Fragment key={id}>
                <br />
                <b>{model.name}</b>
              </React.Fragment>
            );
          })}
        </ModalBody>
        <ModalFooter>
          <Button
            id="deleteDatasetsButtonFinal"
            outline
            color="danger"
            onClick={onDeleteSelectedModels}
          >
            Yes
          </Button>{' '}
          <Button outline color="secondary" onClick={toggleDeleteModal}>
            No
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default ValidationPage;
