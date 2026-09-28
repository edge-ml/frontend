import React, { useEffect, useRef } from "react";
import { Button, TextInput, Group } from "@mantine/core";
import { useForm, FORM_INDEX } from "@mantine/form";

import { Modal, ModalBody, ModalFooter } from "../Common/Modal";

import { generateRandomColor } from "../../services/ColorService";
import EditLabelingModalEntry from "./EditLabelModalEntry";
import EmptyLabelingSetFeedBack from "./EmptyLabelingSetFeedBack";

const EMPTY_LABELING = Object.freeze({ name: "", labels: [] });

// ===== Pure validation helpers =====

// Live in a ref so validate rules always see the latest props without
// stale closures (useForm captures its config once).
const useExternalDataRef = (data) => {
  const ref = useRef(data);
  ref.current = data;
  return ref;
};

const findDuplicateNameKeys = (labels) => {
  const seen = new Set();
  const duplicates = new Set();
  labels.forEach(({ name }) => {
    if (!name) return;
    if (seen.has(name)) duplicates.add(name);
    else seen.add(name);
  });
  return duplicates;
};

const findDuplicateColorKeys = (labels) => {
  const seen = new Set();
  const duplicates = new Set();
  labels.forEach(({ color }) => {
    if (!color) return;
    const normalized = color.toLowerCase();
    if (seen.has(normalized)) duplicates.add(normalized);
    else seen.add(normalized);
  });
  return duplicates;
};

const EditLabelingModal = ({
  isOpen,
  currentLabeling,
  onSave,
  onClose,
  labelings,
}) => {
  const externalData = useExternalDataRef({ labelings, currentLabeling });

  const form = useForm({
    mode: "controlled",
    initialValues: EMPTY_LABELING,
    // Show errors directly while typing (docs: form-validation.md)
    validateInputOnChange: ["name", `labels.${FORM_INDEX}.name`],
    validateInputOnBlur: true,
    validate: {
      name: (value) => {
        if (!value.trim()) return "Name is required";
        const { labelings: allLabelings, currentLabeling: current } =
          externalData.current;
        if (
          allLabelings.some(
            (existing) =>
              existing.name === value && existing._id !== current?._id
          )
        ) {
          return "This name is already taken";
        }
        return null;
      },
      labels: {
        name: (value, values) => {
          if (!value.trim()) return "Label name is required";
          const count = values.labels.filter((l) => l.name === value).length;
          return count > 1 ? "Duplicate names are not allowed" : null;
        },
        // Surfaced visually on the color swatch (see ColorSwatch), since
        // there is no text input for colors to attach an inline error to.
        color: (value, values) => {
          if (!value) return null;
          const count = values.labels.filter(
            (l) => l.color?.toLowerCase() === value.toLowerCase()
          ).length;
          return count > 1 ? "This color is already used by another label" : null;
        },
      },
    },
  });

  // Fresh draft whenever the modal opens; keep edits while it stays open.
  useEffect(() => {
    if (!isOpen) return;
    const draft = currentLabeling
      ? structuredClone(currentLabeling)
      : { ...EMPTY_LABELING };
    form.setInitialValues(draft);
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isEditing = Boolean(currentLabeling);
  const values = form.getValues();

  // ===== Draft updates via the form =====

  const addLabel = () =>
    form.insertListItem("labels", {
      name: "",
      color: generateRandomColor(),
      isNewLabel: true,
    });

  const changeLabel = (index, label) =>
    form.replaceListItem("labels", index, label);

  const deleteLabel = (index) => form.removeListItem("labels", index);

  // ===== Save gating =====
  // Errors are shown inline by the form's validate config; this only
  // gates the Save button (form.isValid() is async, so it can't gate
  // render synchronously).

  const duplicateLabelNames = findDuplicateNameKeys(values.labels);
  const duplicateLabelColors = findDuplicateColorKeys(values.labels);
  const nameTaken =
    values.name !== "" &&
    labelings.some(
      (existing) =>
        existing.name === values.name && existing._id !== currentLabeling?._id
    );
  const saveDisabled =
    !values.name?.trim() ||
    nameTaken ||
    values.labels.length === 0 ||
    values.labels.some((label) => !label.name.trim()) ||
    duplicateLabelNames.size > 0 ||
    duplicateLabelColors.size > 0;

  const handleSubmit = form.onSubmit((submitted) => {
    onSave(structuredClone(submitted));
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Labeling Set" : "Add Labeling Set"}>
      <ModalBody>
        <form id="edit-labeling-form" onSubmit={handleSubmit}>
          <TextInput
            label="Labeling Set"
            placeholder="Name"
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
        </form>

        <h6 style={{ fontWeight: 700, margin: "1rem 0 0.5rem" }}>Labels</h6>
        {values.labels.map((label, index) => (
          <EditLabelingModalEntry
            key={label._id ?? `new_${index}`}
            label={label}
            colorInvalid={duplicateLabelColors.has(label.color?.toLowerCase())}
            nameInputProps={form.getInputProps(`labels.${index}.name`)}
            nameKey={form.key(`labels.${index}.name`)}
            onChangeColor={(color) =>
              form.setFieldValue(`labels.${index}.color`, color)
            }
            onDelete={() => deleteLabel(index)}
          />
        ))}

        <Button
          id="buttonAddLabel"
          color="gray"
          variant="outline"
          fullWidth
          onClick={addLabel}
        >
          + Add Label
        </Button>
        <EmptyLabelingSetFeedBack isLabelingSetEmpty={values.labels.length === 0} />
      </ModalBody>
      <ModalFooter>
        <Group justify="space-between" style={{ width: "100%" }}>
          <Button variant="outline" id="buttonClose" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            id="buttonSaveLabeling"
            color="blue"
            onClick={handleSubmit}
            disabled={saveDisabled}
          >
            Save
          </Button>
        </Group>
      </ModalFooter>
    </Modal>
  );
};

export default EditLabelingModal;
