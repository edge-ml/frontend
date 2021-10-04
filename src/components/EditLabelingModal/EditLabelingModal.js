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
  FormFeedback
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { getDatasets } from '../../services/ApiServices/DatasetServices';
import {
  isValidColor,
  hexToForegroundColor,
  generateRandomColor
} from '../../services/ColorService';

import './EditLabelingModal.css';

class EditLabelingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labeling: props.labeling,
      labels: props.labels,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteLabeling: props.onDeleteLabeling,
      isNewLabeling: props.isNewLabeling,
      deletedLabels: [],
      allowSaving: false,
      datasets: undefined
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
  }

  componentWillReceiveProps(props) {
    this.setState(
      {
        labeling: props.labeling,
        labels: props.labels,
        isOpen: props.isOpen,
        onCloseModal: props.onCloseModal,
        onSave: props.onSave,
        onDeleteLabeling: props.onDeleteLabeling,
        isNewLabeling: props.isNewLabeling,
        allowSaving: false
      },
      () => {
        if (
          typeof this.state !== 'undefined' &&
          typeof this.state.labels !== 'undefined' &&
          typeof this.state.labeling !== 'undefined'
        ) {
          this.checkAllowSaving();
        }
      }
    );
  }

  componentDidMount() {
    getDatasets()
      .then(this.onDatasetsChanged)
      .catch(err => {
        window.alert('Could not receive datasets from server');
      });
  }

  //separate onCloseModal required, to restore labelings deleted when "cancel" is clicked
  onCloseModal() {
    if (this.state.deletedLabels.length > 0) {
      let labels = [...this.state.labels, ...this.state.deletedLabels];
      let labeling = this.state.labeling;
      labeling.labels = [
        ...labeling.labels,
        ...this.state.deletedLabels.map(e => e['_id'])
      ];

      this.setState({
        labels: labels,
        labeling: labeling,
        deletedLabels: []
      });
    }
    this.state.onCloseModal();
  }

  onClickingSave() {
    if (this.state.deletedLabels.length > 0 && this.state.datasets.length > 0) {
      let conflictingLabels = {};
      let labelConflict = false;
      this.state.datasets.forEach(dset => {
        let labels = [];
        this.state.deletedLabels.forEach(delLabel => {
          dset.labelings.forEach(l => {
            //check if dataset contains label from state.deletedLabels
            //delLabel contains an unique identifier corresponding to the type in the dataset label
            const found = l.labels.find(e => e.type === delLabel['_id']);
            if (typeof found !== 'undefined') {
              labels.push(found.name);
              labelConflict = true;
            }
          });
        });
        //if conflicting labels found, store their name, to ask user for confirmation
        if (labels.length > 0) {
          conflictingLabels[dset.name] = labels;
        }
      });

      const conflictingLabelsString = JSON.stringify(conflictingLabels)
        .replace(/["'{}\[\]]/g, '')
        .replace(/[,]/g, ', ')
        .replace(/[:]/g, ': ');
      const confirmString =
        'You are about to delete the labels that are used in the following dataset(s): ' +
        conflictingLabelsString +
        '. \nDo you want to proceed? If you choose "Ok", all these labels will be deleted from the dataset(s).';

      if (labelConflict && window.confirm(confirmString)) {
        //TODO label conflict and user chose to delete labels. Delete them in backend too.
        this.state.onSave(
          this.state.labeling,
          this.state.labels,
          this.state.deletedLabels
        );
      } else if (labelConflict) {
        //label conflict, but user chose not to delete them. Restore all "deletedLabels"
        let labels = [...this.state.labels, ...this.state.deletedLabels];
        let labeling = this.state.labeling;
        labeling.labels = [
          ...labeling.labels,
          ...this.state.deletedLabels.map(e => e['_id'])
        ];

        this.setState({
          labels: labels,
          labeling: labeling,
          deletedLabels: []
        });
      } else {
        //no conflicts, just save
        this.state.onSave(
          this.state.labeling,
          this.state.labels,
          this.state.deletedLabels
        );
      }
    } else {
      this.state.onSave(
        this.state.labeling,
        this.state.labels,
        this.state.deletedLabels
      );
    }
  }

  onDatasetsChanged(datasets) {
    if (!datasets) return;
    this.setState({
      datasets: datasets
    });
  }

  onLabelingNameChanged(name) {
    if (this.state.isNewLabeling) {
      this.setState(
        {
          labeling: Object.assign({}, this.state.labeling, { name })
        },
        () => {
          this.checkAllowSaving();
        }
      );
    } else {
      this.setState(
        {
          labeling: Object.assign({}, this.state.labeling, {
            name,
            updated: true
          })
        },
        () => {
          this.checkAllowSaving();
        }
      );
    }
  }

  onAddLabel() {
    let newLabel = {
      name: '',
      color: generateRandomColor(),
      isNewLabel: true
    };

    this.setState(
      {
        labels: [...this.state.labels, newLabel]
      },
      () => {
        this.checkAllowSaving();
      }
    );
  }

  onDeleteLabeling(id) {
    if (this.state.datasets.length > 0) {
      let labelConflict = false;
      let conflictingDatasetNames = [];
      let conflictingDatasetIds = [];
      let labeling = this.state.labeling;
      this.state.datasets.forEach(dset => {
        if (dset.labelings.some(l => l.labelingId === labeling['_id'])) {
          labelConflict = true;
          conflictingDatasetNames.push(dset.name);
          conflictingDatasetIds.push(dset._id);
        }
      });

      const confirmString =
        `You are about to delete a labeling set that is used in the following dataset(s): ` +
        conflictingDatasetNames.join(', ') +
        `. \nDo you want to proceed? If you choose \"Ok\", this labeling set, ` +
        `inlcuding all its labels, will be deleted from the corresponding dataset(s).`;
      if (labelConflict && window.confirm(confirmString)) {
        //TODO
        //label conflict and user chose to delete labels. Delete them in Backend too.
        this.props.onDeleteLabeling(id, conflictingDatasetIds);
      } else if (labelConflict) {
        //Do nothing, user aborted the delete
      } else {
        //No labeling conflict, just ask for permissions to delete
        if (window.confirm('Are you sure to delete this labeling?')) {
          this.props.onDeleteLabeling(id, []);
        }
      }
    } else {
      if (window.confirm('Are you sure to delete this labeling?')) {
        this.props.onDeleteLabeling(id, []);
      }
    }
  }

  onDeleteLabel(labelToDelete) {
    let labels = this.state.labels.filter(label => label !== labelToDelete);
    let labeling = this.state.labeling;
    labeling.labels = labeling.labels.filter(
      label => label !== labelToDelete['_id']
    );

    if (labelToDelete.isNewLabel) {
      this.setState({ labels, labeling }, () => {
        this.checkAllowSaving();
      });
    } else {
      this.setState(
        {
          labels,
          labeling,
          deletedLabels: [...this.state.deletedLabels, labelToDelete]
        },
        () => {
          this.checkAllowSaving();
        }
      );
    }
  }

  onLabelNameChanged(labelToChange, name) {
    if (labelToChange.isNewLabel) {
      this.setState(
        {
          labels: this.state.labels.map(label =>
            label !== labelToChange ? label : Object.assign({}, label, { name })
          )
        },
        () => {
          this.checkAllowSaving();
        }
      );
    } else {
      this.setState(
        {
          labels: this.state.labels.map(label =>
            label !== labelToChange
              ? label
              : Object.assign({}, label, { name, updated: true })
          )
        },
        () => {
          this.checkAllowSaving();
        }
      );
    }
  }

  onLabelColorChanged(labelToChange, color) {
    if (color === undefined || color.length > 6) return;

    if (labelToChange.isNewLabel) {
      this.setState({
        labels: this.state.labels.map(label =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { color: '#' + color })
        )
      });
    } else {
      this.setState({
        labels: this.state.labels.map(label =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { color: '#' + color, updated: true })
        )
      });
    }
  }

  checkAllowSaving() {
    let allowSaving = false;

    for (let i = 0; i < this.state.labels.length; i++) {
      if (this.state.labels[i].name === '') {
        allowSaving = false;
        break;
      } else {
        allowSaving = true;
      }
    }
    this.setState({
      allowSaving: allowSaving && this.state.labeling.name !== ''
    });
  }

  render() {
    const labelingNameInValid =
      this.state.labeling &&
      this.props.labelings.some(elm => elm.name === this.state.labeling.name);

    return (
      <Modal isOpen={this.state.isOpen}>
        <ModalHeader>
          {this.state.labeling && this.state.labeling['_id']
            ? this.state.labeling['_id']
            : 'Add Labeling Set'}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Labeling Set</InputGroupText>
            </InputGroupAddon>
            <Input
              invalid={labelingNameInValid}
              id="labelingName"
              placeholder="Name"
              value={
                this.state.labeling && this.state.labeling.name
                  ? this.state.labeling.name
                  : ''
              }
              onChange={e => this.onLabelingNameChanged(e.target.value)}
            />
            <FormFeedback
              style={
                labelingNameInValid
                  ? { display: 'flex', justifyContent: 'right' }
                  : null
              }
            >
              The same name already exists
            </FormFeedback>
          </InputGroup>
          <hr />
          {this.state.labels
            ? this.state.labels.map((label, index) => (
                <InputGroup key={'label' + index}>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      {!label.isNewLabel && (
                        <React.Fragment>
                          <FontAwesomeIcon
                            id={'label' + label['_id']}
                            style={{ color: '#8b8d8f' }}
                            icon={faInfoCircle}
                            className="mr-2 fa-s"
                          />
                          <UncontrolledTooltip
                            placement="top-start"
                            target={'label' + label['_id']}
                          >
                            <b>LabelID:</b> {label['_id']}
                          </UncontrolledTooltip>
                        </React.Fragment>
                      )}
                      Label
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    id={'labelName' + index}
                    placeholder="Name"
                    value={label.name}
                    onChange={e =>
                      this.onLabelNameChanged(label, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>Color</InputGroupText>
                  </InputGroupAddon>
                  <Input
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
                      color: hexToForegroundColor(label.color)
                    }}
                    value={label.color.split('#')[1]}
                    onChange={e =>
                      this.onLabelColorChanged(label, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      className="m-0"
                      color="danger"
                      outline
                      onClick={e => {
                        this.onDeleteLabel(label);
                      }}
                    >
                      ✕
                    </Button>
                  </InputGroupAddon>
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
          {this.state.labeling && !this.state.isNewLabeling ? (
            <div>
              <hr />
              <Button
                id="buttonDeleteLabeling"
                color="danger"
                block
                className="m-0"
                outline
                onClick={e => {
                  this.onDeleteLabeling(this.state.labeling['_id']);
                }}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            id="buttonSaveLabeling"
            color="primary"
            className="m-1 mr-auto"
            onClick={this.onClickingSave}
            disabled={!this.state.allowSaving || labelingNameInValid}
          >
            Save
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditLabelingModal;
