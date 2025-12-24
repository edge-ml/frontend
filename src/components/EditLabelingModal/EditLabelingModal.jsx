import React, { useEffect } from "react";
import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { generateRandomColor, isValidColor } from "../../services/ColorService";
import EditLabelingModalEntry from "./EditLabelModalEntry";

const EditLabelingModal = ({
  isOpen,
  currentLabeling,
  onSave,
  onCancel,
  labelings,
}) => {
  const form = useForm({
    initialValues: currentLabeling
      ? { ...currentLabeling }
      : { name: "", labels: [] },
    validate: {
      name: (value) => (value === "" ? "Labeling name is required" : null),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValues(
        currentLabeling ? { ...currentLabeling } : { name: "", labels: [] }
      );
    } else {
      form.setValues({ name: "", labels: [] });
    }
  }, [isOpen, currentLabeling]);

  const onAddLabel = () => {
    form.setValues({
      ...form.values,
      labels: [
        ...form.values.labels,
        { name: "", color: generateRandomColor() },
      ],
    });
  };

  const onLabelChange = (index, label) => {
    const nextLabels = [...form.values.labels];
    nextLabels[index] = label;
    form.setValues({
      ...form.values,
      labels: nextLabels,
    });
  };

  const onLabelDelete = (index) => {
    const nextLabels = [...form.values.labels];
    nextLabels.splice(index, 1);
    form.setValues({
      ...form.values,
      labels: nextLabels,
    });
  };

  const isDuplicateLabelName = (index) => {
    const labelNames = form.values.labels.map((label) => label.name);
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
        existingLabeling.name === form.values.name &&
        existingLabeling.id !== form.values.id
    );
  };

  const saveDisabled = () => {
    if (form.values.name === "") {
      return true;
    }
    if (isLabelingNameDuplicate()) {
      return true;
    }
    for (const label of form.values.labels) {
      if (label.name === "") {
        return true;
      }
    }
    for (let i = 0; i < form.values.labels.length; i++) {
      if (isDuplicateLabelName(i)) {
        return true;
      }
    }
    if (form.values.labels.some((label) => !isValidColor(label.color))) {
      return true;
    }
    if (form.values.labels.length === 0) {
      return true;
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onCancel}
      title={currentLabeling ? "Edit labeling" : "Create labeling"}
    >
      <Stack gap="md">
        <TextInput
          id="labelingName"
          label="Labeling Set"
          placeholder="Name"
          {...form.getInputProps("name")}
          error={
            isLabelingNameDuplicate() && form.values.name !== ""
              ? "Oh no! That name is already taken"
              : null
          }
        />
        <Text fw={600}>Labels</Text>
        {form.values.labels.map((label, index) => (
          <EditLabelingModalEntry
            key={"label_" + index}
            invalid={isDuplicateLabelName(index) && label.name !== ""}
            label={label}
            onChangeLabel={(label) => onLabelChange(index, label)}
            onDelete={() => onLabelDelete(index)}
          />
        ))}
        <Button
          id="buttonAddLabel"
          variant="outline"
          color="gray"
          onClick={onAddLabel}
        >
          + Add Label
        </Button>
        <Group justify="flex-end">
          <Button
            id="buttonSaveLabeling"
            onClick={() => onSave(form.values)}
            disabled={saveDisabled()}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditLabelingModal;
