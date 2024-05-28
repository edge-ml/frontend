import { useState } from 'react';
import { ModalBody, ModalFooter, ModalHeader, Modal } from 'reactstrap';

import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import SelectLabeling from './SelectLabeling';

const TrainWizzard = () => {
  return (
    <Modal isOpen="true" size="xl">
      <ModalHeader>Train</ModalHeader>
      <SelectLabeling></SelectLabeling>
    </Modal>
  );
};

export default TrainWizzard;
