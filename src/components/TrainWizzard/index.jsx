import React from "react";
import { Modal, Title } from "@mantine/core";

import SelectLabeling from "./SelectLabeling";

const TrainWizzard = ({ isOpen }) => {
  return (
    <Modal opened={isOpen} onClose={() => {}} size="xl" withCloseButton={false}>
      <Title order={4}>Train</Title>
      <SelectLabeling />
    </Modal>
  );
};

export default TrainWizzard;
