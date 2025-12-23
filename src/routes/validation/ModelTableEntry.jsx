import React, { useState } from "react";
import Checkbox from "../../components/Common/Checkbox";
import { Row, Col, UncontrolledTooltip, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPen } from "@fortawesome/free-solid-svg-icons";
import DownloadModal from "./DownloadModal";
import { SelectedModelModalView } from "../../components/SelectedModelModalView/SelectedModelModalView";
import ButtonList from "./ButtonList";
import DeployModal from "./DeployModal";
import EditModal from "../../components/EditModal";

const ModelCheckBoxInfo = ({ selectedModels, model, clickCheckBox, onClickEditName }) => (
  <Col>
    <div className="d-flex align-items-center h-100">
      <Checkbox
        isSelected={selectedModels.map(model => model.id).includes(model.id)}
        onClick={() => clickCheckBox(model)}
      ></Checkbox>
      <div className="ms-2">
        <div>
          <b className="font-size-lg h5 fw-bold me-1">{model.name}</b>
          <FontAwesomeIcon className="cursor-pointer" icon={faPen} onClick={onClickEditName}></FontAwesomeIcon>
        </div>
        <div>{model.pipeline.selectedPipeline.name}</div>
      </div>
    </div>
  </Col>
);

const TrainErrorSection = ({
  model,
  selectedModels,
  clickCheckBox,
  setModalModel,
  setModelDownload,
  onDeleteModels,
  stepOptions,
  setDeployModalOpen,
  onClickEditName
}) => (
  <Row className="p-2">
    <ModelCheckBoxInfo
      selectedModels={selectedModels}
      model={model}
      clickCheckBox={clickCheckBox}
      onClickEditName={onClickEditName}
    ></ModelCheckBoxInfo>
    <Col
      className="ms-5 flex-grow-1 d-flex justify-content-start align-items-center"
      style={{ color: "red" }}
    >
      {model.error ? (
        <>
          An error occurred while training!
          <FontAwesomeIcon
            id={"tooltip" + model.id}
            className="m-2"
            icon={faCircleInfo}
          ></FontAwesomeIcon>
          <UncontrolledTooltip target={"tooltip" + model.id}>
            {model.error}
          </UncontrolledTooltip>
        </>
      ) : (
        <>
          <div>
            <b>Acc: </b>
            {metric(model.metrics.accuracy_score)}%
          </div>
          <div>
            <b>F1: </b>
            {metric(model.metrics.f1_score)}%
          </div>
        </>
      )}
    </Col>
    <Col className="col-sm-auto flex-row">
      <div className="d-flex">
        <ButtonList
          model={model}
          setModalModel={setModalModel}
          setModelDownload={setModelDownload}
          onDeleteSingleModel={(model) => onDeleteModels([model])}
          stepOptions={stepOptions}
          setDeployModalOpen={setDeployModalOpen}
        ></ButtonList>
      </div>
    </Col>
  </Row>
);

const metric = (metric) => Math.round(metric * 100 * 100) / 100;

const ModelTableEntry = ({
  model,
  selectedModels,
  stepOptions,
  clickCheckBox,
  onDeleteModels,
  updateModel
}) => {
  const [modalModel, setModalModel] = useState(null);
  const [modelDownload, setModelDownload] = useState(null);
  const [datasetNameEditOpen, setDatasetNameEditOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(null);

  const metrics =
    model.error || model.trainStatus !== "done"
      ? undefined
      : model.pipeline.selectedPipeline.steps.find((elm) => elm.type === "EVAL")
          .options.metrics.metrics;

  if (model.error) {
    return (
      <>
        <TrainErrorSection
          model={model}
          selectedModels={selectedModels}
          clickCheckBox={clickCheckBox}
          setModalModel={setModalModel}
          setModelDownload={setModelDownload}
          onDeleteModels={onDeleteModels}
          stepOptions={stepOptions}
          onClickEditName={() => setDatasetNameEditOpen(true)}
        ></TrainErrorSection>
      </>
    );
  }

  return (
    <Row className="p-2">
      <ModelCheckBoxInfo
        selectedModels={selectedModels}
        model={model}
        clickCheckBox={clickCheckBox}
        onClickEditName={() => setDatasetNameEditOpen(true)}
      ></ModelCheckBoxInfo>
      {model.trainStatus !== "done" ? (
        <Col className="d-flex align-items-center">
          <Spinner size="sm" className="me-2">Loading...</Spinner>
          <span>Training...</span>
        </Col>
      ) : (
        <Col className="d-flex flex-column justify-content-center">
          <div>
            <b>Acc: </b>
            {metrics && metric(metrics.accuracy_score)}%
          </div>
          <div>
            <b>F1: </b>
            {metrics && metric(metrics.f1_score)}%
          </div>
        </Col>
      )}
      <Col className="col-sm-auto flex-row">
        <div className="d-flex">
          <ButtonList
            model={model}
            setModalModel={setModalModel}
            setModelDownload={setModelDownload}
            onDeleteSingleModel={(model) => onDeleteModels([model])}
            stepOptions={stepOptions}
            setDeployModalOpen={setDeployModalOpen}
          ></ButtonList>
        </div>
      </Col>
      <SelectedModelModalView
        model={modalModel}
        onClosed={() => setModalModel(null)}
      ></SelectedModelModalView>
      <DownloadModal
        model={modelDownload}
        onClose={() => setModelDownload(null)}
      ></DownloadModal>
      <DeployModal
        isOpen={deployModalOpen}
        model={model}
        onClose={() => setDeployModalOpen(null)}
      ></DeployModal>
      <EditModal
        isOpen={datasetNameEditOpen}
        headerText="Edit Name"
        value={""}
        placeholder="Enter new model name"
        onSave={(text) => {
          updateModel({ ...model, name: text });
          setDatasetNameEditOpen(false);
        }}
        onCancel={() => setDatasetNameEditOpen(false)}
      ></EditModal>
    </Row>
  );
};

export default ModelTableEntry;
