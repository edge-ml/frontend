import React from "react";
import { ModalHeader, Modal } from "reactstrap";

import SelectLabeling from "./SelectLabeling";

const TrainWizzard = () => {
  return (
    <Modal isOpen="true" size="xl">
      <ModalHeader>Train</ModalHeader>
      <SelectLabeling></SelectLabeling>
    </Modal>
  );
};

export default TrainWizzard;
