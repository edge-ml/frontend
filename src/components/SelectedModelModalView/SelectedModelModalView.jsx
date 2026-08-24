import React, { Fragment, useState } from "react";

import { Button, Table } from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import ConfusionMatrixView from "../ConfusionMatrix/ConfusionMatrixView";
import Loader from "../../modules/loader";

import "./index.css";
import LabelBadge from "../Common/LabelBadge";

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
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <div className="model-info-section" style={{ flex: "1 1 0" }}>
                <h5 className="model-section-title">General information</h5>
                <General_info model={model} />
              </div>
              <div className="model-info-section" style={{ flex: "0 0 auto" }}>
                <h5 className="model-section-title">Metrics</h5>
                <PerformanceInfo metrics={metrics.metrics} />
              </div>
            </div>
            <div
              className="model-info-sections-row"
              style={{
                marginTop: "1.25rem",
                display: "flex",
                gap: "1rem",
                alignItems: "stretch",
              }}
            >
              <div className="model-info-section" style={{ flex: "1 1 0" }}>
                <h5 className="model-section-title">Classification report</h5>
                <Classification_report report={metrics.classification_report} />
              </div>
              <div className="model-info-section" style={{ flex: "0 0 auto" }}>
                <h5 className="model-section-title">Confusion matrix</h5>
                <ConfusionMatrixView
                  matrix={JSON.parse(metrics.confusion_matrix)}
                  labels={model.labels.map((elm) => elm.name)}
                />
              </div>
            </div>
            <div
              className="model-info-section"
              style={{ marginTop: "1.25rem" }}
            >
              <h5 className="model-section-title">Pipeline configuration</h5>
              <Training_config model={model} />
            </div>
          </>
        ) : (
          <Loader loading />
        )}
      </ModalBody>
      <ModalFooter style={{ justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onClosed}>
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
    <Table
      size="sm"
      verticalSpacing={6}
      withTableBorder={false}
      className="model-info-table"
    >
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
            {model.labels.map((elm) => (
              <LabelBadge key={elm.name} color={elm.color}>
                {elm.name}
              </LabelBadge>
            ))}
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

const Classification_report = ({ report }) => {
  const keys = Object.keys(report);
  const metrics = Object.keys(report[keys[0]]);
  return (
    <Table
      size="sm"
      verticalSpacing={6}
      withTableBorder={false}
      className="model-info-table"
    >
      <thead>
        <tr>
          <th></th>
          {metrics.map((key) => (
            <th style={{ textAlign: "center" }} key={key}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {keys.map((key) => (
          <tr key={key}>
            <th>{key}</th>
            {metrics.map((met) => (
              <td style={{ textAlign: "center" }} key={met}>
                {metric(report[key][met])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Training_config = ({ model }) => {
  const [selectedStep, setSelectedStep] = useState(
    model.pipeline.selectedPipeline.steps[0]
  );

  const steps = model.pipeline.selectedPipeline.steps.filter(
    (elm) => elm.type === "PRE" || elm.type === "CORE"
  );

  return (
    <Fragment>
      <div className="pipeline-steps">
        {steps.map((step, index) => (
          <Fragment key={step.name}>
            {index > 0 ? (
              <FontAwesomeIcon
                className="pipeline-step-arrow"
                icon={faChevronRight}
              />
            ) : null}
            <button
              type="button"
              className={`pipeline-step${
                step.name === selectedStep.name ? " pipeline-step-selected" : ""
              }`}
              onClick={() => setSelectedStep(step)}
            >
              <span className="pipeline-step-number">{index + 1}</span>
              {step.name}
            </button>
          </Fragment>
        ))}
      </div>

      <div className="pipeline-details">
        <div className="pipeline-details-method">
          Method: {selectedStep.options.name}
        </div>
        {selectedStep.options.parameters.length > 0 ? (
          <div className="pipeline-params-grid">
            {selectedStep.options.parameters.map((param) => (
              <div className="pipeline-param" key={param.name}>
                <span className="pipeline-param-name">{param.name}</span>
                <span className="pipeline-param-value">{param.value}</span>
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
  const stats = [
    { label: "Accuracy", value: metric(metrics.accuracy_score) },
    { label: "Precision", value: metric(metrics.precision_score) },
    { label: "Recall", value: metric(metrics.recall_score) },
  ];
  return (
    <div
      className="model-stats-row"
      style={{ flexDirection: "column", minWidth: "220px" }}
    >
      {stats.map(({ label, value }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "0.35rem 0",
          }}
        >
          <span className="model-stat-label" style={{ fontSize: "0.875rem" }}>
            {label}
          </span>
          <span className="model-stat-value">
            {value}
            {value !== "" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};
