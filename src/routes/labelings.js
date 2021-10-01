import React, { Component } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import Loader from '../modules/loader';
import EditLabelingModal from '../components/EditLabelingModal/EditLabelingModal';
import {
  updateLabelingAndLabels,
  updateLabeling,
  subscribeLabelingsAndLabels,
  addLabeling,
  deleteLabeling,
  deleteLabelTypesFromLabeling,
  addLabelTypesToLabeling,
  updateLabels
} from '../services/ApiServices/LabelingServices';

class LabelingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelings: [],
      labels: [],
      isReady: false,
      modal: {
        labeling: undefined,
        labels: undefined,
        isOpen: false,
        isNewLabeling: false
      }
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.onModalAddLabeling = this.onModalAddLabeling.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onLabelingsAndLabelsChanged = this.onLabelingsAndLabelsChanged.bind(
      this
    );
    this.resetURL = this.resetURL.bind(this);
    this.initComponent = this.initComponent.bind(this);
  }

  componentDidMount() {
    this.initComponent();
  }

  initComponent() {
    subscribeLabelingsAndLabels().then(result => {
      this.onLabelingsAndLabelsChanged(result.labelings, result.labels);
      if (this.props.location.pathname.includes('/labelings/new')) {
        this.onModalAddLabeling();
      } else {
        const searchParams = new URLSearchParams(this.props.location.search);
        const id = searchParams.get('id');

        if (id) {
          let labeling = this.state.labelings.filter(
            labeling => labeling['_id'] === id
          )[0];
          let labels = this.state.labels.filter(label =>
            labeling.labels.includes(label['_id'])
          );
          this.toggleModal(labeling, labels, false);
        }
      }
    });
  }

  onLabelingsAndLabelsChanged(labelings, labels) {
    if (labelings === undefined) labelings = this.state.labelings;

    if (labels === undefined) labels = this.state.labels;
    this.setState({ labelings: labelings, labels: labels, isReady: true });
  }

  toggleModal(labeling, labels, isNewLabeling) {
    if (isNewLabeling) {
      if (!this.props.history.location.pathname.includes('labelings/new')) {
        this.props.history.replace({
          pathname: this.props.history.location.pathname + '/new',
          search: null
        });
      }
    } else {
      const pName = this.props.history.location.pathname
        .split('/')
        .splice(-1, 1)
        .join('/');
      this.props.history.replace({
        pathname: pName,
        search: '?id=' + labeling['_id']
      });
    }

    this.setState({
      modal: {
        labeling: this.state.modal.isOpen ? undefined : labeling,
        labels: this.state.modal.isOpen ? undefined : labels,
        isOpen: true,
        isNewLabeling: isNewLabeling
      }
    });
  }

  onModalAddLabeling() {
    this.toggleModal(
      {
        name: '',
        labels: []
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
        isNewLabeling: false
      }
    });
  }

  onDeleteLabeling(labelingId, conflictingDatasetIds) {
    this.onCloseModal();
    deleteLabeling(labelingId, conflictingDatasetIds).then(result =>
      this.onLabelingsAndLabelsChanged(result.labelings, result.labels)
    );
  }

  async onSave(labeling, labels, deletedLabels) {
    if (!labeling || !labels) return;

    if (labeling.updated) {
      const result = await updateLabeling(labeling);
      this.onLabelingsAndLabelsChanged(result.labelings, result.labels);
    }

    if (this.state.modal.isNewLabeling) {
      addLabeling({ ...labeling, labels: labels }).then(result =>
        this.onLabelingsAndLabelsChanged(result.labelings, result.labels)
      );
    } else {
      //add new labels to labeling/delete labels from labeling
      addLabelTypesToLabeling(labeling, labels).then(result => {
        if (deletedLabels !== []) {
          deleteLabelTypesFromLabeling(
            labeling,
            deletedLabels
          ).then(newResult =>
            this.onLabelingsAndLabelsChanged(
              newResult.labelings,
              newResult.labels
            )
          );
        } else {
          this.onLabelingsAndLabelsChanged(result.labeling, result.labels);
        }
      });
    }

    const updatedLabels = labels.filter(l => l.updated);
    if (updateLabeling.length > 0) {
      const result = await updateLabels(updatedLabels);
      this.onLabelingsAndLabelsChanged(result.labelings, result.labels);
    }

    this.onCloseModal();
  }

  resetURL() {
    const newPath = this.props.history.location.pathname.split('/');
    if (newPath[newPath.length - 1] !== 'labelings') {
      newPath.pop();
    }
    this.props.history.replace({ pathname: newPath.join('/'), search: null });
  }

  render() {
    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <Row className="mt-3">
            <Col>
              <Table responsive>
                <thead>
                  <tr className={'bg-light'}>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Labels</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.labelings.map((labeling, index) => (
                    <tr key={index}>
                      <th className="labelings-column" scope="row">
                        {labeling['_id']}{' '}
                      </th>
                      <td
                        className={
                          labeling.name !== ''
                            ? 'labelings-column'
                            : 'labelings-column font-italic'
                        }
                      >
                        {labeling.name !== '' ? labeling.name : 'Untitled'}{' '}
                      </td>
                      <td className="labelings-column">
                        {labeling.labels.map((labelId, index) => {
                          let label = this.state.labels.filter(
                            label => label['_id'] === labelId
                          )[0];
                          if (!label) return null;
                          return (
                            <Badge
                              key={index}
                              className={
                                label.name === ''
                                  ? 'm-1 font-italic font-weight-normal'
                                  : 'm-1'
                              }
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name !== '' ? label.name : 'Untitled'}{' '}
                            </Badge>
                          );
                        })}{' '}
                      </td>
                      <td>
                        <Button
                          id="buttonEditLabeling"
                          className="btn-secondary mt-0 btn-edit"
                          block
                          onClick={e => {
                            this.toggleModal(
                              labeling,
                              this.state.labels.filter(label =>
                                labeling.labels.includes(label['_id'])
                              ),
                              false
                            );
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button
                id="buttonAddLabeling"
                block
                className="mb-5"
                color="secondary"
                outline
                onClick={this.onModalAddLabeling}
              >
                + Add Labeling Set
              </Button>
            </Col>
          </Row>
        </Container>
        <EditLabelingModal
          labeling={this.state.modal.labeling}
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
