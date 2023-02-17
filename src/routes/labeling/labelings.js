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
} from '../../services/ApiServices/LabelingServices';
import LabelingTable from './LabelingTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class LabelingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelings: [],
      isReady: false,
      datasets: undefined,
      modal: {
        labeling: undefined,
        isOpen: false,
        isNewLabeling: false,
      },
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.onModalAddLabeling = this.onModalAddLabeling.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onContentChanged = this.onContentChanged.bind(this);
    this.resetURL = this.resetURL.bind(this);
    this.initComponent = this.initComponent.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
  }

  componentDidMount() {
    this.initComponent();
  }

  initComponent() {
    Promise.all([getDatasets(), subscribeLabelingsAndLabels()]).then(
      (result) => {
        this.onContentChanged(
          result[1], // labelings,
          result[0] // datasets
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
            let labels = labeling.labels;
            this.toggleModal(labeling, labels, false);
          }
        }
      }
    );
  }

  onContentChanged(labelings, datasets) {
    labelings = labelings || this.state.labelings;
    datasets = datasets || this.state.datasets;
    this.setState({
      labelings: labelings,
      datasets: datasets,
      isReady: true,
    });
  }

  toggleModal(labeling, isNewLabeling) {
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
    console.log(labeling);
    this.setState({
      modal: {
        labeling: labeling,
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

  onDeleteLabeling(labelingId, conflictingDatasetIds) {
    this.onCloseModal();
    deleteLabeling(labelingId, conflictingDatasetIds).then((labelings) => {
      this.onContentChanged(labelings);
      console.log(labelings);
    });
  }

  async onSave(labeling) {
    var newLabeling = undefined;
    if (this.state.modal.isNewLabeling) {
      newLabeling = await addLabeling(labeling);
    } else {
      newLabeling = await updateLabelingandLabels(labeling);
    }
    this.onContentChanged(newLabeling);
    this.onCloseModal();
  }

  // async onSave(labeling, labels, deletedLabels) {
  //   deletedLabels = deletedLabels.map((elm) => elm._id);
  //   if (!labeling || !labels) return;

  //   if (labeling.updated || labels.some((elm) => elm.updated)) {
  //     const labelings = await updateLabelingandLabels(labeling, labels);
  //     this.onContentChanged(labelings);
  //   }

  //   if (this.state.modal.isNewLabeling) {
  //     addLabeling({ ...labeling, labels: labels }).then((labelings) =>
  //       this.onContentChanged(labelings)
  //     );
  //   } else {
  //     //add new labels to labeling/delete labels from labeling
  //     addLabelTypesToLabeling(labeling, labels).then((result) => {
  //       if (deletedLabels !== []) {
  //         deleteLabelTypesFromLabeling(labeling, deletedLabels).then(
  //           (newResult) =>
  //             this.onContentChanged(
  //               newResult.labelings,
  //               newResult.labels
  //             )
  //         );
  //       } else {
  //         this.onContentChanged(result.labeling, result.labels);
  //       }
  //     });
  //   }

  //   this.onCloseModal();
  // }

  resetURL() {
    const newPath = this.props.history.location.pathname.split('/');
    if (newPath[newPath.length - 1].toLowerCase() !== 'labelings') {
      newPath.pop();
    }
    this.props.history.replace({ pathname: newPath.join('/'), search: null });
  }

  onClickEdit = (labeling) => {
    this.toggleModal(labeling, labeling.labels, false);
  };

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
            />
          </div>
        </Container>
        <EditLabelingModal
          datasets={this.state.datasets}
          labeling={this.state.modal.labeling}
          labelings={this.state.labelings}
          isOpen={this.state.modal.isOpen}
          onCloseModal={this.onCloseModal}
          onDeleteLabeling={this.onDeleteLabeling}
          onSave={this.onSave}
          isNewLabeling={this.state.modal.isNewLabeling}
        />
      </Loader>
    );
  }
}

export default LabelingsPage;
