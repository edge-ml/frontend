import React from "react";
import { Modal } from "@mantine/core";

import SelectLabeling from "./SelectLabeling";

const TrainWizzard = ({ isOpen }) => {
  return (
    <Modal opened={isOpen} size="xl" title="Train">
      <SelectLabeling />
    </Modal>
  );
};

export default TrainWizzard;
