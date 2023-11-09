import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Alert,
} from 'reactstrap';
import Wizard_SelectLabeling from './Steps/Select_Labeling';
import './index.css';
import { useEffect, useState, Fragment } from 'react';
import Wizard_SelectDataset from './Steps/Select_Datasets';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { getTrainconfig, train } from '../../services/ApiServices/MlService';
import Select_Name from './Steps/Select_Name';
import SelectTrainMethod from './selectTrainMethod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { intersect, toggleElement } from '../../services/helpers';
import Pipelinestep from './Pipelinestep';

export const WizardFooter = ({
  invalidResult = false,
  onNext,
  onBack,
  onClose,
  onTrain,
  step,
  maxSteps,
}) => {
  const [clickedOnce, setClickedOnce] = useState(false);
  useEffect(() => setClickedOnce(false), [step]);

  return (
    <ModalFooter className="fotter">
      <div>
        <Button color="secondary" onClick={onClose} className="mr-2">
          Cancel
        </Button>
        <Button color="secondary" onClick={onBack}>
          Back
        </Button>
      </div>
      <Alert
        color="warning"
        style={{
          visibility: !!invalidResult && clickedOnce ? 'visible' : 'hidden',
        }}
      >
        {invalidResult || 'No problems'}
      </Alert>
      <div>
        <span className="mr-3">
          {step + 1}/{maxSteps}
        </span>
        <Button
          color="primary"
          disabled={!!invalidResult && clickedOnce}
          onClick={() => {
            if (!clickedOnce) {
              setClickedOnce(true);
            }

            if (!!invalidResult) {
              return;
            }

            if (step + 1 === maxSteps) {
              onTrain();
            } else {
              onNext();
            }
          }}
        >
          {step + 1 === maxSteps ? 'Train' : 'Next'}
        </Button>
      </div>
    </ModalFooter>
  );
};

const TrainingWizard = ({ modalOpen, onClose }) => {
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
  const [modelName, setModelName] = useState('');
  const [selectedClassifier, setSelectedClassifier] = useState(undefined);
  const [selectedEval, setSelectedEval] = useState(undefined);
  const [selectednormalizer, setSelectednormalizer] = useState(undefined);
  const [selectedWindowing, setSelectedWindowing] = useState(undefined);
  const [selectedFeatureExtractor, setSelectedFeatureExtractor] =
    useState(undefined);

  const [selectedPipeline, setSelectedPipeline] = useState(undefined);
  const [selectedPipelineSteps, setSelectedPipelineSteps] = useState(undefined);

  // Current state of the wizard
  const [screen, setScreen] = useState(0);

  const [stepValidation, setStepValidation] = useState(false);

  // Navigate the wizard
  const maxSteps = selectedPipeline ? selectedPipeline.steps.length + 3 : 0;
  const onBack = () => {
    setScreen(Math.max(screen - 1, 0));
  };
  const onNext = () => {
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
    subscribeLabelingsAndLabels().then((labelings) =>
      setLabelings(labelings.map((ls) => ({ ...ls, disabledLabels: [] })))
    );
    getTrainconfig().then((result) => {
      console.log(result);
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
    console.log('Select all');
    console.log(datasetIds);
    const newDatasets = [...datasets];
    for (var i = 0; i < newDatasets.length; i++) {
      if (datasetIds.includes(newDatasets[i]._id)) {
        newDatasets[i].selected = selected;
      }
    }
    setDatasets(newDatasets);
  };

  const onTrain = async () => {
    console.log(selectedPipelineSteps);
    console.log(selectedPipeline);

    const tmpSelectedPipeline = selectedPipeline;
    tmpSelectedPipeline.steps = tmpSelectedPipeline.steps.map((elm, i) => {
      return { ...elm, options: selectedPipelineSteps[i] };
    });
    console.log(tmpSelectedPipeline);

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
      selectedPipeline: tmpSelectedPipeline,
      name: modelName,
    };
    console.log(data);
    const model_id = await train(data);
    onClose();
  };

  const onSelectTrainingMethod = (pipeline) => {
    setSelectedPipeline(pipeline);
    const selectedPipelineSteps = pipeline.steps.map((elm) => elm.options[0]);
    setSelectedPipelineSteps(selectedPipelineSteps);
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

    console.log(pipelineStep);
    console.log(selectedPipelineSteps);

    setSelectedPipelineSteps(tmpPipelineData);
  };

  console.log(stepValidation);
  return (
    <Modal isOpen={true} size="xl">
      <ModalHeader>
        <div>
          {'Train a model' +
            (selectedPipeline ? ': ' + selectedPipeline.name : '')}
        </div>
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '8px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
        </div>
      </ModalHeader>
      <ModalBody style={{ minHeight: '50vh' }}>
        {datasets &&
        labelings &&
        (datasets.length === 0 || labelings.length === 0) ? (
          <div
            className="d-flex justify-content-center align-items-center font-weight-bold"
            style={{ height: '30vh' }}
          >
            You need datasets and labelings to train models!
          </div>
        ) : null}
        {pipelines && !selectedPipeline ? (
          <SelectTrainMethod
            pipelines={pipelines}
            onSelectTrainingMethod={onSelectTrainingMethod}
            valdiate={setStepValidation}
          ></SelectTrainMethod>
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
                validate={setStepValidation}
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
                valdiate={setStepValidation}
              ></Wizard_SelectDataset>
            ) : null}
            {screen >= 2 && screen !== maxSteps - 1 ? (
              <Pipelinestep
                stepNum={screen}
                step={selectedPipeline.steps[screen - 2]}
                selectedPipelineStep={selectedPipelineSteps[screen - 2]}
                setPipelineStep={setPipelineStep}
                valdiate={setStepValidation}
              ></Pipelinestep>
            ) : null}
            {screen == maxSteps - 1 ? (
              <Select_Name
                screen={screen}
                modelName={modelName}
                setModelName={setModelName}
                valdiate={setStepValidation}
              ></Select_Name>
            ) : null}
          </Fragment>
        ) : null}
      </ModalBody>
      <ModalFooter className="d-flex justify-content-between">
        <div>
          {screen !== 0 ? (
            <Button color="secondary" onClick={onBack}>
              Back
            </Button>
          ) : null}
        </div>
        {selectedPipeline ? (
          <span className="mr-3">
            {screen + 1}/{maxSteps}
          </span>
        ) : null}
        <div>
          {selectedPipeline ? (
            <Button
              color="primary"
              disabled={!stepValidation}
              onClick={() => {
                if (screen + 1 === maxSteps) {
                  onTrain();
                } else {
                  onNext();
                }
              }}
            >
              {screen + 1 === maxSteps ? 'Train' : 'Next'}
            </Button>
          ) : null}
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default TrainingWizard;
