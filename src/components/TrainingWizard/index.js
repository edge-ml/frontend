import {
  Modal,
  ModalFooter,
  ModalHeader,
  Button,
  ModalBody,
  Container,
} from 'reactstrap';
import Wizard_SelectLabeling from './Steps/Select_Labeling';

import './index.css';
import { useEffect, useState } from 'react';
import Wizard_SelectDataset from './Steps/Select_Datasets';
import Wizard_Hyperparameters from './Steps/Select_Hyperparameters';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { getModels } from '../../services/ApiServices/MlService';
import Loader from '../../modules/loader';

const TrainingWizard = () => {
  // Data obtained from the server
  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifier, setClassifier] = useState([]);

  // User selections made in the wizard
  const [labeling, setLableing] = useState();
  const [selectedClassifier, setSelectedClassifier] = useState();
  const [modelName, setModelName] = useState('');

  // Current state of the wizard
  const [screen, setScreen] = useState(0);
  // Navigate the wizard
  const onBack = () => setScreen(Math.max(screen - 1, 0));
  const onNext = () => setScreen(Math.min(screen + 1, screens.length - 1));

  useEffect(() => {
    getDatasets().then((datasets) => {
      const newDatasets = datasets.map((elm) => {
        return { ...elm, selected: false };
      });
      setDatasets(newDatasets);
    });
    subscribeLabelingsAndLabels().then((labelings) => setLabelings(labelings));
    getModels().then((models) => setClassifier(models));
  }, []);

  const toggleSelectDataset = (id) => {
    const newDatasets = datasets;
    const idx = datasets.findIndex((elm) => elm._id === id);
    newDatasets[idx].selected = !newDatasets[idx].selected;
    setDatasets(newDatasets);
  };

  const onTrain = () => {
    console.log('Training');
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
    <Wizard_Hyperparameters
      classifier={classifier}
      onTrain={onTrain}
      onNext={onNext}
      onBack={onBack}
      modelName={modelName}
      setModelName={setModelName}
    ></Wizard_Hyperparameters>,
  ];

  const isReady = () => {
    return datasets.length > 0 && labelings.length > 0 && classifier.length > 0;
  };

  return (
    <Modal isOpen={true} size="xl">
      <ModalHeader>Train a model</ModalHeader>
      {isReady() ? screens[screen] : null}
    </Modal>
  );
};

export default TrainingWizard;
