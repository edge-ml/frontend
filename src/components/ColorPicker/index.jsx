import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Button, Paper } from "@mantine/core";

import "./index.css";

const ColorPicker = (props) => {
  const [color, setColor] = useState({ hex: props.color });

  const onSave = (e) => {
    props.onSave(color.hex);
    e.preventDefault();
    e.stopPropagation();
  };

  if (!props.isOpen) {
    return null;
  }

  return (
    <Paper
      shadow="md"
      p="xs"
      bg="white"
      onClick={(e) => e.stopPropagation()}
      onDragStart={(e) => e.stopPropagation()}
    >
      <SketchPicker
        {...props}
        onChangeComplete={(c) => setColor(c)}
        color={color}
        onChange={setColor}
      />
      <Button size="compact-sm" fullWidth mt="xs" onClick={onSave}>
        Save
      </Button>
    </Paper>
  );
};

export default ColorPicker;
