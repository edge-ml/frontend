import React, { useState } from "react";
import Checkbox from "../../components/Common/Checkbox";
import { Row, Col } from "reactstrap";
import { EdgeMLTableEntry } from "../../components/Common/EdgeMLTable";
import { Button, UncontrolledTooltip } from "reactstrap";
import { SelectedModelModalView } from "../../components/SelectedModelModalView/SelectedModelModalView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faDownload,
  faMicrochip,
  faPlay,
  faInfoCircle,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import DownloadModal from "./DownloadModal";
import useProjectRouter from "../../Hooks/ProjectRouter";

const checkExportC = (model, stepOptions) => {
  const res = model.pipeline.selectedPipeline.steps.map((step) => {
    if (!stepOptions) {
      return false;
    }
    const stepOption = stepOptions.find(
      (elm) => elm.name === step.options.name
    );
    if (
      ["PRE", "CORE"].includes(stepOption.type) &&
      !stepOption.platforms.includes("C")
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
    <Button {...props} className="btn-edit ms-2 my-2" onClick={onClickStop}>
      <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
      <div>
        <small>{children}</small>
      </div>
    </Button>
  );
};

const ModelCheckBoxInfo = ({ selectedModels, model, clickCheckBox }) => {
  return (
    <Col>
      <div className="d-flex align-items-center h-100">
        <Checkbox
          isSelected={selectedModels.includes(model._id)}
          onClick={() => {
            clickCheckBox(model._id);
          }}
        ></Checkbox>
        <div className="ms-2">
          <b className="font-size-lg h5 fw-bold">{model.name}</b>
          <div>{model.pipeline.selectedPipeline.name}</div>
        </div>
      </div>
    </Col>
  );
};

const TrainErrorSection = ({ model, selectedModels, clickCheckBox }) => {
  return (
    <Row className="p-2">
      <ModelCheckBoxInfo
        selectedModels={selectedModels}
        model={model}
        clickCheckBox={clickCheckBox}
      ></ModelCheckBoxInfo>
      <Col>
        {model.error == "" ? null : (
          <>
            <div
              className="ms-5 flex-grow-1 d-flex justify-content-center align-items-center"
              style={{ color: "red" }}
            >
              An error occured while training!
              <FontAwesomeIcon
                id={"tooltip" + model._id}
                className="m-2"
                icon={faCircleInfo}
              ></FontAwesomeIcon>
            </div>
            <UncontrolledTooltip target={"tooltip" + model._id}>
              {model.error}
            </UncontrolledTooltip>
          </>
        )}
        {model.trainStatus === "done" ? (
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
      <Col className="col-sm-auto flex-row">
        <div className="d-flex">
          <ButtonList model={model}></ButtonList>
        </div>
      </Col>
    </Row>
  );
};

const ButtonList = ({ model, setModalModel, setModelDownload }) => {
  const navigateTo = useProjectRouter();

  return (
    <>
      {!model.error ? (
        <>
          <ListButton
            color="info"
            outline
            icon={faInfoCircle}
            onClick={() => setModalModel(model)}
          >
            Info
          </ListButton>
          <ListButton
            color="primary"
            outline
            icon={faPlay}
            onClick={() => navigateTo("models/live/" + model._id)}
          >
            View live
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
            icon={faDownload}
            onClick={() => setModelDownload(model)}
          >
            Download
          </ListButton>
        </>
      ) : null}
      <ListButton
        color="danger"
        outline
        icon={faTrashAlt}
        onClick={() => onDeleteSingleModel(model)}
      >
        Delete
      </ListButton>
    </>
  );
};

const ModelTableEntry = ({
  model,
  selectedModels,
  stepOptions,
  clickCheckBox,
}) => {
  const [modalModel, setModalModel] = useState(null);
  const [modelDownload, setModelDownload] = useState(null);
  const navigate = useNavigate();
  const metric = (metric) => Math.round(metric * 100 * 100) / 100;

  if (model.error) {
    return (
      <TrainErrorSection
        model={model}
        selectedModels={selectedModels}
        clickCheckBox={clickCheckBox}
      ></TrainErrorSection>
    );
  }

  const metrics =
    model.error || model.trainStatus !== "done"
      ? undefined
      : model.pipeline.selectedPipeline.steps.filter(
          (elm) => elm.type === "EVAL"
        )[0].options.metrics.metrics;
  return (
    <Row className="p-2">
      <ModelCheckBoxInfo
        selectedModels={selectedModels}
        model={model}
        clickCheckBox={clickCheckBox}
      ></ModelCheckBoxInfo>
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
      <Col className="col-sm-auto flex-row">
        <div className="d-flex">
          <ButtonList
            model={model}
            setModalModel={setModalModel}
            setModelDownload={setModelDownload}
          ></ButtonList>
        </div>
      </Col>
      <SelectedModelModalView
        model={modalModel}
        onClosed={() => setModalModel(false)}
      ></SelectedModelModalView>
      <DownloadModal
        model={modelDownload}
        onClose={() => setModelDownload(undefined)}
      ></DownloadModal>
    </Row>
  );
};

export default ModelTableEntry;
