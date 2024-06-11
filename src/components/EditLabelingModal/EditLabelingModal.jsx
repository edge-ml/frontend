import React, { useState } from "react";
import {
  InputGroupText,
  Modal,
  ModalBody,
  ModalHeader,
  InputGroup,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import { SketchPicker, ChromePicker, PhotoshopPicker } from "react-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPen,
  faPenAlt,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import {
  isValidColor,
  hexToForegroundColor,
  generateRandomColor,
} from "../../services/ColorService";

const EditLabelingModal = ({ isOpen, currentLabeling }) => {
  const [labeling, setLabeling] = useState(
    currentLabeling
      ? currentLabeling
      : { name: "", labels: [{ name: "test", color: "ffaaff" }] }
  );

  const onAddLabel = () => {
    const newLabeling = { ...labeling };
    newLabeling.labels.push({ name: "", color: generateRandomColor() });
    setLabeling(newLabeling);
  };

  const onColorChange = (index, color) => {
    const newLabeling = { ...labeling };
    newLabeling.labels[index].color = color;
    setLabeling(newLabeling);
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>
        {labeling ? "Edit labeling" : "Create labeling"}
      </ModalHeader>
      <ModalBody>
        <div className="d-flex flex-column algin-items-center">
          <div>
            <InputGroup>
              <InputGroupText>Labeling Set</InputGroupText>
              <Input
                // invalid={this.labelingNameInValid()}
                id="labelingName"
                placeholder="Name"
                // value={
                // this.state.labeling && this.state.labeling.name
                //     ? this.state.labeling.name
                //     : ''
                // }
                // onChange={(e) => this.onLabelingNameChanged(e.target.value)}
              />
            </InputGroup>
            {labeling ? (
              <Button
                id="buttonDeleteLabeling"
                color="danger"
                className="m-0"
                outline
                onClick={(e) => {
                  this.onDeleteLabeling(this.state.labeling["_id"]);
                }}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </Button>
            ) : null}
            {/* {labeling
              ? labeling.labels.map((elm) => {
                  <InputGroup>
                    <InputGroupText>Label</InputGroupText>
                  </InputGroup>;
                })
              : null} */}

            {labeling.labels.map((label, index) => (
              <InputGroup key={"label" + index}>
                <InputGroupText>Label</InputGroupText>
                <Input
                  // invalid={this.labelNameInvalid(label, index)}
                  id={"labelName" + index}
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
                >
                  <FontAwesomeIcon
                    color={hexToForegroundColor(label.color)}
                    icon={faPen}
                  ></FontAwesomeIcon>
                  <div className="position-absolute">
                    <div className="bg-white">
                      <SketchPicker
                        color={label.color}
                        onChangeComplete={(color) =>
                          onColorChange(index, color)
                        }
                      ></SketchPicker>
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
            ))}

            <hr></hr>
            <Button
              id="buttonAddLabel"
              className="m-0"
              color="secondary"
              outline
              block
              onClick={onAddLabel}
            >
              + Add Label
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default EditLabelingModal;
