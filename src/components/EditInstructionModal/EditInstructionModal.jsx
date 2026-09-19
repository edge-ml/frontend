import React, { Component } from "react";
import { Modal, Button, TextInput, NumberInput, Menu } from "@mantine/core";

import "./EditInstructionModal.css";

class EditInstructionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      experiment: props.experiment,
      labelTypes: props.labelTypes,
      labelings: props.labelings,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteExperiment: props.onDeleteExperiment,
      isNewExperiment: props.isNewExperiment,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      experiment: props.experiment,
      labelTypes: props.labelTypes,
      labelings: props.labelings,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteExperiment: props.onDeleteExperiment,
      isNewExperiment: props.isNewExperiment,
    });
  }

  onExperimentNameChanged = (name) => {
    this.setState({
      experiment: Object.assign({}, this.state.experiment, { name }),
    });
  };

  onDeleteInstruction = (instructionToDelete) => {
    let experiment = Object.assign({}, this.state.experiment);
    experiment.instructions = experiment.instructions.filter(
      (instruction) => instruction !== instructionToDelete
    );

    this.setState({ experiment });
  };

  onAddInstruction = () => {
    let experiment = Object.assign({}, this.state.experiment);
    let newInstruction = {
      labelType: undefined,
      duration: 1,
      labelingId: undefined,
    };
    experiment.instructions = [...experiment.instructions, newInstruction];

    this.setState({ experiment });
  };

  onSelectedLabelingChanged = (index, id) => {
    let experiment = JSON.parse(JSON.stringify(this.state.experiment));
    experiment.instructions[index].labelingId = id;
    experiment.instructions[index].labelType = undefined;

    this.setState({ experiment });
  };

  onSelectedLabelChanged = (index, id) => {
    let experiment = JSON.parse(JSON.stringify(this.state.experiment));
    experiment.instructions[index].labelType = id;

    this.setState({ experiment });
  };

  onDurationChanged = (index, duration) => {
    if (!duration) return;

    let experiment = JSON.parse(JSON.stringify(this.state.experiment));
    experiment.instructions[index].duration = duration;

    this.setState({ experiment });
  };

  onLabelUp = (index) => {
    if (index === 0) return;

    let experiment = JSON.parse(JSON.stringify(this.state.experiment));
    let element = experiment.instructions[index];
    experiment.instructions.splice(index, 1);
    experiment.instructions.splice(index - 1, 0, element);

    this.setState({ experiment });
  };

  onLabelDown = (index) => {
    let experiment = JSON.parse(JSON.stringify(this.state.experiment));

    if (index === experiment.instructions.length - 1) return;

    let element = experiment.instructions[index];
    experiment.instructions.splice(index, 1);
    experiment.instructions.splice(index + 1, 0, element);

    this.setState({ experiment });
  };

  render() {
    let labelings = this.state.labelings.map((labeling) => {
      let labels = this.state.labelTypes.filter((label) =>
        labeling.labels.includes(label["_id"])
      );
      return Object.assign({}, labeling, { labels });
    });

    return (
      <Modal
        opened={this.state.isOpen}
        onClose={this.state.onCloseModal}
        title={
          this.state.experiment && this.state.experiment["_id"]
            ? this.state.experiment["_id"]
            : "New Experiment"
        }
      >
        <Modal.Body>
          <TextInput
            label="Name"
            value={
              this.state.experiment && this.state.experiment.name
                ? this.state.experiment.name
                : ""
            }
            onChange={(e) => this.onExperimentNameChanged(e.target.value)}
          />
          <hr />
          {this.state.experiment && this.state.experiment.instructions
            ? this.state.experiment.instructions.map(
                (instruction, index, array) => (
                  <div
                    key={"instruction" + index}
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          cursor:
                            index === 0 || array.length === 1
                              ? "default"
                              : "pointer",
                          opacity: index === 0 || array.length === 1 ? 0.4 : 1,
                        }}
                        onClick={() => this.onLabelUp(index)}
                      >
                        &#x25B2;
                      </div>
                      <div
                        style={{
                          cursor:
                            index === array.length - 1 || array.length === 1
                              ? "default"
                              : "pointer",
                          opacity:
                            index === array.length - 1 || array.length === 1
                              ? 0.4
                              : 1,
                        }}
                        onClick={() => this.onLabelDown(index)}
                      >
                        &#x25BC;
                      </div>
                    </div>

                    <Menu>
                      <Menu.Target>
                        <Button variant="outline" style={{ minWidth: "120px" }}>
                          {instruction.labelingId
                            ? labelings.filter(
                                (labeling) =>
                                  labeling["_id"] === instruction.labelingId
                              )[0].name
                            : instruction.labelType
                              ? labelings.filter((labeling) =>
                                  labeling.labels.some(
                                    (label) =>
                                      label["_id"] === instruction.labelType
                                  )
                                )[0].name
                              : "Choose a labeling"}
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {labelings.map((labeling) => (
                          <Menu.Item
                            key={labeling["_id"]}
                            onClick={(e) =>
                              this.onSelectedLabelingChanged(
                                index,
                                labeling["_id"]
                              )
                            }
                          >
                            {labeling.name}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>

                    <Menu>
                      <Menu.Target>
                        <Button variant="outline" style={{ minWidth: "120px" }}>
                          {instruction.labelType
                            ? this.state.labelTypes.filter(
                                (type) => type["_id"] === instruction.labelType
                              )[0].name
                            : "Choose a label"}
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {instruction.labelType ? (
                          labelings
                            .filter((labeling) =>
                              labeling.labels.some(
                                (label) =>
                                  label["_id"] === instruction.labelType
                              )
                            )[0]
                            .labels.map((type) => (
                              <Menu.Item
                                key={type["_id"]}
                                onClick={(e) =>
                                  this.onSelectedLabelChanged(
                                    index,
                                    type["_id"]
                                  )
                                }
                              >
                                {type.name}
                              </Menu.Item>
                            ))
                        ) : instruction.labelingId ? (
                          labelings
                            .filter(
                              (labeling) =>
                                labeling["_id"] === instruction.labelingId
                            )[0]
                            .labels.map((type) => (
                              <Menu.Item
                                key={type["_id"]}
                                onClick={(e) =>
                                  this.onSelectedLabelChanged(
                                    index,
                                    type["_id"]
                                  )
                                }
                              >
                                {type.name}
                              </Menu.Item>
                            ))
                        ) : (
                          <Menu.Item disabled>
                            Choose a labeling first
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>

                    <NumberInput
                      min={0}
                      step={1}
                      onChange={(value) => this.onDurationChanged(index, value)}
                      value={instruction.duration}
                      style={{ width: "80px" }}
                      rightSection={<>ms</>}
                    />

                    <Button
                      color="red"
                      variant="outline"
                      onClick={(e) => {
                        this.onDeleteInstruction(instruction);
                      }}
                    >
                      &#x2715;
                    </Button>
                  </div>
                )
              )
            : null}
          <Button
            style={{ marginTop: "0.75rem" }}
            variant="outline"
            color="gray"
            fullWidth
            onClick={this.onAddInstruction}
          >
            + Add Instruction
          </Button>
          {this.state.experiment && !this.state.isNewExperiment ? (
            <div>
              <hr />
              <Button
                color="red"
                fullWidth
                style={{ margin: 0 }}
                variant="outline"
                onClick={(e) => {
                  if (window.confirm("Delete this experiment?")) {
                    this.state.onDeleteExperiment(this.state.experiment["_id"]);
                  }
                }}
              >
                Delete Experiment
              </Button>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="blue"
            style={{ margin: "0.25rem" }}
            id="onSaveExperiment"
            onClick={(e) => {
              this.state.onSave(this.state.experiment);
            }}
          >
            Save
          </Button>
          <Button
            variant="outline"
            color="gray"
            style={{ margin: "0.25rem" }}
            onClick={this.state.onCloseModal}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
export default EditInstructionModal;
