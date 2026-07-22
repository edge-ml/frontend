import React from "react";
import { Modal } from "@mantine/core";

import SelectLabeling from "./SelectLabeling";

const TrainWizzard = ({isOpen}) => {
  return (
    <Modal opened={isOpen} size="xl">
      <Modal.Header>
        <Modal.Title>Train</Modal.Title>
      </Modal.Header>
      <SelectLabeling />
    </Modal>
  );
};

export default TrainWizzard;
