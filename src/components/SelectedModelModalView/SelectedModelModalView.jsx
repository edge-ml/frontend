import React, { Fragment, useState } from "react";

import { Button, Group, Stack, Table, Text } from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

import ConfusionMatrixView from "../ConfusionMatrix/ConfusionMatrixView";
import Loader from "../../modules/loader";

import "./index.css";
import classNames from "classnames";
import LabelBadge from "../Common/LabelBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

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
            <Group justify="space-between" align="flex-start">
              <Group align="flex-start" wrap="nowrap">
                <General_info
                  model={model}
                  onButtonDeploy={onButtonDeploy}
                  onButtonDownload={onButtonDownload}
                ></General_info>
                <PerformanceInfo metrics={metrics.metrics}></PerformanceInfo>
              </Group>
              <Button
                variant="outline"
                color="red"
                onClick={() => {}}
                leftSection={<FontAwesomeIcon icon={faTrashAlt} />}
              >
                Delete
              </Button>
            </Group>
            <Group align="flex-start" mt="lg">
              <Classification_report
                report={metrics.classification_report}
              ></Classification_report>
              <ConfusionMatrixView
                matrix={JSON.parse(metrics.confusion_matrix)}
                labels={model.labels.map((elm) => elm.name)}
              ></ConfusionMatrixView>
            </Group>
            <Training_config model={model}></Training_config>
          </>
        ) : (
          <Loader loading></Loader>
        )}
      </ModalBody>
      <ModalFooter>
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
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClosed}>
          Close
        </Button>
        </Group>
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
      <Text fw={700} size="lg">
        General information
      </Text>
      <Table striped withRowBorders={false}>
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
              <Group gap="xs">
                {model.labels.map((elm) => (
                  <LabelBadge key={elm.id} color={elm.color}>
                    {elm.name}
                  </LabelBadge>
                ))}
              </Group>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

const Classification_report = ({ report }) => {
  const keys = Object.keys(report);
  const metrics = Object.keys(report[keys[0]]);
  return (
    <div>
      <Text fw={700} size="lg">
        Classification report
      </Text>
      <Table striped withRowBorders={false}>
        <thead>
          <tr>
            <th></th>
            {metrics.map((key) => (
              <th key={key}>
                <Text ta="center">{key}</Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <th>
                <Text>{key}</Text>
              </th>
              {metrics.map((met) => (
                <td key={met}>
                  <Text px="md">{metric(report[key][met])}</Text>
                </td>
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
      <Text fw={700} size="lg">
        Pipeline configuration
      </Text>
      <Group align="center">
        {model.pipeline.selectedPipeline.steps
          .filter((elm) => elm.type === "PRE" || elm.type === "CORE")
          .map((elm) => Render_Step(elm, onClickStep))}
      </Group>

      <Stack mt="sm" px="sm" className="borderTop" pt="sm">
        {/* <h5>
          <b>{selectedStep.name}</b>
        </h5> */}
        <Text>
          <b>Method: </b>
          {selectedStep.options.name}
        </Text>
        {selectedStep.options.parameters.length > 0 ? (
          <Stack gap={4}>
            <Text>
              <b>Parameters: </b>
            </Text>
            {selectedStep.options.parameters.map((param) => (
              <Text key={param.name}>
                <span>{param.name}: </span>
                <span>{param.value}</span>
              </Text>
            ))}
          </Stack>
        ) : null}
      </Stack>
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
