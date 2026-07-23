import React from "react";
import {
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
import { getTrainConfig, train } from "../../services/ApiServices/MlService";
import Select_Name from "./Steps/Select_Name";
import SelectTrainMethod from "./selectTrainMethod";
import { intersect, toggleElement } from "../../services/helpers";
import Pipelinestep from "./Pipelinestep";

const TrainingWizard = ({ isOpen, onClose }) => {
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

  const [screen, setScreen] = useState(0);

  const maxSteps = selectedPipeline ? selectedPipeline.steps.length + 3 : 0;
  const onBack = () => {
    setScreen(Math.max(screen - 1, 0));
  };
  const onNext = () => {
    setScreen(Math.min(screen + 1, maxSteps - 1));
  };

  useEffect(() => {
    Promise.all([getDatasets(), getLabelings(), getTrainConfig()])
      .then(([datasetResult, labelingResult, pipelineResult]) => {
        setDisabledTimeseriesNames([]);
        setDatasets(
          datasetResult.map((dataset) => ({ ...dataset, selected: false }))
        );
        setLabelings(
          labelingResult.map((item) => ({ ...item, disabledLabels: [] }))
        );
        setPipelines(pipelineResult);
      })
      .finally(() => setIsLoading(false));
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

  const onTrain = async () => {
    const pipelineWithOptions = {
      ...selectedPipeline,
      steps: selectedPipeline.steps.map((step, index) => ({
        ...step,
        options: selectedPipelineSteps[index],
      })),
    };

    const intersectingTSNames = intersect(
      ...datasets
        .filter((e) => e.selected)
        .map((e) => e.timeSeries.map((t) => t.name))
    );

    const data = {
      datasets: datasets
        .filter((elm) => elm.selected)
        .map((elm) => {
          return {
            _id: elm._id,
            timeSeries: elm.timeSeries
              .filter(
                (ts) =>
                  intersectingTSNames.includes(ts.name) &&
                  !disabledTimeseriesNames.includes(ts.name)
              )
              .map((ts) => ts._id),
          };
        })
        .filter((elm) => elm.timeSeries.length > 0),
      labeling: {
        _id: labeling._id,
        useZeroClass: zeroClass,
        disabledLabelIDs: labeling.disabledLabels || [],
      },
      selectedPipeline: pipelineWithOptions,
      name: modelName,
    };
    await train(data);
    onClose();
  };

  const onSelectTrainingMethod = (pipeline) => {
    setSelectedPipeline(pipeline);
    const selectedPipelineSteps = pipeline.steps.map((elm) => elm.options[0]);
    setSelectedPipelineSteps(selectedPipelineSteps);
  };

  const setPipelineStep = (pipelineStep) => {
    const tmpPipelineData = [...selectedPipelineSteps];
    tmpPipelineData[screen - 2] = pipelineStep;

    setSelectedPipelineSteps(tmpPipelineData);
  };

  let validationError;
  if (selectedPipeline) {
    if (screen === 0) {
      validationError = Wizard_SelectLabeling.validate({
        selectedLabeling: labeling,
        labelings,
        zeroClass,
      });
    } else if (screen === 1) {
      validationError = Wizard_SelectDataset.validate({
        datasets,
        selectedLabeling: labeling,
        zeroClass,
        disabledTimeseriesNames,
      });
    } else if (screen === maxSteps - 1) {
      validationError = Select_Name.validate({ modelName });
    }
  }

  const stepIsValid = selectedPipeline && !validationError;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
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
        {selectedPipeline ? (
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
            {screen >= 2 && screen !== maxSteps - 1 ? (
              <Pipelinestep
                stepNum={screen}
                step={selectedPipeline.steps[screen - 2]}
                selectedPipelineStep={selectedPipelineSteps[screen - 2]}
                setPipelineStep={setPipelineStep}
              />
            ) : null}
            {screen === maxSteps - 1 ? (
              <Select_Name
                screen={screen}
                modelName={modelName}
                setModelName={setModelName}
              />
            ) : null}
          </Fragment>
        ) : null}
      </Modal.Body>
      {selectedPipeline && (
        <div className="training-wizard-footer">
          <Group justify="space-between" wrap="nowrap">
            <div className="training-wizard-footer-side">
              {screen !== 0 && (
                <Button variant="outline" color="gray" onClick={onBack}>
                  Back
                </Button>
              )}
            </div>
            <Text size="sm" c={validationError ? "red" : "dimmed"} ta="center">
              {validationError || `${screen + 1} / ${maxSteps}`}
            </Text>
            <div className="training-wizard-footer-side training-wizard-footer-end">
              <Button
                disabled={!stepIsValid}
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
