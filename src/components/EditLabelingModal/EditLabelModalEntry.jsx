import React, { useState } from "react";
import {
  TextInput,
  Button,
  Group,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
  hexToForegroundColor,
  isValidColor,
} from "../../services/ColorService";
import ColorPicker from "../ColorPicker";
import { SketchPicker } from "react-color";

const EditLabelingModalEntry = ({
  label,
  onChangeLabel,
  onDelete,
  invalid,
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const onChangeColor = (color) => {
    onChangeLabel({ ...label, color: color });
    setColorPickerOpen(false);
  };

  const onChangeName = (e) => {
    onChangeLabel({ ...label, name: e.target.value });
  };

  return (
    <Group gap="xs" style={{ width: "100%", marginBottom: "0.5rem" }}>
      <TextInput
        label="Name"
        error={invalid ? "Duplicate names are not allowed" : undefined}
        placeholder="Name"
        value={label.name}
        onChange={onChangeName}
        style={{ flex: 1 }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: label.color,
          width: "100px",
          height: "36px",
          borderRadius: "4px",
          marginTop: "1.5rem",
          position: "relative",
        }}
        onClick={() => setColorPickerOpen(true)}
      >
        <FontAwesomeIcon
          color={hexToForegroundColor(label.color)}
          icon={faPen}
        />
        <div style={{ position: "absolute", zIndex: 10000 }}>
          <ColorPicker
            isOpen={colorPickerOpen}
            color={label.color}
            onSave={onChangeColor}
            disableAlpha
          />
        </div>
      </div>
      <Button color="red" variant="outline" onClick={onDelete} style={{ marginTop: "1.5rem" }}>
        <FontAwesomeIcon icon={faTrashAlt} />
      </Button>
    </Group>
  );
};

export default EditLabelingModalEntry;
