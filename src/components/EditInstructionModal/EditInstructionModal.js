import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import './EditInstructionModal.css';

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
      isNewExperiment: props.isNewExperiment
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
      isNewExperiment: props.isNewExperiment
    });
  }

  onExperimentNameChanged = name => {
    this.setState({
      experiment: Object.assign({}, this.state.experiment, { name })
    });
  };

  onDeleteInstruction = instructionToDelete => {
    let experiment = Object.assign({}, this.state.experiment);
    experiment.instructions = experiment.instructions.filter(
      instruction => instruction !== instructionToDelete
    );

    this.setState({ experiment });
  };

  onAddInstruction = () => {
    let experiment = Object.assign({}, this.state.experiment);
    let newInstruction = {
      labelType: undefined,
      duration: 1,
      labelingId: undefined
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

  onLabelUp = index => {
    if (index === 0) return;

    let experiment = JSON.parse(JSON.stringify(this.state.experiment));
    let element = experiment.instructions[index];
    experiment.instructions.splice(index, 1);
    experiment.instructions.splice(index - 1, 0, element);

    this.setState({ experiment });
  };

  onLabelDown = index => {
    let experiment = JSON.parse(JSON.stringify(this.state.experiment));

    if (index === experiment.instructions.length - 1) return;

    let element = experiment.instructions[index];
    experiment.instructions.splice(index, 1);
    experiment.instructions.splice(index + 1, 0, element);

    this.setState({ experiment });
  };

  render() {
    let labelings = this.state.labelings.map(labeling => {
      let labels = this.state.labelTypes.filter(label =>
        labeling.labels.includes(label['_id'])
      );
      return Object.assign({}, labeling, { labels });
    });

    return (
      <Modal isOpen={this.state.isOpen}>
        <ModalHeader>
          {this.state.experiment && this.state.experiment['_id']
            ? this.state.experiment['_id']
            : 'New Experiment'}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Name</InputGroupText>
            </InputGroupAddon>
            <Input
              value={
                this.state.experiment && this.state.experiment.name
                  ? this.state.experiment.name
                  : ''
              }
              onChange={e => this.onExperimentNameChanged(e.target.value)}
            />
          </InputGroup>
          <hr />
          {this.state.experiment && this.state.experiment.instructions
            ? this.state.experiment.instructions.map(
                (instruction, index, array) => (
                  <InputGroup key={'instruction' + index}>
                    <InputGroupAddon addonType="append" className="mr-2">
                      <div className="arrow-container">
                        <div
                          className={
                            index === 0 || array.length === 1
                              ? 'arrow arrow-disabled'
                              : 'arrow'
                          }
                          onClick={() => this.onLabelUp(index)}
                        >
                          &#x25B2;
                        </div>
                        <div
                          className={
                            index === array.length - 1 || array.length === 1
                              ? 'arrow arrow-disabled'
                              : 'arrow'
                          }
                          onClick={() => this.onLabelDown(index)}
                        >
                          &#x25BC;
                        </div>
                      </div>
                    </InputGroupAddon>

                    <UncontrolledDropdown className="mr-2 instruction-dropdown">
                      <DropdownToggle caret>
                        {instruction.labelingId
                          ? labelings.filter(
                              labeling =>
                                labeling['_id'] === instruction.labelingId
                            )[0].name
                          : instruction.labelType
                          ? labelings.filter(labeling =>
                              labeling.labels.some(
                                label => label['_id'] === instruction.labelType
                              )
                            )[0].name
                          : 'Choose a labeling'}
                      </DropdownToggle>
                      <DropdownMenu>
                        {labelings.map(labeling => (
                          <DropdownItem
                            key={labeling['_id']}
                            onClick={e =>
                              this.onSelectedLabelingChanged(
                                index,
                                labeling['_id']
                              )
                            }
                          >
                            {labeling.name}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>

                    <UncontrolledDropdown className="mr-2 instruction-dropdown">
                      <DropdownToggle caret>
                        {instruction.labelType
                          ? this.state.labelTypes.filter(
                              type => type['_id'] === instruction.labelType
                            )[0].name
                          : 'Choose a label'}
                      </DropdownToggle>
                      <DropdownMenu>
                        {instruction.labelType ? (
                          labelings
                            .filter(labeling =>
                              labeling.labels.some(
                                label => label['_id'] === instruction.labelType
                              )
                            )[0]
                            .labels.map(type => (
                              <DropdownItem
                                key={type['_id']}
                                onClick={e =>
                                  this.onSelectedLabelChanged(
                                    index,
                                    type['_id']
                                  )
                                }
                              >
                                {type.name}
                              </DropdownItem>
                            ))
                        ) : instruction.labelingId ? (
                          labelings
                            .filter(
                              labeling =>
                                labeling['_id'] === instruction.labelingId
                            )[0]
                            .labels.map(type => (
                              <DropdownItem
                                key={type['_id']}
                                onClick={e =>
                                  this.onSelectedLabelChanged(
                                    index,
                                    type['_id']
                                  )
                                }
                              >
                                {type.name}
                              </DropdownItem>
                            ))
                        ) : (
                          <DropdownItem disabled>
                            Choose a labeling first
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </UncontrolledDropdown>

                    <Input
                      min={0}
                      type="number"
                      step="1"
                      onChange={e =>
                        this.onDurationChanged(index, e.target.value)
                      }
                      value={instruction.duration}
                    />
                    <InputGroupAddon addonType="append" className="mr-2">
                      <InputGroupText>ms</InputGroupText>
                    </InputGroupAddon>

                    <InputGroupAddon addonType="append">
                      <Button
                        className="m-0"
                        color="danger"
                        outline
                        onClick={e => {
                          this.onDeleteInstruction(instruction);
                        }}
                      >
                        ✕
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                )
              )
            : null}
          <Button
            className="mt-3"
            color="secondary"
            outline
            block
            onClick={this.onAddInstruction}
          >
            + Add Instruction
          </Button>
          {this.state.experiment && !this.state.isNewExperiment ? (
            <div>
              <hr />
              <Button
                color="danger"
                block
                className="m-0"
                outline
                onClick={e => {
                  if (window.confirm('Delete this experiment?')) {
                    this.state.onDeleteExperiment(this.state.experiment['_id']);
                  }
                }}
              >
                Delete Experiment
              </Button>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            className="m-1 mr-auto"
            onClick={e => {
              this.state.onSave(this.state.experiment);
            }}
          >
            Save
          </Button>{' '}
          <Button
            color="secondary"
            className="m-1"
            onClick={this.state.onCloseModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditInstructionModal;
