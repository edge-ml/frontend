import React from "react";
import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Paper,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import Wizard_SelectLabeling from "./Steps/Select_Labeling";
import "./index.css";
import { useEffect, useState, Fragment } from "react";
import Wizard_SelectDataset from "./Steps/Select_Datasets";
import { getDatasets } from "../../services/ApiServices/DatasetServices";
import { getLabelings } from "../../services/ApiServices/LabelingServices";
import {
  getTrainConfig,
  train,
  preflightTrain,
} from "../../services/ApiServices/MlService";
import Select_Name from "./Steps/Select_Name";
import SelectTrainMethod from "./selectTrainMethod";
import { intersect, toggleElement } from "../../services/helpers";
import Pipelinestep from "./Pipelinestep";
import ExportTarget from "../Common/ExportTarget";
import SelectExportGoal from "./SelectExportGoal";

// A step option's platform strings, normalized (fallback for older backends).
const optionPlatforms = (option) =>
  (option && option.platforms ? Array.from(option.platforms) : []).map((x) =>
    String(x).toLowerCase()
  );

// Accurate, download-flow-truthful export capability of an option. The backend
// now attaches `exportTargets` (c/executorch) computed the same way the Download
// flow decides formats — some legacy options declare a C platform they cannot
// actually export, so prefer exportTargets and fall back to raw platforms.
const optionExportTargets = (option) => {
  if (option && option.exportTargets) return option.exportTargets;
  const plats = optionPlatforms(option);
  return {
    c: ["c", "cpp", "c-embedded"].some((c) => plats.includes(c)),
    executorch: plats.includes("executorch"),
  };
};

// Does an option support the chosen deployment goal? "ANY" (export skipped)
// accepts everything; "C"/"EXECUTORCH" require the matching real export capability.
const optionMatchesGoal = (option, goal) => {
  if (!goal || goal === "ANY") return true;
  const t = optionExportTargets(option);
  if (goal === "EXECUTORCH") return !!t.executorch;
  if (goal === "C") return !!t.c;
  if (goal === "PYTORCH") return !!t.pytorch;
  return true;
};

// Only PRE/CORE steps are export-relevant; EVAL/INFO options are never filtered.
const stepOptionsForGoal = (step, goal) =>
  step && ["PRE", "CORE"].includes(step.type)
    ? step.options.filter((o) => optionMatchesGoal(o, goal))
    : step
    ? step.options
    : [];

// A goal is achievable only if every PRE/CORE step has at least one option for it.
const goalAchievable = (pipeline, goal) => {
  if (!pipeline) return false;
  if (goal === "ANY") return true;
  return pipeline.steps
    .filter((s) => ["PRE", "CORE"].includes(s.type))
    .every((s) => s.options.some((o) => optionMatchesGoal(o, goal)));
};

const TrainingWizard = ({ isOpen, onClose, onTrained }) => {
  // Data obtained from the server

  const [pipelines, setPipelines] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);

  const [disabledTimeseriesNames, setDisabledTimeseriesNames] = useState([]);
  const [labeling, setLableing] = useState();
  const [zeroClass, toggleZeroClass] = useState(false);
  const [modelName, setModelName] = useState("");

  const [selectedPipeline, setSelectedPipeline] = useState(undefined);
  const [selectedPipelineSteps, setSelectedPipelineSteps] = useState(undefined);
  // Where the model will be deployed: "C" | "EXECUTORCH" | "ANY" (undefined until chosen).
  const [exportGoal, setExportGoal] = useState(undefined);

  const [screen, setScreen] = useState(0);

  const [trainError, setTrainError] = useState(undefined);
  const [preflight, setPreflight] = useState(null);
  const [preflightLoading, setPreflightLoading] = useState(false);

  // Navigate the wizard
  const maxSteps = selectedPipeline ? selectedPipeline.steps.length + 3 : 0;
  const onBack = () => {
    setTrainError(undefined);
    if (screen === 0) {
      // Back from the first step returns to the "where will this run?" selector.
      setExportGoal(undefined);
      return;
    }
    setScreen(Math.max(screen - 1, 0));
  };
  const onNext = () => {
    setTrainError(undefined);
    setScreen(Math.min(screen + 1, maxSteps - 1));
  };

  // Every time the wizard opens, reset all configuration to a fresh state and
  // reload the data from the server, so new datasets/labelings are picked up.
  useEffect(() => {
    if (!isOpen) return;

    // Reset wizard progress and selections
    setDisabledTimeseriesNames([]);
    setLableing(undefined);
    toggleZeroClass(false);
    setModelName("");
    setSelectedPipeline(undefined);
    setSelectedPipelineSteps(undefined);
    setExportGoal(undefined);
    setScreen(0);
    setTrainError(undefined);
    setPreflight(null);
    setPreflightLoading(false);

    // Reload datasets/labelings/pipelines
    setIsLoading(true);
    Promise.all([getDatasets(), getLabelings(), getTrainConfig()])
      .then(([datasetResult, labelingResult, pipelineResult]) => {
        setDatasets(
          datasetResult.map((dataset) => ({ ...dataset, selected: false }))
        );
        setLabelings(
          labelingResult.map((item) => ({ ...item, disabledLabels: [] }))
        );
        setPipelines(pipelineResult);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const toggleDisableTimeseries = (timeseries_id) => {
    setDisabledTimeseriesNames(
      toggleElement(disabledTimeseriesNames, timeseries_id)
    );
  };

  const toggleSelectDataset = (id) => {
    const newDatasets = [...datasets];
    const idx = datasets.findIndex((elm) => elm._id === id);
    newDatasets[idx].selected = !newDatasets[idx].selected;
    setDatasets([...newDatasets]);
  };

  const toggleAllDatasets = (datasets, selected) => {
    const datasetIds = datasets.map((elm) => elm._id);
    const newDatasets = [...datasets];
    for (var i = 0; i < newDatasets.length; i++) {
      if (datasetIds.includes(newDatasets[i]._id)) {
        newDatasets[i].selected = selected;
      }
    }
    setDatasets(newDatasets);
  };

  // Build the training request (pure — does not mutate wizard state).
  const buildRequest = () => {
    const intersectingTSNames = intersect(
      ...datasets
        .filter((e) => e.selected)
        .map((e) => e.timeSeries.map((t) => t.name))
    );
    return {
      datasets: datasets
        .filter((elm) => elm.selected)
        .map((elm) => ({
          _id: elm._id,
          timeSeries: elm.timeSeries
            .filter(
              (ts) =>
                intersectingTSNames.includes(ts.name) &&
                !disabledTimeseriesNames.includes(ts.name)
            )
            .map((ts) => ts._id),
        }))
        .filter((elm) => elm.timeSeries.length > 0),
      labeling: {
        _id: labeling._id,
        useZeroClass: zeroClass,
        disabledLabelIDs: labeling.disabledLabels || [],
      },
      selectedPipeline: {
        ...selectedPipeline,
        steps: selectedPipeline.steps.map((elm, i) => ({
          ...elm,
          options: selectedPipelineSteps[i],
        })),
      },
      name: modelName,
    };
  };

  const onTrain = async () => {
    try {
      setTrainError(undefined);
      await train(buildRequest());
      onTrained && onTrained(); // show the queued job immediately, don't wait for the poll
      onClose();
    } catch (e) {
      setTrainError(
        e?.message || "Training could not be started. Please try again."
      );
    }
  };

  // On the final step, validate the full config against the real data on the
  // backend (catches window-vs-data, too-few-classes, etc.). Advisory: if the
  // check itself fails we don't block training.
  useEffect(() => {
    if (!selectedPipeline || screen !== maxSteps - 1) {
      setPreflight(null);
      return;
    }
    let cancelled = false;
    setPreflightLoading(true);
    setPreflight(null);
    preflightTrain(buildRequest())
      .then((res) => {
        if (!cancelled) setPreflight(res);
      })
      .catch(() => {
        if (!cancelled) setPreflight(null);
      })
      .finally(() => {
        if (!cancelled) setPreflightLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [screen, maxSteps, selectedPipeline]);

  const onSelectTrainingMethod = (pipeline) => {
    // Defer initialising the steps until the export goal is chosen, so the
    // defaults are compatible with that goal.
    setSelectedPipeline(pipeline);
    setExportGoal(undefined);
    setSelectedPipelineSteps(undefined);
    setScreen(0);
  };

  const onSelectExportGoal = (goal) => {
    setExportGoal(goal);
    setScreen(0);
    setSelectedPipelineSteps(
      selectedPipeline.steps.map((step) => {
        const opts = stepOptionsForGoal(step, goal);
        return opts[0] || step.options[0];
      })
    );
  };

  const setPipelineStep = (pipelineStep) => {
    const tmpPipelineData = [...selectedPipelineSteps];
    tmpPipelineData[screen - 2] = pipelineStep;

    setSelectedPipelineSteps(tmpPipelineData);
  };

  // Centralised, live validation of the current step. Each step exposes a
  // static `validate(props)` that returns an error message (or undefined when ok).
  const validateCurrentStep = () => {
    if (!selectedPipeline) return undefined;
    if (screen === 0)
      return Wizard_SelectLabeling.validate({
        selectedLabeling: labeling,
        labelings,
        zeroClass,
      });
    if (screen === 1)
      return Wizard_SelectDataset.validate({
        datasets,
        selectedLabeling: labeling,
        zeroClass,
        disabledTimeseriesNames,
      });
    if (screen >= 2 && screen !== maxSteps - 1)
      return Pipelinestep.validate({ step: selectedPipelineSteps[screen - 2] });
    if (screen === maxSteps - 1) return Select_Name.validate({ modelName });
    return undefined;
  };
  // Only validate once we're actually inside the steps (after choosing an
  // export goal); otherwise the labeling check fires on earlier screens.
  const currentError =
    selectedPipeline && exportGoal ? validateCurrentStep() : undefined;
  // The export target is fixed by the chosen goal; option filtering guarantees
  // every step supports it, so the model will export that way.
  const exportTargets =
    exportGoal === "C"
      ? { c: true, executorch: false, pytorch: false }
      : exportGoal === "PYTORCH"
        ? { c: false, executorch: false, pytorch: true }
        : { c: false, executorch: true, pytorch: false };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="lg"
      classNames={{ content: "training-wizard-modal" }}
    >
      <Modal.Header className="training-wizard-header">
        <Stack gap={4} className="training-wizard-heading">
          <Text fw={700} size="xl">
            Train a model
          </Text>
          <Text size="sm" c="dimmed">
            {selectedPipeline
              ? `${selectedPipeline.name} · Step ${screen + 1} of ${maxSteps}`
              : "Choose the pipeline that best fits your deployment target"}
          </Text>
          {selectedPipeline && (
            <Progress
              value={((screen + 1) / maxSteps) * 100}
              size="xs"
              radius="xl"
              mt={6}
            />
          )}
        </Stack>
        <Modal.CloseButton />
      </Modal.Header>
      <Modal.Body className="training-wizard-body">
        {isLoading ? (
          <Center mih="40vh">
            <Stack align="center" gap="sm">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading training options…
              </Text>
            </Stack>
          </Center>
        ) : null}
        {!isLoading && (datasets.length === 0 || labelings.length === 0) ? (
          <Paper className="training-wizard-summary">
            <Stack align="center" justify="center" mih="30vh" gap={4}>
              <Text fw={700}>Training data is not ready yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Add at least one dataset and one labeling before training a
                model.
              </Text>
            </Stack>
          </Paper>
        ) : null}
        {!isLoading &&
        pipelines &&
        !selectedPipeline &&
        datasets.length !== 0 &&
        labelings.length !== 0 ? (
          <SelectTrainMethod
            pipelines={pipelines}
            onSelectTrainingMethod={onSelectTrainingMethod}
          />
        ) : null}
        {selectedPipeline && !exportGoal ? (
          <SelectExportGoal
            availableKeys={["EXECUTORCH", "C", "PYTORCH"].filter((k) =>
              goalAchievable(selectedPipeline, k)
            )}
            onSelect={onSelectExportGoal}
            onBack={() => {
              setSelectedPipeline(undefined);
              setExportGoal(undefined);
              setSelectedPipelineSteps(undefined);
            }}
          ></SelectExportGoal>
        ) : null}
        {selectedPipeline && exportGoal ? (
          <Fragment>
            {screen === 0 ? (
              <Wizard_SelectLabeling
                labelings={labelings}
                datasets={datasets}
                setLabeling={setLableing}
                selectedLabeling={labeling}
                toggleZeroClass={toggleZeroClass}
                zeroClass={zeroClass}
              />
            ) : null}

            {screen === 1 ? (
              <Wizard_SelectDataset
                toggleSelectDataset={toggleSelectDataset}
                toggleAllDatasets={toggleAllDatasets}
                datasets={datasets}
                selectedLabeling={labeling}
                toggleDisableTimeseries={toggleDisableTimeseries}
                disabledTimeseriesNames={disabledTimeseriesNames}
              />
            ) : null}
            {screen >= 2 && screen !== maxSteps - 1
              ? (() => {
                  // Classifiers that consume the raw window sequence are only
                  // usable with the raw feature extractor; hide them (with a
                  // note) unless it is selected. Mirrors the ml preflight guard.
                  const RAW_EXTRACTOR = "Raw Time-Series (Sensors only)";
                  const RAW_ONLY = [
                    "WHAR Model",
                    "PyTorch 1D Convolutional Neural Network",
                  ];
                  const rawSelected = (selectedPipelineSteps || []).some(
                    (s) => s && s.name === RAW_EXTRACTOR
                  );
                  const goalOptions = stepOptionsForGoal(
                    selectedPipeline.steps[screen - 2],
                    exportGoal
                  );
                  const hidden = rawSelected
                    ? []
                    : goalOptions
                        .filter((o) => RAW_ONLY.includes(o.name))
                        .map((o) => o.name);
                  const options = rawSelected
                    ? goalOptions
                    : goalOptions.filter((o) => !RAW_ONLY.includes(o.name));
                  // Proactive hint on the feature-extraction step (the one that
                  // owns the raw-extractor option), plus the "hidden" note on the
                  // classifier step.
                  const isFeatureStep = goalOptions.some(
                    (o) => o.name === RAW_EXTRACTOR
                  );
                  const currentName = selectedPipelineSteps?.[screen - 2]?.name;
                  let note;
                  if (hidden.length) {
                    note = `${hidden.join(", ")} ${
                      hidden.length > 1 ? "are" : "is"
                    } only available with the "${RAW_EXTRACTOR}" feature extraction.`;
                  } else if (isFeatureStep && currentName !== RAW_EXTRACTOR) {
                    note = `WHAR Model and PyTorch 1D CNN are only available with the "${RAW_EXTRACTOR}" method — they are hidden with the current selection.`;
                  }
                  return (
                    <Pipelinestep
                      stepNum={screen}
                      step={{
                        ...selectedPipeline.steps[screen - 2],
                        options,
                      }}
                      selectedPipelineStep={selectedPipelineSteps[screen - 2]}
                      setPipelineStep={setPipelineStep}
                      exportTargets={exportTargets}
                      note={note}
                    />
                  );
                })()
              : null}
            {screen === maxSteps - 1 ? (
              <Select_Name
                screen={screen}
                modelName={modelName}
                setModelName={setModelName}
              />
            ) : null}
            {screen === maxSteps - 1 ? (
              <div className="m-2">
                <div className="mb-3 d-flex align-items-center">
                  <b className="me-2">Deployment: </b>
                  <ExportTarget targets={exportTargets} />
                </div>
                {preflightLoading ? (
                  <div className="text-muted">
                    Checking your configuration against the data…
                  </div>
                ) : preflight ? (
                  <Fragment>
                    {(preflight.errors || []).map((e, i) => (
                      <Alert key={`pfe${i}`} color="danger" className="py-2">
                        {e.message}
                      </Alert>
                    ))}
                    {(preflight.warnings || []).map((w, i) => (
                      <Alert key={`pfw${i}`} color="warning" className="py-2">
                        {w.message}
                      </Alert>
                    ))}
                    {preflight.valid &&
                    !(preflight.errors || []).length &&
                    !(preflight.warnings || []).length ? (
                      <div className="text-success">
                        Configuration looks good — ready to train.
                      </div>
                    ) : null}
                  </Fragment>
                ) : null}
              </div>
            ) : null}
          </Fragment>
        ) : null}
      </Modal.Body>
      {selectedPipeline && (
        <div className="training-wizard-footer">
          <Group justify="space-between" wrap="nowrap">
            <div className="training-wizard-footer-side">
              {exportGoal && (
                <Button variant="outline" color="gray" onClick={onBack}>
                  Back
                </Button>
              )}
            </div>
            {trainError || currentError ? (
              <Text size="sm" c="red" ta="center" style={{ flex: 1 }}>
                {trainError || currentError}
              </Text>
            ) : (
              <Text size="sm" c="dimmed" ta="center" style={{ flex: 1 }}>
                {screen + 1} / {maxSteps}
              </Text>
            )}
            <div className="training-wizard-footer-side training-wizard-footer-end">
              <Button
                disabled={
                  !!currentError ||
                  preflightLoading ||
                  (screen + 1 === maxSteps && preflight && !preflight.valid)
                }
                onClick={() => {
                  if (screen + 1 === maxSteps) {
                    onTrain();
                  } else {
                    onNext();
                  }
                }}
              >
                {screen + 1 === maxSteps ? "Train" : "Next"}
              </Button>
            </div>
          </Group>
        </div>
      )}
    </Modal>
  );
};

export default TrainingWizard;
