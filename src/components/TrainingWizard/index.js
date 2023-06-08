import { Modal, ModalHeader, ModalFooter, ModalBody, Button } from 'reactstrap';
import Wizard_SelectLabeling from './Steps/Select_Labeling';
import './index.css';
import { useEffect, useState, Fragment } from 'react';
import Wizard_SelectDataset from './Steps/Select_Datasets';
import Wizard_Hyperparameters from './Steps/Select_Hyperparameters';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { getTrainconfig, train } from '../../services/ApiServices/MlService';
import SelectEvaluation from './Steps/Select_Evaluation';
import Select_Normalizer from './Steps/Select_Normalizer';
import Select_Windowing from './Steps/Select_Windowing';
import Select_Name from './Steps/Select_Name';
import Select_FeatureExtractor from './Steps/Select_FeatureExtractor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export const WizardFooter = ({
  onNext,
  onBack,
  onClose,
  onTrain,
  step,
  maxSteps,
}) => {
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
      <div>
        {step + 1}/{maxSteps}
      </div>
      <Button
        color="primary"
        onClick={step + 1 === maxSteps ? onTrain : onNext}
      >
        {step + 1 === maxSteps ? 'Train' : 'Next'}
      </Button>
    </ModalFooter>
  );
};

const TrainingWizard = ({ modalOpen, onClose }) => {
  // Data obtained from the server
  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifiers, setClassifiers] = useState([]);
  const [evaluation, setEvaluation] = useState([]);
  const [normalizer, setNormalizer] = useState([]);
  const [windowing, setWindowing] = useState([]);
  const [featureExtractors, setFeatureExtractors] = useState([]);

  // User selections made in the wizard
  const [labeling, setLableing] = useState();
  const [zeroClass, toggleZeroClass] = useState(false);
  const [modelName, setModelName] = useState('');
  const [selectedClassifier, setSelectedClassifier] = useState(undefined);
  const [selectedEval, setSelectedEval] = useState(undefined);
  const [selectednormalizer, setSelectednormalizer] = useState(undefined);
  const [selectedWindowing, setSelectedWindowing] = useState(undefined);
  const [selectedFeatureExtractor, setSelectedFeatureExtractor] =
    useState(undefined);

  // Current state of the wizard
  const [screen, setScreen] = useState(0);

  // Navigate the wizard
  const onBack = () => setScreen(Math.max(screen - 1, 0));
  const onNext = () => setScreen(Math.min(screen + 1, screens.length - 1));

  const onEvaluationChanged = (evl) => setEvaluation(evl);

  useEffect(() => {
    getDatasets().then((datasets) => {
      const newDatasets = datasets.map((elm) => {
        return { ...elm, selected: false };
      });
      setDatasets(newDatasets);
    });
    subscribeLabelingsAndLabels().then((labelings) => setLabelings(labelings));
    getTrainconfig().then((result) => {
      setEvaluation(result.evaluation);
      setClassifiers(result.classifier);
      setNormalizer(result.normalizer);
      setWindowing(result.windowing);
      setFeatureExtractors(result.featureExtractors);
      // Set default values for the pages
      setSelectedClassifier(result.classifier[0]);
      setSelectedEval(result.evaluation[0]);
      setSelectednormalizer(result.normalizer[0]);
      setSelectedWindowing(result.windowing[0]);
      setSelectedFeatureExtractor(result.featureExtractors[0]);
    });
  }, []);

  const toggleSelectDataset = (id) => {
    const newDatasets = datasets;
    const idx = datasets.findIndex((elm) => elm._id === id);
    newDatasets[idx].selected = !newDatasets[idx].selected;
    setDatasets([...newDatasets]);
  };

  const onTrain = async () => {
    console.log(selectedWindowing);
    const data = {
      datasets: datasets
        .filter((elm) => elm.selected)
        .map((elm) => {
          return {
            _id: elm._id,
            timeSeries: elm.timeSeries.map((ts) => ts._id),
          };
        }),
      labeling: {
        _id: labeling._id,
        useZeroClass: zeroClass,
        disabledLabels: labeling.disabledLabels || [],
      },
      name: modelName,
      classifier: selectedClassifier,
      evaluation: selectedEval,
      normalizer: selectednormalizer,
      windowing: selectedWindowing,
      featureExtractor: selectedFeatureExtractor,
    };
    const model_id = await train(data);
    onClose();
  };

  const props = {
    datasets: datasets,
    labelings: labelings,
    setLabeling: setLableing,
    selectedLabeling: labeling,
    toggleSelectDataset: toggleSelectDataset,
    windowers: windowing,
    setSelectedWindower: setSelectedWindowing,
    setWindower: setWindowing,
    featureExtractors: featureExtractors,
    setFeatureExtractor: setSelectedFeatureExtractor,
    normalizer: normalizer,
    setNormalizer: setSelectednormalizer,
    setModelName: setModelName,
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

  // The steps in the wizard

  const screens = [
    Wizard_SelectLabeling,
    Wizard_SelectDataset,
    Wizard_Hyperparameters,
    Select_Windowing,
    Select_FeatureExtractor,
    Select_Normalizer,
    SelectEvaluation,
    Select_Name,
  ];

  const isReady = () => {
    return (
      datasets.length > 0 &&
      labelings.length > 0 &&
      classifiers.length > 0 &&
      evaluation.length > 0 &&
      normalizer.length > 0 &&
      windowing.length > 0 &&
      featureExtractors.length > 0
    );
  };

  const rendered_screens = screens.map((screen, idx) => (
    <Fragment>
      <div className="training-wizard-body">
        <ModalBody>{screen({ ...props })}</ModalBody>
      </div>
      <WizardFooter
        step={idx}
        maxSteps={screens.length}
        onNext={onNext}
        onBack={onBack}
        onClose={onClose}
        onTrain={onTrain}
      />
    </Fragment>
  ));

  return (
    <Modal isOpen={true} size="xl">
      <ModalHeader>
        <div>Train a model</div>
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
      {isReady() ? rendered_screens[screen] : null}
    </Modal>
  );
};

export default TrainingWizard;
