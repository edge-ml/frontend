import React, { Fragment, useState } from "react";

import { Button, Table, Row, Col } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

import ConfusionMatrixView from "../ConfusionMatrix/ConfusionMatrixView";
import Loader from "../../modules/loader";

import "./index.css";
import classNames from "classnames";
import LabelBadge from "../Common/LabelBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

export const SelectedModelModalView = ({
  model,
  labels,
  onDelete = null,
  onClosed,
  onButtonDeploy,
  onButtonDownload,
  ...props
}) => {
  const metrics = model
    ? model.pipeline.selectedPipeline.steps.filter(
        (elm) => elm.type === "EVAL"
      )[0].options.metrics
    : null;
  return (
    <Modal isOpen={model} size="xl" {...props} onClose={() => onClosed()}>
      <ModalHeader>Model: {model && model.name}</ModalHeader>
      <ModalBody>
        {model ? (
          <>
            <div className="d-flex justify-content-between w-100">
              <div className="d-flex justify-content-start">
                <General_info
                  model={model}
                  onButtonDeploy={onButtonDeploy}
                  onButtonDownload={onButtonDownload}
                ></General_info>
                <PerformanceInfo metrics={metrics.metrics}></PerformanceInfo>
              </div>
              <div>
                <Button
                  outline
                  className="me-auto"
                  onClick={() => {}}
                  color="danger"
                >
                  <FontAwesomeIcon
                    className="mx-1"
                    icon={faTrashAlt}
                  ></FontAwesomeIcon>
                  Delete
                </Button>
              </div>
            </div>
            <div className="my-5 d-flex justify-content-start align-items-center">
              <Classification_report
                report={metrics.classification_report}
              ></Classification_report>
              <ConfusionMatrixView
                matrix={JSON.parse(metrics.confusion_matrix)}
                labels={model.labels.map((elm) => elm.name)}
              ></ConfusionMatrixView>
            </div>
            <Training_config model={model}></Training_config>
          </>
        ) : (
          <Loader loading></Loader>
        )}
      </ModalBody>
      <ModalFooter className="justify-content-end">
        {/* <div>
                <Button
                  outline
                  color='primary'
                  className="me-2"
                  onClick={(e) => {
                    onButtonDownload(model);
                    e.stopPropagation();
                  }}
                >
                  Download
                </Button>
                <Button
                  outline
                  color='primary'
                  onClick={(e) => {
                    onButtonDeploy(model);
                    e.stopPropagation();
                  }}
                >
                  Deploy
                </Button>
              </div> */}
        <Button outline onClick={onClosed}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const General_info = ({
  model,
  onDeploy,
  onButtonDeploy,
  onButtonDownload,
}) => {
  return (
    <div>
      <h5>
        <b>General information</b>
      </h5>
      <Row>
        <Col className="col-auto">
          <Table borderless size="sm" striped>
            <tbody>
              <tr>
                <th>Name</th>
                <td>{model.name}</td>
              </tr>
              <tr>
                <th>Pipeline</th>
                <td>{model.pipeline.selectedPipeline.name}</td>
              </tr>

              <tr>
                <th>Used labels</th>
                <td>
                  {model.labels.map((elm, index) => (
                    <LabelBadge color={elm.color}>{elm.name}</LabelBadge>
                  ))}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col></Col>
      </Row>
    </div>
  );
};

const Classification_report = ({ report }) => {
  const keys = Object.keys(report);
  const metrics = Object.keys(report[keys[0]]);
  return (
    <div>
      <h5>
        <b>Classification report</b>
      </h5>
      <Table borderless size="sm" striped>
        <thead>
          <tr>
            <th></th>
            {metrics.map((key) => (
              <th className="text-center">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr>
              <th>{key}</th>
              {metrics.map((met) => (
                <td className="px-4">{metric(report[key][met])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const Training_config = ({ model }) => {
  const [selectedStep, setSelectedStep] = useState(
    model.pipeline.selectedPipeline.steps[0]
  );

  const Render_Step = (step) => {
    return (
      <div className="training_step_container">
        <div
          className={classNames("training_step", {
            training_step_selected: step.name === selectedStep.name,
          })}
          onClick={() => onClickStep(step)}
        >
          <div>{step.name}</div>
        </div>
        {step.name == selectedStep.name ? (
          <div className="d-flex justify-content-center">
            <div className="v_line"></div>
          </div>
        ) : null}
      </div>
    );
  };

  const onClickStep = (step) => {
    setSelectedStep(step);
  };

  return (
    <Fragment>
      <h5>
        <b>Pipeline configuration</b>
      </h5>
      <div className="d-flex justify-content-start">
        {model.pipeline.selectedPipeline.steps
          .filter((elm) => elm.type === "PRE" || elm.type === "CORE")
          .map((elm) => Render_Step(elm, onClickStep))}
      </div>

      <div className="mx-2 borderTop p-2">
        {/* <h5>
          <b>{selectedStep.name}</b>
        </h5> */}
        <div>
          <b>Method: </b>
          {selectedStep.options.name}
        </div>
        {selectedStep.options.parameters.length > 0 ? (
          <div>
            <b>Parameters: </b>
            {selectedStep.options.parameters.map((param) => (
              <div>
                <span>{param.name}: </span>
                <span>{param.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Fragment>
  );
};

const metric = (metric) => {
  const val = Math.round(metric * 100 * 100) / 100;
  return isNaN(val) ? "" : val;
};

const PerformanceInfo = ({ metrics }) => {
  return (
    <div>
      <h5>
        <b>Metrics</b>
      </h5>
      <Table borderless size="sm" striped style={{ width: "150px" }}>
        <tbody>
          <tr>
            <td>
              <b>Accuracy</b>
            </td>
            <td>{metric(metrics.accuracy_score)}%</td>
          </tr>
          <tr>
            <td>
              <b>Precision</b>
            </td>
            <td>{metric(metrics.precision_score)}%</td>
          </tr>
          <tr>
            <td>
              <b>Recall</b>
            </td>
            <td>{metric(metrics.recall_score)}%</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};
