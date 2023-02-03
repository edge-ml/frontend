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
      labels: [],
      isReady: false,
      datasets: undefined,
      modal: {
        labeling: undefined,
        labels: undefined,
        isOpen: false,
        isNewLabeling: false,
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
  onLabelingsAndLabelsChanged;
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

  render() {
    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <Row className="mt-3">
            <Col>
              <LabelingTable
                labelings={this.state.labelings}
                onClickEdit={this.onClickEdit}
                labels={this.state.labels}
              />
              <Button
                id="buttonAddLabeling"
                className="rounded-circle"
                size="lg"
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  right: '2rem',
                }}
                color="primary"
                onClick={this.onModalAddLabeling}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Col>
          </Row>
        </Container>
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
      </Loader>
    );
  }
}

export default LabelingsPage;
