import React from "react";
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Alert,
} from "reactstrap";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
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

// Does an option support the chosen deployment goal? "ANY" (server-only) accepts
// everything; "C"/"EXECUTORCH" require the matching real export capability.
const optionMatchesGoal = (option, goal) => {
  if (!goal || goal === "ANY") return true;
  const t = optionExportTargets(option);
  if (goal === "EXECUTORCH") return !!t.executorch;
  if (goal === "C") return !!t.c;
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

const TrainingWizard = ({ isOpen, modalOpen, onClose }) => {
  // Data obtained from the server

  const [pipelines, setPipelines] = useState(undefined);

  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifiers, setClassifiers] = useState([]);
  const [evaluation, setEvaluation] = useState([]);
  const [normalizer, setNormalizer] = useState([]);
  const [windowing, setWindowing] = useState([]);
  const [featureExtractors, setFeatureExtractors] = useState([]);

  // User selections made in the wizard
  const [disabledTimeseriesNames, setDisabledTimeseriesNames] = useState([]);
  const [labeling, setLableing] = useState();
  const [zeroClass, toggleZeroClass] = useState(false);
  const [modelName, setModelName] = useState("");
  const [selectedClassifier, setSelectedClassifier] = useState(undefined);
  const [selectedEval, setSelectedEval] = useState(undefined);
  const [selectednormalizer, setSelectednormalizer] = useState(undefined);
  const [selectedWindowing, setSelectedWindowing] = useState(undefined);
  const [selectedFeatureExtractor, setSelectedFeatureExtractor] =
    useState(undefined);

  const [selectedPipeline, setSelectedPipeline] = useState(undefined);
  const [selectedPipelineSteps, setSelectedPipelineSteps] = useState(undefined);
  // Where the model will be deployed: "C" | "EXECUTORCH" | "ANY" (undefined until chosen).
  const [exportGoal, setExportGoal] = useState(undefined);

  // Current state of the wizard
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

  const onEvaluationChanged = (evl) => setEvaluation(evl);

  useEffect(() => {
    getDatasets().then((datasets) => {
      const newDatasets = datasets.map((elm) => {
        return { ...elm, selected: false };
      });
      setDisabledTimeseriesNames([]);
      setDatasets(newDatasets);
    });
    getLabelings().then((labelings) =>
      setLabelings(labelings.map((ls) => ({ ...ls, disabledLabels: [] })))
    );
    getTrainConfig().then((result) => {
      setPipelines(result);
      setEvaluation(result.evaluation);
      setClassifiers(result.classifier);
      setNormalizer(result.normalizer);
      setWindowing(result.windowing);
      setFeatureExtractors(result.featureExtractors);
    });
  }, []);

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

  const props = {
    onSelectTrainingMethod: onSelectTrainingMethod,
    pipelines: pipelines,
    datasets: datasets,
    labelings: labelings,
    setLabeling: setLableing,
    selectedLabeling: labeling,
    toggleSelectDataset: toggleSelectDataset,
    disabledTimeseriesNames: disabledTimeseriesNames,
    toggleDisableTimeseries: toggleDisableTimeseries,
    windowers: windowing,
    selectedWindowing: selectedWindowing,
    setSelectedWindower: setSelectedWindowing,
    setWindower: setWindowing,
    featureExtractors: featureExtractors,
    setFeatureExtractor: setSelectedFeatureExtractor,
    normalizer: normalizer,
    setNormalizer: setSelectednormalizer,
    setModelName: setModelName,
    selectedClassifier: selectedClassifier,
    setSelectedClassifier: setSelectedClassifier,
    setClassifier: setClassifiers,
    classifier: classifiers,
    evaluation: evaluation,
    onEvaluationChanged: onEvaluationChanged,
    setSelectedEval: setSelectedEval,
    modelName: modelName,
    setModelName: setModelName,
    zeroClass: zeroClass,
    toggleZeroClass: toggleZeroClass,
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
  const currentError = validateCurrentStep();
  // The export target is fixed by the chosen deployment goal: option filtering
  // guarantees every step supports it, so the model will export that way.
  // Server-only ("ANY") intentionally shows no device export.
  const exportTargets =
    exportGoal === "EXECUTORCH"
      ? { c: false, executorch: true }
      : exportGoal === "C"
      ? { c: true, executorch: false }
      : { c: false, executorch: false };

  return (
    <Modal isOpen={isOpen} size="xl">
      <ModalHeader>
        <div>
          {"Train a model" +
            (selectedPipeline ? ": " + selectedPipeline.name : "")}
        </div>
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "8px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
        </div>
      </ModalHeader>
      <ModalBody style={{ minHeight: "50vh" }}>
        {datasets &&
        labelings &&
        (datasets.length === 0 || labelings.length === 0) ? (
          <div
            className="d-flex justify-content-center align-items-center fw-bold"
            style={{ height: "30vh" }}
          >
            You need datasets and labelings to train models!
          </div>
        ) : null}
        {pipelines && !selectedPipeline && datasets.length !== 0 && labelings.length !== 0 ? (
          <SelectTrainMethod
            pipelines={pipelines}
            onSelectTrainingMethod={onSelectTrainingMethod}
          ></SelectTrainMethod>
        ) : null}
        {selectedPipeline && !exportGoal ? (
          <SelectExportGoal
            availableKeys={["EXECUTORCH", "C", "ANY"].filter((k) =>
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
              ></Wizard_SelectLabeling>
            ) : null}

            {screen === 1 ? (
              <Wizard_SelectDataset
                toggleSelectDataset={toggleSelectDataset}
                toggleAllDatasets={toggleAllDatasets}
                datasets={datasets}
                selectedLabeling={labeling}
                toggleDisableTimeseries={toggleDisableTimeseries}
                disabledTimeseriesNames={disabledTimeseriesNames}
              ></Wizard_SelectDataset>
            ) : null}
            {screen >= 2 && screen !== maxSteps - 1 ? (
              <Pipelinestep
                stepNum={screen}
                step={{
                  ...selectedPipeline.steps[screen - 2],
                  options: stepOptionsForGoal(
                    selectedPipeline.steps[screen - 2],
                    exportGoal
                  ),
                }}
                selectedPipelineStep={selectedPipelineSteps[screen - 2]}
                setPipelineStep={setPipelineStep}
                exportTargets={exportTargets}
              ></Pipelinestep>
            ) : null}
            {screen == maxSteps - 1 ? (
              <Select_Name
                screen={screen}
                modelName={modelName}
                setModelName={setModelName}
              ></Select_Name>
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
      </ModalBody>
      <ModalFooter className="d-flex justify-content-between align-items-center">
        <div>
          {exportGoal ? (
            <Button color="secondary" outline onClick={onBack}>
              Back
            </Button>
          ) : null}
        </div>
        {selectedPipeline && exportGoal && (trainError || currentError) ? (
          <Alert
            color="danger"
            className="my-0 py-2 mx-3 flex-grow-1 text-center"
          >
            {trainError || currentError}
          </Alert>
        ) : null}
        {selectedPipeline && exportGoal ? (
          <div className="d-flex align-items-center">
            <span className="me-3">
              {screen + 1}/{maxSteps}
            </span>
            <Button
              outline
              color="primary"
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
        ) : null}
      </ModalFooter>
    </Modal>
  );
};

export default TrainingWizard;
