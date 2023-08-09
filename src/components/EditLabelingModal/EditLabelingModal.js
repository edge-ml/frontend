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
  FormFeedback,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import {
  isValidColor,
  hexToForegroundColor,
  generateRandomColor,
} from '../../services/ColorService';
import ConfirmationDialogueModal from '../ConfirmationDilaogueModal/ConfirmationDialogueModal';
import EmptyLabelingSetFeedBack from './EmptyLabelingSetFeedBack';

import './EditLabelingModal.css';

class EditLabelingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datasets: props.datasets,
      // clone labeling to not alter underlying data until user confirms
      labeling: this.cloneLabeling(props.labeling),
      isOpen: props.isOpen,
      onSave: props.onSave,
      onDeleteLabeling: props.onDeleteLabeling,
      isNewLabeling: props.isNewLabeling,
      deletedLabels: [],
      allowSaving: false,
      showConfirmationDialogueLabeling: false,
      showConfirmationDialogueLabels: false,
      confirmString: '',
      conflictingDatasetIdsForLabelingDeletion: [],
    };

    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.onAddLabel = this.onAddLabel.bind(this);
    this.onDeleteLabel = this.onDeleteLabel.bind(this);
    this.onLabelingNameChanged = this.onLabelingNameChanged.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.onLabelNameChanged = this.onLabelNameChanged.bind(this);
    this.onLabelColorChanged = this.onLabelColorChanged.bind(this);
    this.onClickingSave = this.onClickingSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.labelNameInvalid = this.labelNameInvalid.bind(this);
    this.checkAllowSaving = this.checkAllowSaving.bind(this);
    this.labelingNameInValid = this.labelingNameInValid.bind(this);
    this.labelsNamesDouble = this.labelsNamesDouble.bind(this);
    this.renderLabelingEditModal = this.renderLabelingEditModal.bind(this);
    this.onConfirmDeletionLabeling = this.onConfirmDeletionLabeling.bind(this);
    this.onCancelDeletionLabeling = this.onCancelDeletionLabeling.bind(this);
    this.onConfirmDeletionLabels = this.onConfirmDeletionLabels.bind(this);
    this.onCancelDeletionLabels = this.onCancelDeletionLabels.bind(this);
    this.getConfirmStringLabels = this.getConfirmStringLabels.bind(this);
    this.saveDisabled = this.saveDisabled.bind(this);
    this.cloneLabeling = this.cloneLabeling.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPressed, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPressed, false);
  }

  labelNameInvalid(label, labelIdx) {
    return this.state.labeling.labels.some(
      (elm, idx) =>
        elm.name === label.name && idx !== labelIdx && label.name !== ''
    );
  }

  cloneLabeling(labeling) {
    return JSON.parse(JSON.stringify(labeling));
  }

  onKeyPressed(e) {
    if (
      !this.state.showConfirmationDialogueLabeling &&
      !this.state.showConfirmationDialogueLabels
    ) {
      switch (e.key) {
        case 'Escape':
          this.props.onCloseModal();
          break;
        case 'Enter':
          if (!this.saveDisabled()) {
            this.onClickingSave();
          }
          break;
        case 'Delete':
          this.onDeleteLabeling(this.state.labeling['_id']);
      }
    }
  }

  getConfirmStringLabels(conflictingLabels) {
    let count = 1;
    const conflictDatasets = Object.keys(conflictingLabels).map((key) => {
      const labelItems = conflictingLabels[key].labels.map((label) => {
        return <div key={label._id}>{' ' + label.name}</div>;
      });
      return (
        <div key={key}>
          <strong>
            {count++}. {conflictingLabels[key].datasetName}
          </strong>
          {labelItems}
        </div>
      );
    });
    return (
      <div>
        <div>
          {
            'You are about to delete the labels that are used in the following dataset(s):'
          }
        </div>
        {conflictDatasets}
        <br />
        <div>
          {
            'Do you want to proceed? If you choose "Confirm", all these labels will be deleted from the dataset(s).'
          }
        </div>
      </div>
    );
  }

  onClickingSave() {
    let conflictingLabels = {};
    let labelConflict = false;
    this.state.datasets.forEach((dset) => {
      let labels = [];
      this.state.deletedLabels.forEach((delLabel) => {
        dset.labelings.forEach((l) => {
          //check if dataset contains label from state.deletedLabels
          //delLabel contains an unique identifier corresponding to the type in the dataset label
          const found = l.labels.find((e) => e.type === delLabel['_id']);
          if (found) {
            const label = this.state.deletedLabels.find(
              (elm) => elm._id === found.type
            );
            labels.push(label);
            labelConflict = true;
          }
        });
      });
      //if conflicting labels found, store their name, to ask user for confirmation
      if (labels.length > 0) {
        conflictingLabels[dset._id] = {
          datasetName: dset.name,
          labels: labels,
        };
      }
    });
    const confirmString = this.getConfirmStringLabels(conflictingLabels);

    if (labelConflict) {
      this.setState({
        showConfirmationDialogueLabels: true,
        confirmString: confirmString,
      });
    } else {
      //no conflicts, just save
      this.state.onSave(this.state.labeling);
    }
  }

  onCancelDeletionLabeling() {
    this.setState({
      showConfirmationDialogueLabeling: false,
      conflictingDatasetIdsForLabelingDeletion: [],
    });
  }

  onConfirmDeletionLabeling() {
    //label conflict and user chose to delete labels. Deletes them in the backend too.
    this.props.onDeleteLabeling(
      this.state.labeling['_id'],
      this.state.conflictingDatasetIdsForLabelingDeletion
    );
  }

  onCancelDeletionLabels() {
    //label conflict, but user chose not to delete them. Restore all "deletedLabels";
    this.setState({
      labeling: this.cloneLabeling(this.props.labeling),
      deletedLabels: [],
      confirmString: '',
      showConfirmationDialogueLabels: false,
    });
  }

  onConfirmDeletionLabels() {
    //label conflict and user chose to delete labels. Deletes them in the backend as well.
    this.state.onSave(this.state.labeling);
  }

  onDatasetsChanged(datasets) {
    if (!datasets) return;
    this.setState({
      datasets: datasets,
    });
  }

  onLabelingNameChanged(name) {
    if (this.state.isNewLabeling) {
      this.setState({
        labeling: Object.assign({}, this.state.labeling, { name }),
      });
    } else {
      this.setState({
        labeling: Object.assign({}, this.state.labeling, {
          name,
          updated: true,
        }),
      });
    }
  }

  onAddLabel() {
    let newLabel = {
      name: '',
      color: generateRandomColor(),
      isNewLabel: true,
    };
    const oldLabeling = this.state.labeling;
    oldLabeling.labels.push(newLabel);
    this.setState({
      labeling: oldLabeling,
    });
  }

  onDeleteLabeling(id) {
    let labelConflict = false;
    let conflictingDatasetNames = [];
    let conflictingDatasetIds = [];
    let labeling = this.state.labeling;
    this.state.datasets.forEach((dset) => {
      if (dset.labelings.some((l) => l.labelingId === labeling['_id'])) {
        labelConflict = true;
        conflictingDatasetNames.push(dset.name);
        conflictingDatasetIds.push(dset._id);
      }
    });

    const confirmString = this.props.getConfirmStringLabelingSet(
      conflictingDatasetNames
    );
    if (labelConflict) {
      //label conflict and user chose to delete labels. Deletes them in the backend too.
      this.setState({
        showConfirmationDialogueLabeling: true,
        conflictingDatasetIdsForLabelingDeletion: conflictingDatasetIds,
        confirmString: confirmString,
      });
    } else {
      //No labeling conflict, just ask for permissions to delete
      this.setState({
        showConfirmationDialogueLabeling: true,
        conflictingDatasetIdsForLabelingDeletion: [],
        confirmString: 'Are you sure to delete this labeling set?',
      });
    }
  }

  onDeleteLabel(index) {
    const labeling = this.state.labeling;
    const deletedLabel = this.state.labeling.labels[index];
    labeling.labels.splice(index, 1);
    console.log(this.state.labeling.labels);
    console.log(index);

    this.setState((prevState) => ({
      labeling: labeling,
      deletedLabels: [...prevState.deletedLabels, deletedLabel],
    }));
  }

  onLabelNameChanged(index, name) {
    const labeling = this.state.labeling;
    labeling.labels[index].name = name;
    this.setState({
      labeling: labeling,
    });
  }

  onLabelColorChanged(index, color) {
    //if (color === undefined || color.length > 6) return;

    const labeling = this.state.labeling;
    labeling.labels[index].color = color;
    this.setState({
      labeling: labeling,
    });
  }

  checkAllowSaving() {
    return (
      this.state.labeling.labels &&
      this.state.labeling &&
      this.state.labeling.labels.every((elm) => elm.name !== '') &&
      this.state.labeling.name !== '' &&
      this.state.labeling.labels.length !== 0
    );
  }

  labelingNameInValid() {
    return (
      this.state.labeling &&
      this.props.labelings.some(
        (elm) =>
          elm.name === this.state.labeling.name &&
          elm._id != this.state.labeling._id
      )
    );
  }

  labelsNamesDouble() {
    return !this.state.labeling.labels
      ? false
      : new Set(this.state.labeling.labels.map((elm) => elm.name)).size !==
          this.state.labeling.labels.length;
  }

  saveDisabled() {
    return (
      !this.checkAllowSaving() ||
      this.labelingNameInValid() ||
      this.labelsNamesDouble()
    );
  }

  renderLabelingEditModal() {
    return (
      <Modal isOpen={this.state.isOpen}>
        <ModalHeader>
          {this.state.labeling && this.state.labeling['_id']
            ? 'Edit Labeling Set'
            : 'Add Labeling Set'}
        </ModalHeader>
        <ModalBody>
          <div className="d-flex flex-row align-items-center">
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Labeling Set</InputGroupText>
              </InputGroupAddon>
              <Input
                invalid={this.labelingNameInValid()}
                id="labelingName"
                placeholder="Name"
                value={
                  this.state.labeling && this.state.labeling.name
                    ? this.state.labeling.name
                    : ''
                }
                onChange={(e) => this.onLabelingNameChanged(e.target.value)}
              />
              <FormFeedback
                id="labelingNameFeedback"
                style={
                  this.labelingNameInValid()
                    ? { display: 'flex', justifyContent: 'right' }
                    : null
                }
              >
                The same name already exists
              </FormFeedback>
            </InputGroup>
            <div className="d-flex flex-row ml-2">
              {this.state.labeling && !this.state.isNewLabeling ? (
                <div>
                  <Button
                    id="buttonDeleteLabeling"
                    color="danger"
                    className="m-0"
                    outline
                    onClick={(e) => {
                      this.onDeleteLabeling(this.state.labeling['_id']);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          <hr />
          {this.state.labeling.labels
            ? this.state.labeling.labels.map((label, index) => (
                <InputGroup key={'label' + index}>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>Label</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    invalid={this.labelNameInvalid(label, index)}
                    id={'labelName' + index}
                    placeholder="Name"
                    value={label.name}
                    onChange={(e) =>
                      this.onLabelNameChanged(index, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>Color</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    id={'labelColor' + index}
                    placeholder="Color"
                    className={
                      isValidColor(label.color)
                        ? 'input-group-append is-valid'
                        : 'input-group-append clear is-invalid'
                    }
                    style={{
                      backgroundColor: isValidColor(label.color)
                        ? label.color
                        : 'white',
                      borderColor: isValidColor(label.color)
                        ? label.color
                        : null,
                      color: hexToForegroundColor(label.color),
                    }}
                    value={label.color}
                    onChange={(e) =>
                      this.onLabelColorChanged(index, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      id={'buttonDeleteLabel' + index}
                      className="m-0 no-border-radius"
                      color="danger"
                      outline
                      onClick={(e) => {
                        this.onDeleteLabel(index);
                      }}
                    >
                      ✕
                    </Button>
                  </InputGroupAddon>
                  <FormFeedback id="labelFeedback">
                    {!isValidColor(label.color)
                      ? 'Invalid color'
                      : 'Duplicate names are not allowed'}
                  </FormFeedback>
                </InputGroup>
              ))
            : null}
          <Button
            id="buttonAddLabel"
            className="m-0"
            color="secondary"
            outline
            block
            onClick={this.onAddLabel}
          >
            + Add Label
          </Button>
          <EmptyLabelingSetFeedBack
            isLabelingSetEmpty={this.state.labeling.labels.length === 0}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            outline
            id="buttonClose"
            color="secondary"
            className="m-1 mr-auto"
            onClick={this.props.onCloseModal}
          >
            Cancel
          </Button>
          <Button
            outline
            id="buttonSaveLabeling"
            color="primary"
            className="m-1"
            onClick={this.onClickingSave}
            disabled={this.saveDisabled()}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  renderConfirmationDialogueLabeling() {
    return (
      <ConfirmationDialogueModal
        onCancel={this.onCancelDeletionLabeling}
        onConfirm={this.onConfirmDeletionLabeling}
        confirmString={this.state.confirmString}
        title={'Confirm Labeling Set Deletion'}
        isOpen={this.props.isOpen}
      />
    );
  }

  renderConfirmationDialogueLabels() {
    return (
      <ConfirmationDialogueModal
        onCancel={this.onCancelDeletionLabels}
        onConfirm={this.onConfirmDeletionLabels}
        confirmString={this.state.confirmString}
        title={'Confirm Label Deletion'}
        isOpen={this.props.isOpen}
      />
    );
  }

  render() {
    if (this.state.showConfirmationDialogueLabeling) {
      return this.renderConfirmationDialogueLabeling();
    } else if (this.state.showConfirmationDialogueLabels) {
      return this.renderConfirmationDialogueLabels();
    } else {
      return this.renderLabelingEditModal();
    }
  }
}
export default EditLabelingModal;
