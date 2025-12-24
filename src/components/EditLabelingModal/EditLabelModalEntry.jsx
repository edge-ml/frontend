import React from "react";
import { ActionIcon, ColorInput, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { isValidColor } from "../../services/ColorService";

const EditLabelingModalEntry = ({
  label,
  onChangeLabel,
  onDelete,
  invalid,
}) => {
  const onChangeName = (e) => {
    onChangeLabel({ ...label, name: e.target.value });
  };

  const nameError =
    invalid && label.name !== "" ? "Duplicate names are not allowed" : null;
  const colorError = !isValidColor(label.color) ? "Invalid color" : null;

  return (
    <Group wrap="nowrap" align="flex-start">
      <TextInput
        label="Name"
        placeholder="Name"
        value={label.name}
        onChange={onChangeName}
        error={nameError}
        style={{ flex: 1 }}
      />
      <ColorInput
        label="Color"
        placeholder="Color"
        value={label.color}
        onChange={(value) => onChangeLabel({ ...label, color: value })}
        error={colorError}
        format="hex"
        swatchesPerRow={7}
        withPicker
        inputContainer={(children) => (
          <Group align="flex-start" wrap="nowrap">
            {children}
            <ActionIcon
              color="red"
              variant="outline"
              // style={{ height: 36, width: 36, marginTop: 28 }}
              onClick={onDelete}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </ActionIcon>
          </Group>
        )}
      />
    </Group>
  );
};

export default EditLabelingModalEntry;
