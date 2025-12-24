import React, { Component } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

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
      <Modal opened={this.state.isOpen} onClose={this.state.onCloseModal}>
        <Title order={4}>
          {this.state.experiment && this.state.experiment["_id"]
            ? this.state.experiment["_id"]
            : "New Experiment"}
        </Title>
        <Stack mt="sm">
          <TextInput
            label="Name"
            value={
              this.state.experiment && this.state.experiment.name
                ? this.state.experiment.name
                : ""
            }
            onChange={(e) => this.onExperimentNameChanged(e.target.value)}
          />
          <Divider />
          {this.state.experiment && this.state.experiment.instructions
            ? this.state.experiment.instructions.map(
                (instruction, index, array) => (
                  <Group key={"instruction" + index} align="center" wrap="nowrap">
                    <Box mr="sm">
                      <div className="arrow-container">
                        <div
                          className={
                            index === 0 || array.length === 1
                              ? "arrow arrow-disabled"
                              : "arrow"
                          }
                          onClick={() => this.onLabelUp(index)}
                        >
                          &#x25B2;
                        </div>
                        <div
                          className={
                            index === array.length - 1 || array.length === 1
                            ? "arrow arrow-disabled"
                            : "arrow"
                          }
                          onClick={() => this.onLabelDown(index)}
                        >
                          &#x25BC;
                        </div>
                      </div>
                    </Box>

                    <Select
                      className="instruction-dropdown"
                      placeholder="Choose a labeling"
                      data={labelings.map((labeling) => ({
                        value: labeling["_id"],
                        label: labeling.name,
                      }))}
                      value={
                        instruction.labelingId
                          ? instruction.labelingId
                          : instruction.labelType
                            ? labelings.find((labeling) =>
                                labeling.labels.some(
                                  (label) =>
                                    label["_id"] === instruction.labelType
                                )
                              )?._id ?? null
                            : null
                      }
                      onChange={(value) =>
                        this.onSelectedLabelingChanged(index, value)
                      }
                      w={220}
                    />

                    <Select
                      className="instruction-dropdown"
                      placeholder="Choose a label"
                      data={
                        instruction.labelType
                          ? labelings
                              .filter((labeling) =>
                                labeling.labels.some(
                                  (label) =>
                                    label["_id"] === instruction.labelType
                                )
                              )[0]
                              .labels.map((type) => ({
                                value: type["_id"],
                                label: type.name,
                              }))
                          : instruction.labelingId
                            ? labelings
                                .filter(
                                  (labeling) =>
                                    labeling["_id"] === instruction.labelingId
                                )[0]
                                .labels.map((type) => ({
                                  value: type["_id"],
                                  label: type.name,
                                }))
                            : []
                      }
                      value={instruction.labelType ?? null}
                      onChange={(value) =>
                        this.onSelectedLabelChanged(index, value)
                      }
                      disabled={!instruction.labelType && !instruction.labelingId}
                      w={220}
                    />

                    <NumberInput
                      min={0}
                      step={1}
                      value={instruction.duration}
                      onChange={(value) =>
                        this.onDurationChanged(index, value)
                      }
                      w={120}
                    />
                    <Text size="sm">ms</Text>
                    <Button
                      color="red"
                      variant="outline"
                      onClick={() => {
                        this.onDeleteInstruction(instruction);
                      }}
                    >
                      ✕
                    </Button>
                  </Group>
                )
              )
            : null}
          <Button
            mt="md"
            color="gray"
            variant="outline"
            fullWidth
            onClick={this.onAddInstruction}
          >
            + Add Instruction
          </Button>
          {this.state.experiment && !this.state.isNewExperiment ? (
            <Box>
              <Divider my="sm" />
              <Button
                color="red"
                fullWidth
                variant="outline"
                onClick={() => {
                  if (window.confirm("Delete this experiment?")) {
                    this.state.onDeleteExperiment(this.state.experiment["_id"]);
                  }
                }}
              >
                Delete Experiment
              </Button>
            </Box>
          ) : null}
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button
            color="blue"
            id="onSaveExperiment"
            onClick={() => {
              this.state.onSave(this.state.experiment);
            }}
          >
            Save
          </Button>
          <Button
            color="gray"
            onClick={this.state.onCloseModal}
          >
            Cancel
          </Button>
        </Group>
      </Modal>
    );
  }
}
export default EditInstructionModal;
