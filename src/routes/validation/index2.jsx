import React, { Fragment, useEffect, useState } from 'react';
import Page from '../../components/Common/Page';


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
import LiveInferenceModal from './LiveInferenceModal';
import { Table, TableEntry } from '../../components/Common/Table';
import Checkbox from '../../components/Common/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt,
  faDownload,
  faInfoCircle,
  faMicrochip,
  faCircleInfo,
  faPlay,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import DeployModal from './DeployModal';
import { useNavigate } from 'react-router-dom';
import useModels from '../../Hooks/useModels';
import Loader from '../../modules/loader';
import { Empty } from '../export/components/Empty';

const ValidationPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const { models, stepOptions, deleteModel } = useModels();

  const [modalModel, setModalModel] = useState(undefined);
  const [modelDownload, setModelDownload] = useState(undefined);
  const [modelDeploy, setModelDeploy] = useState(undefined);
  const [modelLiveInference, setModelLiveInference] = useState(undefined);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [liveInferenceModalOpen, setLiveInferenceModalOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModels, setUpdateModels] = useState(false);
  const [error, setError] = useState(undefined);

  const history = useNavigate();

  const metric = (metric) => Math.round(metric * 100 * 100) / 100;

  const onViewModel = (model) => {
    if (model.error === '' || model.error === undefined) {
      setModalModel(model);
    }
  };

  const onSelectAll = () => {
    const allSelected = models.length === selectedModels.length;
    if (allSelected) {
      setSelectedModels([]);
    } else {
      setSelectedModels(models.map((model) => model._id));
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
    selectedModels.forEach((elm) => {
      deleteModel(elm);
    });
    setSelectedModels([]);
    toggleDeleteModal();
  };

  const onDeleteSingleModel = (model) => {
    if (model) {
      setSelectedModels([model._id]);
      toggleDeleteModal();
    }
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  const onWizardClose = () => {
    setModalOpen(false);
  };

  if (error) {
    return (
      <Container style={{ height: '100vh' }}>
        <div className="h-100 d-flex justify-content-center align-items-center">
          <h2 className="fw-bold">Cannot connect to the backend</h2>
        </div>
      </Container>
    );
  }

  const checkExportC = (model) => {


    const res = model.pipeline.selectedPipeline.steps.map((step) => {
      if (!stepOptions) {
        return false;
      }
      const stepOption = stepOptions.find(
        (elm) => elm.name === step.options.name,
      );
      if (
        ['PRE', 'CORE'].includes(stepOption.type) &&
        !stepOption.platforms.includes('C')
      ) {

        return false;
      }
      return true;
    });
    return res.every((elm) => elm === true);
  };

  const ListButton = (props) => {
    const { onClick, icon, children } = props;
    const onClickStop = (e) => {
      onClick(e);
      e.stopPropagation();
    };

    return (
      <Button
        {...props}
        className="btn-edit ms-2 my-2"
        onClick={onClickStop}
      >
        <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
        <div>
          <small>{children}</small>
        </div>
      </Button>
    );
  };



  if (!models) {
    return <Loader loading></Loader>;
  }

  return (
    <Page
      header={
        <>
          <div className="fw-bold h4 justify-self-start">MODELS</div>
          <div className="justify-f-end">
            <Button outline color='primary' className="btn-neutral" onClick={() => setModalOpen(true)}>
              Train a model
            </Button>
          </div>
        </>
      }
    >

      {models.length === 0 ? (
        <Empty>No models trained yet.</Empty>
      ) : (
        <Table
          header={
            <>
              <div className="ml-0 me-0 ml-md-2 me-md-3 ">
                <Checkbox
                  isSelected={models.length == selectedModels.length}
                  onClick={onSelectAll}
                ></Checkbox>
              </div>
              <Button
                className="btn-delete"
                id="deleteDatasetsButton"
                size="sm"
                outline
                color='danger'
                onClick={onOpenDeleteModal}
              >
                <FontAwesomeIcon
                  className="me-2"
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
                  (elm) => elm.type === 'EVAL',
                )[0].options.metrics.metrics;
            return (
              <div className="model-table-entry-focus">
                <TableEntry index={index}>
                  <div className="p-2 d-flex">
                    <div className="d-flex align-items-center ms-2 me-0 ml-md-3 me-md-3">
                      <Checkbox
                        isSelected={selectedModels.includes(model._id)}
                        onClick={() => clickCheckBox(model)}
                      ></Checkbox>
                    </div>
                    <Row
                      className="w-100 d-flex justify-content-between align-items-center"
                      onClick={() => onViewModel(model)}
                    >
                      <Col className="col-3 ms-2 font-size-lg h-5">
                        <div>
                          <b className='font-size-lg h5 fw-bold'>{model.name}</b>
                          {/* <FontAwesomeIcon
                            className="ms-1 cursor-pointer"
                            color="rgb(131, 136, 159)"
                            icon={faPen}
                            onClick={() => setModelNameEditOpen(true)}
                          ></FontAwesomeIcon> */}
                        </div>
                        <div>{model.pipeline.selectedPipeline.name}</div>
                      </Col>
                      
                      <Col className="d-flex col-6 justify-content-end me-3 me-md-4">
                        {model.trainStatus === 'done' ? (
                          <div>
                            <ListButton
                              color="danger"
                              outline
                              icon={faTrashAlt}
                              onClick={() => onDeleteSingleModel(model)}
                            >
                              Delete
                            </ListButton>
                            <ListButton
                              color="primary"
                              outline
                              icon={faDownload}
                              onClick={() => setModelDownload(model)}
                            >
                              Download
                            </ListButton>
                            <ListButton
                              color="primary"
                              outline
                              icon={faMicrochip}
                              onClick={() => {
                                setModelDeploy(model);
                                setDeployModalOpen(true);
                              }}
                              disabled={!checkExportC(model)}
                            >
                              Deploy
                            </ListButton>
                            <ListButton
                              color="primary"
                              outline
                              icon={faPlay}
                              onClick={() =>
                                history.push('models/live/' + model._id)
                              }
                            >
                              View live
                            </ListButton>
                            <ListButton
                              color="info"
                              outline
                              icon={faInfoCircle}
                              onClick={() => onViewModel(model)}
                            >
                              Info
                            </ListButton>
                          </div>
                        ) : (
                          <div>
                            {model.error === '' ? (
                              <div>
                                <Spinner color="primary"></Spinner>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                </TableEntry>
              </div>
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
      {liveInferenceModalOpen ? (
        <LiveInferenceModal
          model={modelLiveInference}
          onClose={() => {
            setModelLiveInference(undefined);
            setLiveInferenceModalOpen(false);
          }}
        ></LiveInferenceModal>
      ) : null}
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
    </Page>
  );
};

export default ValidationPage;
