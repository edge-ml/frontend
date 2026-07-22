import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
} from "@mantine/core";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

import { generateRandomColor } from "../../services/ColorService";
import EditLabelingModalEntry from "./EditLabelModalEntry";

const EditLabelingModal = ({
  isOpen,
  currentLabeling,
  onSave,
  onCancel,
  labelings,
}) => {
  const [labeling, setLabeling] = useState(
    currentLabeling ? currentLabeling : { name: "", labels: [] }
  );

  useEffect(() => {
    if (isOpen) {
      setLabeling(
        currentLabeling ? { ...currentLabeling } : { name: "", labels: [] }
      );
    } else {
      setLabeling({ name: "", labels: [] });
    }
  }, [isOpen, currentLabeling]);

  const onAddLabel = () => {
    const newLabeling = { ...labeling };
    newLabeling.labels.push({ name: "", color: generateRandomColor() });
    setLabeling(newLabeling);
  };

  const onLabelChange = (index, label) => {
    const newLabeling = { ...labeling };
    newLabeling.labels[index] = label;
    setLabeling(newLabeling);
  };

  const onLabelDelete = (index) => {
    const newLabeling = { ...labeling };
    newLabeling.labels.splice(index, 1);
    setLabeling(newLabeling);
  };

  const isDuplicateLabelName = (index) => {
    const labelNames = labeling.labels.map((label) => label.name);
    const currentLabelName = labelNames[index];
    const duplicateCount = labelNames.reduce((count, name, idx) => {
      if (name === currentLabelName && idx !== index) {
        return count + 1;
      }
      return count;
    }, 0);
    return duplicateCount > 0;
  };

  const isLabelingNameDuplicate = () => {
    return labelings.some(
      (existingLabeling) =>
        existingLabeling.name === labeling.name &&
        existingLabeling._id !== labeling._id
    );
  };

  const saveDisabled = () => {
    if (labeling.name === "") {
      return true;
    }
    if (isLabelingNameDuplicate()) {
      return true;
    }
    for (const label of labeling.labels) {
      if (label.name === "") {
        return true;
      }
    }
    for (let i = 0; i < labeling.labels.length; i++) {
      if (isDuplicateLabelName(i)) {
        return true;
      }
    }
    if (labeling.labels.length === 0) {
      return true;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        {labeling ? "Edit labeling" : "Create labeling"}
      </ModalHeader>
      <ModalBody>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <TextInput
                label="Labeling Set"
                error={isLabelingNameDuplicate() && labeling.name !== "" ? "Oh no! That name is already taken" : undefined}
                id="labelingName"
                placeholder="Name"
                value={labeling.name}
                onChange={(e) => {
                  setLabeling({ ...labeling, name: e.target.value });
                }}
                style={{ width: "100%" }}
              />
            </div>

            <h6 style={{ fontWeight: 700, marginTop: "0.5rem" }}>Labels</h6>
            {labeling.labels.map((label, index) => (
              <EditLabelingModalEntry
                key={"label_" + index}
                invalid={isDuplicateLabelName(index) && label.name !== ""}
                label={label}
                onChangeLabel={(label) => onLabelChange(index, label)}
                onDelete={() => onLabelDelete(index)}
              />
            ))}

            <hr />
            <Button
              id="buttonAddLabel"
              color="gray"
              variant="outline"
              fullWidth
              onClick={onAddLabel}
            >
              + Add Label
            </Button>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          id="buttonSaveLabeling"
          color="blue"
          style={{ margin: "0.25rem" }}
          onClick={() => onSave(labeling)}
          disabled={saveDisabled()}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditLabelingModal;
