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
} from '@fortawesome/free-solid-svg-icons';
import DeployModal from './DeployModal';

const ValidationPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const [models, setModels] = useState([]);
  const [modalModel, setModalModel] = useState(undefined);
  const [modelDownload, setModelDownload] = useState(undefined);
  const [modelDeploy, setModelDeploy] = useState(undefined);
  const [selectedModels, setSelectedModels] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    getModels().then((models) => {
      setModels(models);
    });
  }, []);

  const metric = (metric) => Math.round(metric * 100 * 100) / 100;

  const onViewModel = (model) => {
    setModalModel(model);
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
    selectedModels.forEach((elm) => {
      deleteModel(elm);
    });
    setSelectedModels([]);
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  const onWizardClose = () => {
    setModalOpen(false);
    getModels().then((models) => setModels(models));
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
                  {model.status === 'done' ? (
                    <div className="p-2 d-flex">
                      <div className="d-flex align-items-center ml-2 mr-0 ml-md-3 mr-md-3">
                        <Checkbox
                          onClick={() => clickCheckBox(model)}
                        ></Checkbox>
                      </div>
                      <div
                        className="w-100 d-flex justify-content-between align-items-center"
                        onClick={() => onViewModel(model)}
                      >
                        <div>
                          <b>{model.name}</b>
                          <div>{model.pipeline.classifier.name}</div>
                        </div>
                        <div>
                          <div className="">
                            <b>Acc: </b>
                            {metric(model.evaluator.metrics.accuracy_score)}%
                          </div>
                          <div>
                            <b>F1: </b>
                            {metric(model.evaluator.metrics.f1_score)}%
                          </div>
                        </div>
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
                              e.stopPropagation();
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faMicrochip}
                            ></FontAwesomeIcon>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                          className="ml-5 flex-grow-1 d-flex justify-content-center"
                          style={{ color: 'red' }}
                        >
                          An error occured while training!
                        </div>
                      </div>
                    </div>
                  )}
                </TableEntry>
              );
            })}
          </Table>
          {modalOpen ? (
            <TrainingWizard
              modalOpen={true}
              onClose={onWizardClose}
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
