import React, { Fragment, useState } from "react";
import { useViewportSize } from "@mantine/hooks";

import {
  Button,
  Table,
  Tabs,
  Paper,
  SimpleGrid,
  Group,
  Text,
  ScrollArea,
} from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import ConfusionMatrixView from "../ConfusionMatrix/ConfusionMatrixView";
import Loader from "../../modules/loader";

import "./index.css";
import LabelBadge from "../Common/LabelBadge";

// sklearn's classification_report groups these apart from the per-label rows.
const SUMMARY_ROWS = ["accuracy", "macro avg", "weighted avg"];

const asPercent = (v) => {
  const val = Math.round(v * 100 * 100) / 100;
  return isNaN(val) ? "—" : `${val}%`;
};

// Gap between the modal and the window edge, and Mantine's body padding.
const GUTTER = 16;
const BODY_PAD = 16;
// Rough height of everything around the tab content (modal title, summary
// strip, tab list, matrix caption + legend, footer). Only used to size the
// matrix/report so they fit on screen without the modal scrolling.
const CHROME_HEIGHT = 380;
const CM_COL_HEAD = 92;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Work out how big the confusion matrix cells can get for this viewport and
// how wide the modal needs to be to show it. Width is shared by all tabs so
// switching tabs doesn't make the modal jump around.
const computeLayout = (model, metrics, vw, vh) => {
  const labels = model.labels.map((l) => l.name);
  const n = Math.max(1, labels.length);
  const matrix = JSON.parse(metrics.confusion_matrix);
  const maxDigits = String(Math.max(0, ...matrix.flat())).length;

  const narrow = vw < 576;
  const labelChars = narrow ? 10 : 18;
  const longest = Math.min(
    labelChars,
    Math.max(...labels.map((l) => l.length), 4)
  );
  const rowHead = Math.round(longest * 7.5 + 32);

  const maxModal = Math.max(280, vw - 2 * GUTTER);
  const availW = maxModal - 2 * BODY_PAD - rowHead - 4;
  const availH = Math.max(vh * 0.45, vh - 2 * GUTTER - CHROME_HEIGHT);

  // Fit the matrix on screen when possible, but don't shrink cells below a
  // readable size just to avoid vertical scrolling if there's width to spare.
  const minCell = Math.max(24, maxDigits * 8 + 10);
  const fitW = availW / n;
  const fitH = Math.max((availH - CM_COL_HEAD) / n, 40);
  const cell = Math.floor(clamp(Math.min(fitW, fitH), minCell, 88));
  const font = Math.round(clamp(cell * 0.3, 10, 18));

  const matrixWidth = rowHead + n * cell + 4 + 2 * BODY_PAD;
  const modalWidth = Math.round(
    clamp(matrixWidth, Math.min(maxModal, 760), maxModal)
  );

  return {
    modalWidth,
    cell,
    font,
    labelChars,
    matrix,
    scrollHeight: Math.round(availH),
  };
};

const asCount = (v) => (v == null || isNaN(v) ? "—" : Math.round(v));

export const SelectedModelModalView = ({ model, onClosed, ...rest }) => {
  // Some callers still pass deploy/download/delete handlers and a labels list;
  // this view doesn't render those actions, so drop them here rather than let
  // them leak onto the underlying Modal as unknown DOM props.
  // eslint-disable-next-line no-unused-vars
  const { labels, onDelete, onButtonDeploy, onButtonDownload, ...props } = rest;

  const metrics = model
    ? model.pipeline.selectedPipeline.steps.filter(
        (elm) => elm.type === "EVAL"
      )[0].options.metrics
    : null;

  const colorMap = model
    ? Object.fromEntries(model.labels.map((l) => [l.name, l.color]))
    : {};

  const { width: vw, height: vh } = useViewportSize();
  const layout =
    model && vw > 0 ? computeLayout(model, metrics, vw, vh) : null;

  return (
    <Modal
      isOpen={model}
      size={layout ? `${layout.modalWidth}px` : "xl"}
      xOffset={GUTTER}
      yOffset={GUTTER}
      {...props}
      onClose={() => onClosed()}
    >
      <ModalHeader>Model: {model && model.name}</ModalHeader>
      <ModalBody>
        {model ? (
          <>
            <SummaryStrip model={model} metrics={metrics.metrics} />

            <Tabs defaultValue="report" mt="lg" keepMounted={false}>
              <Tabs.List>
                <Tabs.Tab value="report">Classification report</Tabs.Tab>
                <Tabs.Tab value="confusion">Confusion matrix</Tabs.Tab>
                <Tabs.Tab value="pipeline">Pipeline</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="report" pt="md">
                <ClassificationReport
                  report={metrics.classification_report}
                  colorMap={colorMap}
                  maxHeight={layout ? layout.scrollHeight : "55vh"}
                />
              </Tabs.Panel>

              <Tabs.Panel value="confusion" pt="md">
                <ConfusionMatrixView
                  matrix={
                    layout
                      ? layout.matrix
                      : JSON.parse(metrics.confusion_matrix)
                  }
                  labels={model.labels.map((elm) => elm.name)}
                  colorMap={colorMap}
                  cellSize={layout?.cell}
                  fontSize={layout?.font}
                  labelChars={layout?.labelChars}
                  maxHeight={layout?.scrollHeight}
                />
              </Tabs.Panel>

              <Tabs.Panel value="pipeline" pt="md">
                <TrainingConfig model={model} />
              </Tabs.Panel>
            </Tabs>
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

// Always-visible header: headline metrics + a compact identity + wrapping labels.
const SummaryStrip = ({ model, metrics }) => {
  const stats = [
    { label: "Accuracy", value: asPercent(metrics.accuracy_score) },
    { label: "Precision", value: asPercent(metrics.precision_score) },
    { label: "Recall", value: asPercent(metrics.recall_score) },
    { label: "F1 score", value: asPercent(metrics.f1_score) },
  ];

  return (
    <div>
      <SimpleGrid cols={{ base: 2, xs: 4 }} spacing="sm">
        {stats.map(({ label, value }) => (
          <Paper key={label} withBorder radius="md" p="sm" className="stat-card">
            <Text className="stat-card-value">{value}</Text>
            <Text className="stat-card-label">{label}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Group justify="space-between" align="flex-start" mt="md" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="sm">
            <Text span c="dimmed">
              Pipeline:{" "}
            </Text>
            {model.pipeline.selectedPipeline.name}
          </Text>
        </div>
        <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
          {model.labels.length} labels
        </Text>
      </Group>

      <Group gap={6} mt={8}>
        {model.labels.map((elm) => (
          <LabelBadge key={elm.name} color={elm.color}>
            {elm.name}
          </LabelBadge>
        ))}
      </Group>
    </div>
  );
};

const ReportRow = ({ name, row, colorMap, summary }) => (
  <Table.Tr className={summary ? "report-summary-row" : undefined}>
    <Table.Td>
      <span className="report-label">
        {!summary ? (
          <span
            className="report-dot"
            style={{ background: colorMap[name] || "#adb5bd" }}
          />
        ) : null}
        {name}
      </span>
    </Table.Td>
    <Table.Td className="report-num">{asPercent(row["precision"])}</Table.Td>
    <Table.Td className="report-num">{asPercent(row["recall"])}</Table.Td>
    <Table.Td className="report-num">{asPercent(row["f1-score"])}</Table.Td>
    <Table.Td className="report-num">{asCount(row["support"])}</Table.Td>
  </Table.Tr>
);

const ClassificationReport = ({ report, colorMap, maxHeight }) => {
  const keys = Object.keys(report);
  const labelRows = keys.filter((k) => !SUMMARY_ROWS.includes(k));
  const summaryRows = keys.filter(
    (k) => SUMMARY_ROWS.includes(k) && typeof report[k] === "object"
  );

  return (
    <ScrollArea.Autosize mah={maxHeight} type="auto">
      <Table
        stickyHeader
        highlightOnHover
        verticalSpacing={8}
        className="report-table"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Label</Table.Th>
            <Table.Th className="report-num">Precision</Table.Th>
            <Table.Th className="report-num">Recall</Table.Th>
            <Table.Th className="report-num">F1 score</Table.Th>
            <Table.Th className="report-num">Support</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {labelRows.map((key) => (
            <ReportRow
              key={key}
              name={key}
              row={report[key]}
              colorMap={colorMap}
            />
          ))}
          {summaryRows.map((key) => (
            <ReportRow key={key} name={key} row={report[key]} summary />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  );
};

const TrainingConfig = ({ model }) => {
  const steps = model.pipeline.selectedPipeline.steps.filter(
    (elm) => elm.type === "PRE" || elm.type === "CORE"
  );
  const [selectedStep, setSelectedStep] = useState(steps[0]);

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
        ) : (
          <Text size="sm" c="dimmed">
            No parameters for this step.
          </Text>
        )}
      </div>
    </Fragment>
  );
};
