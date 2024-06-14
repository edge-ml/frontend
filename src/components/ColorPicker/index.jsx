import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Button } from "reactstrap";

import "./index.css";

const ColorPicker = (props) => {
  const [color, setColor] = useState({ "hex": props.color });

  const onChangeComplete = (color, event) => {
    setColor(color);
  };

  const onSave = (e) => {
    props.onSave(color.hex);
    e.preventDefault();
    e.stopPropagation();
  }


  if (!props.isOpen) {
    return null;
  }

  console.log(props)

  return (
    <div className="wrapper bg-white d-flex justiy-content-end flex-column"
      onClick={(e) => { e.stopPropagation }}
      onDragStart={e => { e.stopPropagation() }}>
      <SketchPicker
        className="sketch-picker"
        {...props}
        onChangeComplete={onChangeComplete}
        color={color}
        onChange={setColor}
      ></SketchPicker>
      <hr></hr>
      <Button size="sm mx-2 mb-2" onClick={onSave}>
        Save
      </Button>
    </div>
  );
};

export default ColorPicker;
