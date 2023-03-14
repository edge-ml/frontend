import { Modal, ModalFooter, ModalHeader, Button, ModalBody } from 'reactstrap';
import Wizard_SelectLabeling from './Steps/Select_Labeling';

import './index.css';
import { useEffect, useState } from 'react';
import Wizard_SelectDataset from './Steps/Select_Datasets';
import Wizard_Hyperparameters from './Steps/Select_Hyperparameters';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { getModels } from '../../services/ApiServices/MlService';

const TrainingWizard = () => {
  const [datasets, setDatasets] = useState([]);
  const [labelings, setLabelings] = useState([]);
  const [classifier, setClassifier] = useState();

  useEffect(() => {
    getDatasets().then((datasets) => setDatasets(datasets));
    subscribeLabelingsAndLabels().then((labelings) => setLabelings(labelings));
    getModels().then((models) => setClassifier(models));
  }, []);

  const screens = [
    Wizard_SelectLabeling,
    Wizard_SelectDataset,
    Wizard_Hyperparameters,
  ];

  const isReady = () => {
    return datasets.length && labelings.length && classifier;
  };

  const [screen, setScreen] = useState(2);
  console.log(datasets);
  return (
    <Modal isOpen={true} size="xl">
      <ModalHeader>Train a model</ModalHeader>
      <ModalBody>
        {isReady
          ? screens[screen]({
              datasets: datasets,
              labelings: labelings,
              classifier: classifier,
            })
          : null}
      </ModalBody>
      <ModalFooter className="fotter">
        <Button onClick={() => setScreen(Math.max(screen - 1, 0))}>Back</Button>
        <Button
          onClick={() => setScreen(Math.min(screen + 1, screens.length - 1))}
        >
          Next
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TrainingWizard;
