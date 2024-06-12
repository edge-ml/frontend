import React, { useState } from "react";
import { InputGroup, InputGroupText, Input, FormFeedback } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL, faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
  hexToForegroundColor,
  isValidColor,
} from "../../services/ColorService";
import ColorPicker from "../ColorPicker";

const EditLabelingModalEntry = ({ label }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const onSaveColor = (color) => {
    console.log(color)
    setColorPickerOpen(false);
  };

  console.log(colorPickerOpen)

  return (
    <InputGroup key={"label" + label.name}>
      <InputGroupText>Name</InputGroupText>
      <Input
        // invalid={this.labelNameInvalid(label, index)}
        placeholder="Name"
        value={label.name}
        // onChange={(e) =>
        //   this.onLabelNameChanged(index, e.target.value)
        // }
      />
      <InputGroupText>Color</InputGroupText>
      {/* <Input
                  id={"labelColor" + index}
                  placeholder="Color"
                  // className={
                  //   isValidColor(label.color)
                  //     ? "input-group-append is-valid"
                  //     : "input-group-append clear is-invalid"
                  // }
                  style={{
                    backgroundColor: isValidColor(label.color)
                      ? label.color
                      : null,
                    color: hexToForegroundColor(label.color),
                  }}
                  value={label.color}
                  // onChange={(e) =>
                  //   this.onLabelColorChanged(index, e.target.value)
                  // }
                /> */}
      <div
        className="d-flex justify-content-center align-items-center cursor-pointer"
        style={{ backgroundColor: label.color, width: "100px" }}
        onClick={() => setColorPickerOpen(true)}
      >
        <FontAwesomeIcon
          color={hexToForegroundColor(label.color)}
          icon={faPen}
        ></FontAwesomeIcon>
        <div className="position-absolute">
          <div>
            <ColorPicker
              isOpen={colorPickerOpen}
              className="position-relative z-1000"
              color={label.color}
              onSave={onSaveColor}
              disableAlpha
            ></ColorPicker>
          </div>
        </div>
      </div>
      <InputGroupText>
        {/* <Button
                    id={"buttonDeleteLabel" + index}
                    className="m-0 deleteBtnRadius"
                    color="danger"
                    outline
                    //   onClick={(e) => {
                    //     this.onDeleteLabel(index);
                    //   }}
                  >
                    
                  </Button> */}
        <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
      </InputGroupText>
      <FormFeedback id="labelFeedback">
        {!isValidColor(label.color)
          ? "Invalid color"
          : "Duplicate names are not allowed"}
      </FormFeedback>
    </InputGroup>
  );
};

export default EditLabelingModalEntry;
