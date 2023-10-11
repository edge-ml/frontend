import React, { Fragment, useEffect, useState } from 'react';
import { getModels, deleteModel } from '../../services/ApiServices/MlService';
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
  Tooltip,
  UncontrolledTooltip,
  Row,
  Col,
} from 'reactstrap';
import DownloadModal from './DownloadModal';
import LiveInferenceModal from './LiveInferenceModal';
import { Table, TableEntry } from '../../components/Common/Table';
import Checkbox from '../../components/Common/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt,
  faDownload,
  faInfoCircle,
  faMicrochip,
  faXmark,
  faCircleInfo,
  faInfo,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import DeployModal from './DeployModal';

const ValidationPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const [models, setModels] = useState([]);
  const [modalModel, setModalModel] = useState(undefined);
  const [modelDownload, setModelDownload] = useState(undefined);
  const [modelDeploy, setModelDeploy] = useState(undefined);
  const [modelLiveInference, setModelLiveInference] = useState(undefined);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModels, setUpdateModels] = useState(false);

  useEffect(() => {
    getModels().then((models) => {
      setModels(models);
    });
  }, []);

  useEffect(() => {
    const fetchData = () => {
      console.log('update', updateModels);
      getModels().then((models) => {
        // if (models.length === 0 || models.every(elm => elm.status === "done" || elm.error != "")) {
        //   setUpdateModels(false);
        // }

        setModels(models);
      });
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
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

  const onDeleteSingleModel = (model_id) => {
    setSelectedModels([model_id]);
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

  console.log(models);
  return (
    <Container>
      <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2 mt-3">
        <Fragment>
          <div className="w-100 d-flex justify-content-between align-items-center mb-2">
            <div className="font-weight-bold h4 justify-self-start">Models</div>
            <Button onClick={() => setModalOpen(true)}>Train a model</Button>
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
                          <div>{model.trainRequest.classifier.name}</div>
                        </Col>
                        <Col>
                          {console.log(model)}
                          {model.error === undefined ||
                          model.error == '' ? null : (
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
                          {model.status === 'done' ? (
                            <div>
                              <div>
                                <b>Acc: </b>
                                {metric(model.evaluator.metrics.accuracy_score)}
                                %
                              </div>
                              <div>
                                <b>F1: </b>
                                {metric(model.evaluator.metrics.f1_score)}%
                              </div>
                            </div>
                          ) : null}
                        </Col>
                        <Col className="d-flex justify-content-end">
                          {model.status === 'done' ? (
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
                                onClick={(e) => {
                                  setModelDeploy(model);
                                  setDeployModalOpen(true);
                                  e.stopPropagation();
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faMicrochip}
                                ></FontAwesomeIcon>
                              </Button>
                              <Button
                                className="btn-edit mr-3 mr-md-4"
                                onClick={(e) => {
                                  setModelLiveInference(model);
                                  e.stopPropagation();
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faPlay}
                                ></FontAwesomeIcon>
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {model.error === '' ||
                              model.error === undefined ? (
                                <div className="mr-3 mr-md-4">
                                  <Spinner color="primary"></Spinner>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                    {/* ) : (
                      <div className="p-2 d-flex">
                        <div className="d-flex align-items-center ml-2 mr-0 ml-md-3 mr-md-3">
                          <Checkbox
                            onClick={() => clickCheckBox(model)}
                          ></Checkbox>
                        </div>
                        <div className="w-100 d-flex justify-content-start align-items-center">
                          <div>
                            <b>{model.name}</b>
                            <div>{model.trainRequest.classifier.name}</div>
                          </div>
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
                        </div>
                        <UncontrolledTooltip target={'tooltip' + model._id}>
                          {model.error}
                        </UncontrolledTooltip>
                      </div>
                    )} */}
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
          <LiveInferenceModal
            model={modelLiveInference}
            onClose={() => setModelLiveInference(undefined)}
          ></LiveInferenceModal>
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
