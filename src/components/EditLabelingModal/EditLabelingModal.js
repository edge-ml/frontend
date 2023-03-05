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
  UncontrolledTooltip,
  FormFeedback,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faTrashAlt,
  faPen,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

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
      labeling: props.labeling,
      labels: props.labels,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
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
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onAddLabel = this.onAddLabel.bind(this);
    this.onDeleteLabel = this.onDeleteLabel.bind(this);
    this.onLabelingNameChanged = this.onLabelingNameChanged.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.onLabelNameChanged = this.onLabelNameChanged.bind(this);
    this.onLabelColorChanged = this.onLabelColorChanged.bind(this);
    this.onClickingSave = this.onClickingSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
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
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      this.setState({
        datasets: this.props.datasets,
        labeling: this.props.labeling,
        labels: this.props.labels,
        isOpen: this.props.isOpen,
        onCloseModal: this.props.onCloseModal,
        onSave: this.props.onSave,
        onDeleteLabeling: this.props.onDeleteLabeling,
        isNewLabeling: this.props.isNewLabeling,
        confirmationString: '',
      });
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPressed, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPressed, false);
  }

  labelNameInvalid(label, labelIdx) {
    return this.state.labels.some(
      (elm, idx) =>
        elm.name === label.name && idx !== labelIdx && label.name !== ''
    );
  }

  onKeyPressed(e) {
    if (
      !this.state.showConfirmationDialogueLabeling &&
      !this.state.showConfirmationDialogueLabels
    ) {
      switch (e.code) {
        case 'Escape':
          this.onCloseModal();
          break;
        case 'Enter':
          this.onClickingSave();
          break;
        case 'Delete':
          this.onDeleteLabeling(this.state.labeling['_id']);
      }
    }
  }

  //separate onCloseModal required, to restore labelings deleted when "cancel" is clicked
  onCloseModal() {
    if (this.state.deletedLabels.length > 0) {
      let labels = [...this.state.labels, ...this.state.deletedLabels];
      let labeling = this.state.labeling;
      labeling.labels = [
        ...labeling.labels,
        ...this.state.deletedLabels.map((e) => e['_id']),
      ];

      this.setState({
        labels: labels,
        labeling: labeling,
        deletedLabels: [],
      });
    }
    this.state.onCloseModal();
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
            const label = this.props.labels.find(
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
      this.state.onSave(
        this.state.labeling,
        this.state.labels,
        this.state.deletedLabels
      );
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
    //label conflict, but user chose not to delete them. Restore all "deletedLabels"
    let labels = [...this.state.labels, ...this.state.deletedLabels];
    let labeling = this.state.labeling;
    labeling.labels = [
      ...labeling.labels,
      ...this.state.deletedLabels.map((e) => e['_id']),
    ];

    this.setState({
      labels: labels,
      labeling: labeling,
      deletedLabels: [],
      confirmString: '',
      showConfirmationDialogueLabels: false,
    });
  }

  onConfirmDeletionLabels() {
    //label conflict and user chose to delete labels. Deletes them in the backend as well.
    this.state.onSave(
      this.state.labeling,
      this.state.labels,
      this.state.deletedLabels
    );
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

    this.setState({
      labels: [...this.state.labels, newLabel],
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

  onDeleteLabel(labelToDelete) {
    let labels = this.state.labels.filter((label) => label !== labelToDelete);
    let labeling = this.state.labeling;
    labeling.labels = labeling.labels.filter(
      (label) => label !== labelToDelete['_id']
    );

    if (labelToDelete.isNewLabel) {
      this.setState({
        labels,
        labeling,
      });
    } else {
      this.setState({
        labels,
        labeling,
        deletedLabels: [...this.state.deletedLabels, labelToDelete],
      });
    }
  }

  onLabelNameChanged(labelToChange, name) {
    if (labelToChange.isNewLabel) {
      this.setState({
        labels: this.state.labels.map((label) =>
          label !== labelToChange ? label : Object.assign({}, label, { name })
        ),
      });
    } else {
      this.setState({
        labels: this.state.labels.map((label) =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { name, updated: true })
        ),
      });
    }
  }

  onLabelColorChanged(labelToChange, color) {
    if (color === undefined || color.length > 6) return;

    if (labelToChange.isNewLabel) {
      this.setState({
        labels: this.state.labels.map((label) =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { color: '#' + color })
        ),
      });
    } else {
      this.setState({
        labels: this.state.labels.map((label) =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { color: '#' + color, updated: true })
        ),
      });
    }
  }

  checkAllowSaving() {
    return (
      this.state.labels &&
      this.state.labeling &&
      this.state.labels.every((elm) => elm.name !== '') &&
      this.state.labeling.name !== '' &&
      this.state.labels.length !== 0
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
    return !this.state.labels
      ? false
      : new Set(this.state.labels.map((elm) => elm.name)).size !==
          this.state.labels.length;
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
          {this.state.labels
            ? this.state.labels.map((label, index) => (
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
                      this.onLabelNameChanged(label, e.target.value)
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
                    value={label.color.split('#')[1]}
                    onChange={(e) =>
                      this.onLabelColorChanged(label, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      id={'buttonDeleteLabel' + index}
                      className="m-0 no-border-radius"
                      color="danger"
                      outline
                      onClick={(e) => {
                        this.onDeleteLabel(label);
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
            isLabelingSetEmpty={this.state.labels.length === 0}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            id="buttonClose"
            color="secondary"
            className="m-1 mr-auto"
            onClick={this.onCloseModal}
          >
            Cancel
          </Button>
          <Button
            id="buttonSaveLabeling"
            color="primary"
            className="m-1"
            onClick={this.onClickingSave}
            disabled={
              !this.checkAllowSaving() ||
              this.labelingNameInValid() ||
              this.labelsNamesDouble()
            }
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
