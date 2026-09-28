import React from "react";
import { TextInput, Button, Popover, UnstyledButton } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { hexToForegroundColor } from "../../services/ColorService";
import ColorPicker from "../ColorPicker";

const EditLabelingModalEntry = ({
  label,
  nameInputProps,
  nameKey,
  onChangeColor,
  onDelete,
  colorInvalid = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "flex-start",
        width: "100%",
        marginBottom: "0.5rem",
      }}
    >
      <TextInput
        label="Name"
        placeholder="Name"
        style={{ flex: 1 }}
        key={nameKey}
        {...nameInputProps}
      />
      <ColorSwatch
        label={label}
        onChangeColor={onChangeColor}
        invalid={colorInvalid}
      />
      <Button
        color="red"
        variant="outline"
        onClick={onDelete}
        style={{ marginTop: "1.5rem" }}
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </Button>
    </div>
  );
};

// Rendered through a Mantine Popover so the picker dropdown is portaled to
// <body> and stacks above the Modal (a plain absolutely positioned element
// inside the modal's scrollable body gets clipped/covered).
const ColorSwatch = ({ label, onChangeColor, invalid }) => {
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);

  const handleSave = (color) => {
    onChangeColor(color);
    setColorPickerOpen(false);
  };

  return (
    <Popover
      opened={colorPickerOpen}
      onClose={() => setColorPickerOpen(false)}
      position="bottom-end"
      shadow="md"
      zIndex={10001}
      withinPortal
    >
      <Popover.Target>
        <UnstyledButton
          title={
            invalid
              ? "This color is already used by another label"
              : "Pick color"
          }
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: label.color,
            width: "100px",
            height: "36px",
            borderRadius: "4px",
            marginTop: "1.5rem",
            outline: invalid ? "2px solid #fa5252" : undefined,
            outlineOffset: invalid ? "1px" : undefined,
          }}
          onClick={() => setColorPickerOpen((open) => !open)}
        >
          <FontAwesomeIcon color={hexToForegroundColor(label.color)} icon={faPen} />
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <ColorPicker isOpen color={label.color} onSave={handleSave} disableAlpha />
      </Popover.Dropdown>
    </Popover>
  );
};

export default EditLabelingModalEntry;
