import React, { useState } from "react";
import {
  InputGroup,
  InputGroupText,
  Input,
  FormFeedback,
  Button,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL, faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
  hexToForegroundColor,
  isValidColor,
} from "../../services/ColorService";
import ColorPicker from "../ColorPicker";

const EditLabelingModalEntry = ({ label, onChangeLabel, onDelete, invalid }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const onChangeColor = (color) => {
    onChangeLabel({ ...label, color: color });
    setColorPickerOpen(false);
  };

  const onChangeName = (e) => {
    onChangeLabel({ ...label, name: e.target.value });
  };

  return (
    <InputGroup>
      <InputGroupText>Name</InputGroupText>
      <Input
        invalid={invalid}
        placeholder="Name"
        value={label.name}
        onChange={onChangeName}
      />
      <InputGroupText>Color</InputGroupText>
      <div
        className="d-flex justify-content-center align-items-center cursor-pointer"
        style={{ backgroundColor: label.color, width: "100px" }}
        onClick={() => setColorPickerOpen(true)}
      >
        <FontAwesomeIcon
          color={hexToForegroundColor(label.color)}
          icon={faPen}
        ></FontAwesomeIcon>
        <div className="position-absolute z-10000">
          <div>
            <ColorPicker
              isOpen={colorPickerOpen}
              className="position-relative"
              color={label.color}
              onSave={onChangeColor}
              disableAlpha
            ></ColorPicker>
          </div>
        </div>
      </div>
      <Button className="ms-1" color="danger" outline onClick={onDelete}>
        <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
      </Button>
      <FormFeedback id="labelFeedback">
        {!isValidColor(label.color)
          ? "Invalid color"
          : "Duplicate names are not allowed"}
      </FormFeedback>
    </InputGroup>
  );
};

export default EditLabelingModalEntry;
