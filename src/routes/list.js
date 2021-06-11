import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Table,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import CreateNewDatasetModal from '../components/CreateNewDatasetModal/CreateNewDatasetModal';

import Loader from '../modules/loader';

import {
  getDatasets,
  deleteDatasets
} from '../services/ApiServices/DatasetServices';

class ListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      datasets: undefined,
      datasetsToDelete: [],
      ready: false,
      CreateNewDatasetToggle: false
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.deleteDatasets = this.deleteDatasets.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.toggleCreateNewDatasetModal = this.toggleCreateNewDatasetModal.bind(
      this
    );
  }

  componentDidMount() {
    getDatasets()
      .then(this.onDatasetsChanged)
      .catch(err => {
        window.alert('Could not receive datasets from server');
      });
  }

  onDatasetsChanged(datasets) {
    if (!datasets) return;
    this.setState({
      modalID: null,
      modal: false,
      datasets: datasets,
      ready: true,
      isCreateNewDatasetOpen: false
    });
  }

  toggleCheck(e, datasetId) {
    let checked = e.target.checked;

    if (checked) {
      if (!this.state.datasetsToDelete.includes(datasetId)) {
        this.setState({
          datasetsToDelete: [...this.state.datasetsToDelete, datasetId]
        });
      }
    } else {
      this.setState({
        datasetsToDelete: this.state.datasetsToDelete.filter(
          id => id !== datasetId
        )
      });
    }
  }

  toggleCreateNewDatasetModal() {
    this.setState({
      isCreateNewDatasetOpen: !this.state.isCreateNewDatasetOpen
    });
  }

  openDeleteModal() {
    if (this.state.datasetsToDelete.length > 0) {
      this.toggleModal();
    }
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  deleteDatasets() {
    deleteDatasets(this.state.datasetsToDelete)
      .then(() => {
        this.setState({
          modal: false,
          datasets: this.state.datasets.filter(
            dataset => !this.state.datasetsToDelete.includes(dataset['_id'])
          ),
          datasetsToDelete: []
        });
      })
      .catch(err => {
        window.alert('Error deleting datasets');
        this.setState({
          modal: false
        });
      });
  }

  displayTime(time) {
    const date = new Date(time);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  }

  render() {
    if (!this.state.ready) {
      return <Loader loading={!this.state.ready}></Loader>;
    }
    return (
      <div id="dataList">
        <Container>
          <Row className="mt-3">
            <Col>
              <Table responsive>
                <thead>
                  <tr className="bg-light">
                    <th />
                    <th>ID</th>
                    <th>Start Time</th>
                    <th>User ID</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.datasets.map((dataset, index) => {
                    return (
                      <tr key={index}>
                        <td className="datasets-column">
                          <Input
                            className="datasets-check"
                            type="checkbox"
                            checked={this.state.datasetsToDelete.includes(
                              dataset['_id']
                            )}
                            onChange={e => this.toggleCheck(e, dataset['_id'])}
                          />
                        </td>
                        <th className="datasets-column">{dataset['_id']}</th>
                        <td className="datasets-column">
                          {this.displayTime(dataset.start)}
                        </td>
                        <td className="datasets-column">{dataset.userId}</td>
                        <td className="datasets-column">
                          <Button
                            id="buttonViewDatasets"
                            block
                            className="btn-secondary mt-0 btn-edit"
                            onClick={e => {
                              this.props.history.push({
                                pathname: `datasets/${dataset['_id']}`,
                                state: { dataset }
                              });
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Button
                id="deleteDatasetsButton"
                block
                className="mb-5"
                color="danger"
                outline
                disabled={this.state.datasetsToDelete.length === 0}
                onClick={this.openDeleteModal}
              >
                Delete
              </Button>
              <Button
                id="buttonCreateDatasets"
                block
                className="mb-5"
                color="secondary"
                outline
                onClick={this.toggleCreateNewDatasetModal}
              >
                + Add
              </Button>
            </Col>
          </Row>
        </Container>

        <Modal
          isOpen={this.state.modal}
          toggle={this.toggleModal}
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggleModal}>Delete Dataset</ModalHeader>
          <ModalBody>
            Are you sure to delete the following datasets?
            {this.state.datasetsToDelete.map(id => {
              return (
                <React.Fragment key={id}>
                  <br />
                  <b>{id}</b>
                </React.Fragment>
              );
            })}
          </ModalBody>
          <ModalFooter>
            <Button
              id="deleteDatasetsButtonFinal"
              outline
              color="danger"
              onClick={this.deleteDatasets}
            >
              Yes
            </Button>{' '}
            <Button outline color="secondary" onClick={this.toggleModal}>
              No
            </Button>
          </ModalFooter>
        </Modal>
        <CreateNewDatasetModal
          isOpen={this.state.isCreateNewDatasetOpen}
          onCloseModal={this.toggleCreateNewDatasetModal}
          onDatasetComplete={this.onDatasetsChanged}
        />
      </div>
    );
  }
}

export default ListPage;
