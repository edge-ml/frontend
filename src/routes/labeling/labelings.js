import React, { Component } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import Loader from '../../modules/loader';
import EditLabelingModal from '../../components/EditLabelingModal/EditLabelingModal';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import {
  updateLabelingandLabels,
  subscribeLabelingsAndLabels,
  addLabeling,
  deleteLabeling,
  deleteLabelTypesFromLabeling,
  addLabelTypesToLabeling,
  deleteMultipleLabelings,
} from '../../services/ApiServices/LabelingServices';
import LabelingTable from './LabelingTable';
import ConfirmationDialogueModal from '../../components/EditLabelingModal/ConfirmationDialogueModal';

class LabelingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelings: [],
      labels: [],
      isReady: false,
      datasets: undefined,
      labelingsToDelete: [],
      modal: {
        labeling: undefined,
        labels: undefined,
        isOpen: false,
        isNewLabeling: false,
      },
      confirmationDialogueModal: {
        isOpen: false,
        onConfirm: undefined,
        onCancel: undefined,
        confirmString: '',
        title: '',
      },
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.onModalAddLabeling = this.onModalAddLabeling.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onLabelingsLabelsDatasetsChanged =
      this.onLabelingsLabelsDatasetsChanged.bind(this);
    this.resetURL = this.resetURL.bind(this);
    this.initComponent = this.initComponent.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
    this.selectAllEmpty = this.selectAllEmpty.bind(this);

    this.onClickCancelDeleteLabeling =
      this.onClickCancelDeleteLabeling.bind(this);
    this.onClickConfirmlDeleteLabelings =
      this.onClickConfirmlDeleteLabelings.bind(this);
    this.onClickDeleteLabelingIcon = this.onClickDeleteLabelingIcon.bind(this);
    this.resetConfirmationDialogueModalState =
      this.resetConfirmationDialogueModalState.bind(this);
  }

  componentDidMount() {
    this.initComponent();
  }

  initComponent() {
    Promise.all([getDatasets(), subscribeLabelingsAndLabels()]).then(
      (result) => {
        this.onLabelingsLabelsDatasetsChanged(
          result[1].labelings,
          result[1].labels,
          result[0]
        );
        if (this.props.location.pathname.includes('/labelings/new')) {
          this.onModalAddLabeling();
        } else {
          const searchParams = new URLSearchParams(this.props.location.search);
          const id = searchParams.get('id');

          if (id) {
            let labeling = this.state.labelings.filter(
              (labeling) => labeling['_id'] === id
            )[0];
            let labels = this.state.labels.filter((label) =>
              labeling.labels.includes(label['_id'])
            );
            this.toggleModal(labeling, labels, false);
          }
        }
      }
    );
  }

  onLabelingsLabelsDatasetsChanged(labelings, labels, datasets) {
    if (labelings === undefined) labelings = this.state.labelings;
    if (datasets === undefined) datasets = this.state.datasets;
    if (labels === undefined) labels = this.state.labels;
    this.setState({
      labelings: labelings,
      labels: labels,
      datasets: datasets,
      isReady: true,
    });
  }

  toggleModal(labeling, labels, isNewLabeling) {
    if (isNewLabeling) {
      if (!this.props.history.location.pathname.includes('labelings/new')) {
        this.props.history.replace({
          pathname: this.props.history.location.pathname + '/new',
          search: null,
        });
      }
    } else {
      const pName = this.props.history.location.pathname
        .split('/')
        .splice(-1, 1)
        .join('/');
      this.props.history.replace({
        pathname: pName,
        search: '?id=' + labeling['_id'],
      });
    }

    this.setState({
      modal: {
        labeling: this.state.modal.isOpen ? undefined : labeling,
        labels: this.state.modal.isOpen ? undefined : labels,
        isOpen: true,
        isNewLabeling: isNewLabeling,
      },
    });
  }

  onModalAddLabeling() {
    this.toggleModal(
      {
        name: '',
        labels: [],
      },
      [],
      true
    );
  }

  onCloseModal() {
    this.resetURL();

    this.setState({
      modal: {
        labeling: undefined,
        labels: undefined,
        isOpen: false,
        isNewLabeling: false,
      },
    });
  }

  onClickDeleteLabelingIcon(id) {
    if (this.state.datasets.length > 0) {
      let labelConflict = false;
      let conflictingDatasetNames = [];
      let conflictingDatasetIds = [];
      this.state.datasets.forEach((dset) => {
        if (dset.labelings.some((l) => l.labelingId === id)) {
          labelConflict = true;
          conflictingDatasetNames.push(dset.name);
          conflictingDatasetIds.push(dset._id);
        }
      });

      const confirmString =
        `You are about to delete a labeling set that is used in the following dataset(s): ` +
        conflictingDatasetNames.join(', ') +
        `. \nDo you want to proceed? If you choose \"Confirm\", this labeling set, ` +
        `inlcuding all its labels, will be deleted from the corresponding dataset(s).`;

      if (labelConflict) {
        //label conflict and user chose to delete labels. Deletes them in the backend too.
        this.setState({
          confirmationDialogueModal: {
            isOpen: true,
            onConfirm: () => this.onClickConfirmlDeleteLabelings([id]),
            onCancel: this.onClickCancelDeleteLabeling,
            confirmString: confirmString,
            title: 'Confirm Labeling Set Deletion',
          },
        });
      } else {
        //No labeling conflict, just ask for permissions to delete
        this.setState({
          confirmationDialogueModal: {
            isOpen: true,
            onConfirm: () => this.onClickConfirmlDeleteLabelings([id]),
            onCancel: this.onClickCancelDeleteLabeling,
            confirmString: 'Are you sure to delete this labeling?',
            title: 'Confirm Labeling Set Deletion',
          },
        });
      }
    } else {
      //No labeling conflict, just ask for permissions to delete
      this.setState({
        confirmationDialogueModal: {
          isOpen: true,
          onConfirm: () => this.onClickConfirmlDeleteLabelings([id]),
          onCancel: this.onClickCancelDeleteLabeling,
          confirmString: 'Are you sure to delete this labeling?',
          title: 'Confirm Labeling Set Deletion',
        },
      });
    }
  }

  onClickConfirmlDeleteLabelings(labelingIds) {
    deleteMultipleLabelings(labelingIds).then((result) => {
      this.onLabelingsLabelsDatasetsChanged(result.labelings, result.labels);
    });
    this.resetConfirmationDialogueModalState();
    this.setState({
      labelingsToDelete: this.state.labelingsToDelete.filter(
        (id) => !labelingIds.include(id)
      ),
    });
  }

  onClickCancelDeleteLabeling() {
    this.resetConfirmationDialogueModalState();
  }

  resetConfirmationDialogueModalState() {
    this.setState({
      confirmationDialogueModal: {
        isOpen: false,
        onConfirm: undefined,
        onCancel: undefined,
        confirmString: '',
        title: '',
      },
    });
  }

  onDeleteLabeling(labelingId, conflictingDatasetIds) {
    this.onCloseModal();
    deleteLabeling(labelingId, conflictingDatasetIds).then((result) =>
      this.onLabelingsLabelsDatasetsChanged(result.labelings, result.labels)
    );
  }

  async onSave(labeling, labels, deletedLabels) {
    deletedLabels = deletedLabels.map((elm) => elm._id);
    if (!labeling || !labels) return;

    if (labeling.updated || labels.some((elm) => elm.updated)) {
      const result = await updateLabelingandLabels(labeling, labels);
      this.onLabelingsLabelsDatasetsChanged(result.labelings, result.labels);
    }

    if (this.state.modal.isNewLabeling) {
      addLabeling({ ...labeling, labels: labels }).then((result) =>
        this.onLabelingsLabelsDatasetsChanged(result.labelings, result.labels)
      );
    } else {
      //add new labels to labeling/delete labels from labeling
      addLabelTypesToLabeling(labeling, labels).then((result) => {
        if (deletedLabels !== []) {
          deleteLabelTypesFromLabeling(labeling, deletedLabels).then(
            (newResult) =>
              this.onLabelingsLabelsDatasetsChanged(
                newResult.labelings,
                newResult.labels
              )
          );
        } else {
          this.onLabelingsLabelsDatasetsChanged(result.labeling, result.labels);
        }
      });
    }

    this.onCloseModal();
  }

  resetURL() {
    const newPath = this.props.history.location.pathname.split('/');
    if (newPath[newPath.length - 1].toLowerCase() !== 'labelings') {
      newPath.pop();
    }
    this.props.history.replace({ pathname: newPath.join('/'), search: null });
  }

  onClickEdit = (labeling) => {
    this.toggleModal(
      labeling,
      this.state.labels.filter((label) =>
        labeling.labels.includes(label['_id'])
      ),
      false
    );
  };

  selectAll() {
    this.setState({
      labelingsToDelete: this.state.labelings.map((elm) => elm._id),
    });
  }

  deselectAll() {
    this.setState({ labelingsToDelete: [] });
  }

  toggleCheck(e, labelingId) {
    const checked = this.state.labelingsToDelete.includes(labelingId);
    if (!checked) {
      if (!this.state.labelingsToDelete.includes(labelingId)) {
        this.setState({
          labelingsToDelete: [...this.state.labelingsToDelete, labelingId],
        });
      }
    } else {
      this.setState({
        labelingsToDelete: this.state.labelingsToDelete.filter(
          (id) => id !== labelingId
        ),
      });
    }
  }

  selectAllEmpty() {
    this.setState({
      labelingsToDelete: this.state.labelings
        .filter((elm) => elm.labels.length === 0)
        .map((elm) => elm._id),
    });
  }

  render() {
    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <div className="mt-3">
            <LabelingTable
              labelings={this.state.labelings}
              onClickEdit={this.onClickEdit}
              labels={this.state.labels}
              onModalAddLabeling={this.onModalAddLabeling}
              labelingsToDelete={this.state.labelingsToDelete}
              toggleCheck={this.toggleCheck}
              selectAll={this.selectAll}
              deselectAll={this.deselectAll}
              selectAllEmpty={this.selectAllEmpty}
              onClickDeleteLabelingIcon={this.onClickDeleteLabelingIcon}
            />
          </div>
        </Container>
        {this.state.modal.isOpen ? (
          <EditLabelingModal
            datasets={this.state.datasets}
            labeling={this.state.modal.labeling}
            labelings={this.state.labelings}
            labels={this.state.modal.labels}
            isOpen={this.state.modal.isOpen}
            onCloseModal={this.onCloseModal}
            onDeleteLabeling={this.onDeleteLabeling}
            onSave={this.onSave}
            isNewLabeling={this.state.modal.isNewLabeling}
          />
        ) : null}
        {this.state.confirmationDialogueModal.isOpen ? (
          <ConfirmationDialogueModal
            isOpen={this.state.confirmationDialogueModal.isOpen}
            title={this.state.confirmationDialogueModal.title}
            confirmString={this.state.confirmationDialogueModal.confirmString}
            onCancel={this.state.confirmationDialogueModal.onCancel}
            onConfirm={this.state.confirmationDialogueModal.onConfirm}
          />
        ) : null}
      </Loader>
    );
  }
}

export default LabelingsPage;
