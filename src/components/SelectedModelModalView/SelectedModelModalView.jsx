import React, { Fragment, useState } from "react";

import { Badge, Button, Divider, Group, Paper, Stack, Table, Text } from "@mantine/core";
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
      )[0]?.options?.metrics
    : null;
  return (
    <Modal isOpen={model} size="xl" {...props} onClose={() => onClosed()}>
      <ModalHeader>Model: {model && model.name}</ModalHeader>
      <ModalBody>
        {model ? (
          <>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group align="flex-start" wrap="nowrap">
                <General_info
                  model={model}
                  onButtonDeploy={onButtonDeploy}
                  onButtonDownload={onButtonDownload}
                ></General_info>
                <PerformanceInfo metrics={metrics?.metrics}></PerformanceInfo>
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
            <Group align="flex-start" mt="lg" wrap="nowrap">
              <Classification_report
                report={metrics?.classification_report}
              ></Classification_report>
              <ConfusionMatrixView
                matrix={metrics?.confusion_matrix ? JSON.parse(metrics.confusion_matrix) : []}
                labels={model.labels.map((elm) => elm.name)}
              ></ConfusionMatrixView>
            </Group>
            <Divider my="lg" />
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
    <Paper className="model-info-card" radius="md" p="md">
      <Text fw={700} size="lg" mb="sm">
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
          <tr>
            <th>Sampling rate</th>
            <td>
              {model.samplingRate != null
                ? `${Number(model.samplingRate).toFixed(2)} Hz`
                : "-"}
            </td>
          </tr>
          <tr>
            <th>Signals</th>
            <td>
              {model.timeSeries?.length
                ? model.timeSeries.join(", ")
                : "-"}
            </td>
          </tr>
        </tbody>
      </Table>
    </Paper>
  );
};

const Classification_report = ({ report }) => {
  if (!report) {
    return (
      <Paper className="model-info-card" radius="md" p="md">
        <Text fw={700} size="lg" mb="sm">
          Classification report
        </Text>
        <Text size="sm" c="dimmed">
          Metrics are not available for this model.
        </Text>
      </Paper>
    );
  }
  const keys = Object.keys(report);
  const metrics = Object.keys(report[keys[0]]);
  return (
    <Paper className="model-info-card" radius="md" p="md">
      <Text fw={700} size="lg" mb="sm">
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
    </Paper>
  );
};

const Training_config = ({ model }) => {
  const pipelineSteps = model.pipeline.selectedPipeline.steps || [];
  const [selectedStep, setSelectedStep] = useState(pipelineSteps[0]);

  const Render_Step = (step) => {
    return (
      <div className="training_step_container" key={step.name}>
        <div
          className={classNames("training_step", {
            training_step_selected: step.name === selectedStep.name,
          })}
          onClick={() => onClickStep(step)}
        >
          <div className="training_step_title">
            <Text fw={700} size="sm">
              {step.name}
            </Text>
            <Text size="xs" c="dimmed">
              {step.options.name}
            </Text>
          </div>
          <Badge size="xs" variant="light" className="training_step_badge">
            {step.type}
          </Badge>
        </div>
      </div>
    );
  };

  const onClickStep = (step) => {
    setSelectedStep(step);
  };

  return (
    <Fragment>
      <Text fw={700} size="lg" mb="sm">
        Pipeline configuration
      </Text>
      {pipelineSteps.length === 0 ? (
        <Text size="sm" c="dimmed">
          No pipeline steps were stored for this model.
        </Text>
      ) : (
        <Group align="flex-start" wrap="nowrap" gap="lg">
        <Stack className="training_steps_list">
          {pipelineSteps
            .filter((elm) => elm.type === "PRE" || elm.type === "CORE")
            .map((elm) => Render_Step(elm))}
        </Stack>
        <Paper className="pipeline_detail" radius="md" p="md">
          <Group justify="space-between" align="center">
            <Text fw={700}>{selectedStep?.name}</Text>
            <Badge variant="outline">{selectedStep?.type}</Badge>
          </Group>
          <Text size="sm" c="dimmed" mt={4}>
            {selectedStep?.description}
          </Text>
          <Divider my="sm" />
          <Text size="sm">
            <b>Method:</b> {selectedStep?.options?.name}
          </Text>
          <Text size="xs" c="dimmed">
            {selectedStep?.options?.description}
          </Text>
          <Divider my="sm" />
          <Text fw={600} size="sm" mb={4}>
            Parameters
          </Text>
          {selectedStep?.options?.parameters?.length > 0 ? (
            <Stack gap={6}>
              {selectedStep.options.parameters.map((param) => (
                <div className="param_row" key={param.name}>
                  <Text size="sm" fw={600}>
                    {param.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {String(param.value)}
                  </Text>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed">
              No parameters for this step.
            </Text>
          )}
        </Paper>
      </Group>
      )}
    </Fragment>
  );
};

const metric = (metric) => {
  const val = Math.round(metric * 100 * 100) / 100;
  return isNaN(val) ? "" : val;
};

const PerformanceInfo = ({ metrics }) => {
  if (!metrics) {
    return (
      <Paper className="model-info-card" radius="md" p="md">
        <Text fw={700} size="lg" mb="sm">
          Metrics
        </Text>
        <Text size="sm" c="dimmed">
          Metrics are not available for this model.
        </Text>
      </Paper>
    );
  }
  return (
    <Paper className="model-info-card" radius="md" p="md">
      <Text fw={700} size="lg" mb="sm">
        Metrics
      </Text>
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
    </Paper>
  );
};
