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
  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifier, setClassifier] = useState([]);

  // User selections
  const [labeling, setLableing] = useState();
  const [selectedClassifier, setSelectedClassifier] = useState();

  const [screen, setScreen] = useState(1);

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
    console.log(newDatasets);
    console.log(idx);
    newDatasets[idx].selected = !newDatasets[idx].selected;
    setDatasets(newDatasets);
  };

  const screens = [
    <Wizard_SelectLabeling
      datasets={datasets}
      labelings={labelings}
      setLabeling={setLableing}
      selectedLabeling={labeling}
    ></Wizard_SelectLabeling>,
    <Wizard_SelectDataset
      datasets={datasets}
      labelings={labelings}
      selectedLabeling={labeling}
      toggleSelectDataset={toggleSelectDataset}
    ></Wizard_SelectDataset>,
    <Wizard_Hyperparameters classifier={classifier}></Wizard_Hyperparameters>,
  ];

  const isReady = () => {
    return datasets.length > 0 && labelings.length > 0 && classifier.length > 0;
  };
  console.log(isReady());

  return (
    <Modal isOpen={true} size="xl">
      <ModalHeader>Train a model</ModalHeader>
      {isReady() ? (
        <div>
          <ModalBody>{screens[screen]}</ModalBody>
          <ModalFooter className="fotter">
            <Button onClick={() => setScreen(Math.max(screen - 1, 0))}>
              Back
            </Button>
            <div>
              {screen + 1}/{screens.length}
            </div>
            <Button
              onClick={() =>
                setScreen(Math.min(screen + 1, screens.length - 1))
              }
            >
              Next
            </Button>
          </ModalFooter>
        </div>
      ) : null}
    </Modal>
  );
};

export default TrainingWizard;
