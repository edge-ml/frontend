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
  ModalFooter,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import {
  isValidColor,
  hexToForegroundColor,
  generateRandomColor,
} from "../../services/ColorService";
import ColorPicker from "../ColorPicker";
import EditLabelingModalEntry from "./EditLabelModalEntry";

const EditLabelingModal = ({ isOpen, currentLabeling }) => {
  const [labeling, setLabeling] = useState(
    currentLabeling
      ? currentLabeling
      : { name: "", labels: [{ name: "test", color: "#ffaaff" }] }
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
            <div className="d-flex align-items-center">
              <InputGroup className="d-flex">
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
                  className="ms-1"
                  outline
                  onClick={(e) => {
                    this.onDeleteLabeling(this.state.labeling["_id"]);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </Button>
              ) : null}
            </div>
            {/* {labeling
              ? labeling.labels.map((elm) => {
                  <InputGroup>
                    <InputGroupText>Label</InputGroupText>
                  </InputGroup>;
                })
              : null} */}

            <h6 className="fw-bold mt-2">Labels</h6>
            {labeling.labels.map((label, index) => (
              <EditLabelingModalEntry label={label}></EditLabelingModalEntry>
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
      <ModalFooter className="d-flex justify-content-between">
        <Button
          outline
          id="buttonClose"
          color="secondary"
          className="m-1 mr-auto"
          //   onClick={this.props.onCloseModal}
        >
          Cancel
        </Button>
        <Button
          outline
          id="buttonSaveLabeling"
          color="primary"
          className="m-1"
          //   onClick={this.onClickingSave}
          //   disabled={this.saveDisabled()}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditLabelingModal;
