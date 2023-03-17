import { Modal, ModalHeader } from 'reactstrap';
import Wizard_SelectLabeling from './Steps/Select_Labeling';
import './index.css';
import { useEffect, useState } from 'react';
import Wizard_SelectDataset from './Steps/Select_Datasets';
import Wizard_Hyperparameters from './Steps/Select_Hyperparameters';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { getModels, train } from '../../services/ApiServices/MlService';

const TrainingWizard = ({ modalOpen, onClose }) => {
  // Data obtained from the server
  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifiers, setClassifiers] = useState([]);

  // User selections made in the wizard
  const [labeling, setLableing] = useState();
  const [modelName, setModelName] = useState('');
  const [modelInfo, setModelInfo] = useState(undefined);

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
    getModels().then((models) => setClassifiers(models));
  }, []);

  const toggleSelectDataset = (id) => {
    const newDatasets = datasets;
    const idx = datasets.findIndex((elm) => elm._id === id);
    newDatasets[idx].selected = !newDatasets[idx].selected;
    setDatasets([...newDatasets]);
  };

  const onTrain = async () => {
    console.log('Training');
    console.log(modelInfo);
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
    // <UnifySensors
    //   datasets={datasets}
    //   onNext={onNext}
    //   onBack={onBack}>
    // </UnifySensors>,
    <Wizard_Hyperparameters
      classifier={classifiers}
      onTrain={onTrain}
      onNext={onNext}
      onBack={onBack}
      modelName={modelName}
      setModelName={setModelName}
      setModelInfo={setModelInfo}
    ></Wizard_Hyperparameters>,
  ];

  const isReady = () => {
    return (
      datasets.length > 0 && labelings.length > 0 && classifiers.length > 0
    );
  };

  return (
    <Modal isOpen={modalOpen} size="xl">
      <ModalHeader>Train a model</ModalHeader>
      {isReady() ? screens[screen] : null}
    </Modal>
  );
};

export default TrainingWizard;
