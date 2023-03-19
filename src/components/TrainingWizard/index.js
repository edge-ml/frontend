import { Modal, ModalHeader } from 'reactstrap';
import Wizard_SelectLabeling from './Steps/Select_Labeling';
import './index.css';
import { useEffect, useState } from 'react';
import Wizard_SelectDataset from './Steps/Select_Datasets';
import Wizard_Hyperparameters from './Steps/Select_Hyperparameters';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { getTrainconfig, train } from '../../services/ApiServices/MlService';
import SelectEvaluation from './Steps/Select_Evaluation';
import Select_Normalizer from './Steps/Select_Normalizer';

const TrainingWizard = ({ modalOpen, onClose }) => {
  // Data obtained from the server
  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifiers, setClassifiers] = useState([]);
  const [evaluation, setEvaluation] = useState([]);
  const [normalizer, setNormalizer] = useState([]);

  // User selections made in the wizard
  const [labeling, setLableing] = useState();
  const [modelName, setModelName] = useState('');
  const [modelInfo, setModelInfo] = useState(undefined);
  const [selectedEval, setSelectedEval] = useState(undefined);
  const [selectednormalizer, setSelectednormalizer] = useState(undefined);

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
      console.log(result);
      setEvaluation(result.evaluation);
      setClassifiers(result.classifier);
      setNormalizer(result.normalizer);
    });
  }, []);

  const toggleSelectDataset = (id) => {
    const newDatasets = datasets;
    const idx = datasets.findIndex((elm) => elm._id === id);
    newDatasets[idx].selected = !newDatasets[idx].selected;
    setDatasets([...newDatasets]);
  };

  const onTrain = async () => {
    const data = {
      datasets: datasets
        .filter((elm) => elm.selected)
        .map((elm) => {
          return {
            _id: elm._id,
            timeSeries: elm.timeSeries.map((ts) => ts._id),
          };
        }),
      labeling: labeling._id,
      name: modelName,
      modelInfo: modelInfo,
      evaluation: selectedEval,
      normalizer: selectednormalizer,
    };
    const model_id = await train(data);
    onClose();
  };
  // The steps in the wizard
  const screens = [
    <Wizard_SelectLabeling
      datasets={datasets}
      labelings={labelings}
      setLabeling={setLableing}
      selectedLabeling={labeling}
      onNext={onNext}
      onBack={onBack}
    ></Wizard_SelectLabeling>,
    <Wizard_SelectDataset
      datasets={datasets}
      labelings={labelings}
      selectedLabeling={labeling}
      toggleSelectDataset={toggleSelectDataset}
      onNext={onNext}
      onBack={onBack}
    ></Wizard_SelectDataset>,
    <Select_Normalizer
      onNext={onNext}
      onBack={onBack}
      normalizer={normalizer}
      setNormalizer={setSelectednormalizer}
    ></Select_Normalizer>,
    <Wizard_Hyperparameters
      classifier={classifiers}
      onTrain={onTrain}
      onNext={onNext}
      onBack={onBack}
      modelName={modelName}
      setModelName={setModelName}
      setModelInfo={setModelInfo}
    ></Wizard_Hyperparameters>,
    <SelectEvaluation
      onTrain={onTrain}
      onNext={onNext}
      onBack={onBack}
      evaluation={evaluation}
      onEvaluationChanged={onEvaluationChanged}
      setSelectedEval={setSelectedEval}
    ></SelectEvaluation>,
  ];

  console.log(datasets.slength);
  console.log(labelings.length);
  console.log(classifiers);
  console.log(classifiers.length);
  const isReady = () => {
    return (
      datasets.length > 0 && labelings.length > 0 && classifiers.length > 0
    );
  };

  console.log(normalizer);

  return (
    <Modal isOpen={true} size="xl">
      <ModalHeader>Train a model</ModalHeader>
      {isReady() ? screens[screen] : null}
    </Modal>
  );
};

export default TrainingWizard;
