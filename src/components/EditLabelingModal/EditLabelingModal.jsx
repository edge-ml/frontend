import React, { useState } from "react";
import {
  InputGroupText,
  Modal,
  ModalBody,
  ModalHeader,
  InputGroup,
  Input,
  Button,
  ModalFooter,
  FormFeedback,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import {
  generateRandomColor,
} from "../../services/ColorService";
import EditLabelingModalEntry from "./EditLabelModalEntry";

const EditLabelingModal = ({ isOpen, currentLabeling, onSave, onCancel, labelings }) => {
  const [labeling, setLabeling] = useState(
    currentLabeling
      ? currentLabeling
      : { name: "", labels: [] }
  );

  const onAddLabel = () => {
    const newLabeling = { ...labeling };
    newLabeling.labels.push({ name: "", color: generateRandomColor() });
    setLabeling(newLabeling);
  };

  const onLabelChange = (index, label) => {
    const newLabeling = { ...labeling };
    newLabeling.labels[index] = label;
    setLabeling(newLabeling);
  };

  const onLabelDelete = (index) => {
    const newLabeling = { ...labeling };
    newLabeling.labels.splice(index, 1);
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
                  invalid={labelings.map(elm => elm.name).includes(labeling.name)}
                  id="labelingName"
                  placeholder="Name"
                  value={labeling.name}
                  onChange={(e) => { setLabeling({ ...labeling, name: e.target.value }) }}>
                </Input>
                <FormFeedback>
                  Oh no! That name is already taken
                </FormFeedback>
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
              <EditLabelingModalEntry
                label={label}
                onChangeLabel={(label) => onLabelChange(index, label)}
                onDelete={() => onLabelDelete(index)}
              ></EditLabelingModalEntry>
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
          onClick={onCancel}
        //   onClick={this.props.onCloseModal}
        >
          Cancel
        </Button>
        <Button
          outline
          id="buttonSaveLabeling"
          color="primary"
          className="m-1"
          onClick={() => onSave(labeling)}
        //   disabled={this.saveDisabled()}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditLabelingModal;
