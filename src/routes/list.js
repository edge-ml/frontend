import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Table,
  Input,
  Button,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import { view } from 'react-easy-state';

import State from '../state';
import Loader from '../modules/loader';

import {
  subscribeDatasets,
  unsubscribeDatasets,
  deleteDatasets
} from '../services/SocketService';

class ListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      ready: false,
      datasets: [],
      datasetsToDelete: [],
      loading: true
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.deleteDatasets = this.deleteDatasets.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
  }

  componentDidMount() {
    subscribeDatasets(this.onDatasetsChanged);
  }

  componentWillUnmount() {
    unsubscribeDatasets();
  }

  onDatasetsChanged(datasets) {
    if (!datasets) return;

    this.setState({
      modalID: null,
      modal: false,
      rows: this.state.rows,
      datasets: datasets,
      ready: true
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

  openDeleteModal() {
    if (this.state.datasetsToDelete.length > 0) {
      this.toggleModal();
    } else {
      window.alert('Choose datasets to delete.');
    }
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  deleteDatasets() {
    if (this.state.datasetsToDelete.length === 0) {
      this.toggleModal();
      return;
    }

    deleteDatasets(this.state.datasetsToDelete, err => {
      if (err) {
        window.alert(err);
        this.setState({
          modal: false
        });
      } else {
        this.setState({
          modal: false,
          datasets: this.state.datasets.filter(
            dataset => !this.state.datasetsToDelete.includes(dataset['_id'])
          ),
          datasetsToDelete: []
        });
      }
    });
  }

  displayTime(time) {
    const date = new Date(time);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  }

  render() {
    return (
      <Loader loading={!this.state.ready}>
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
                block
                className="mb-5"
                color="danger"
                outline
                onClick={this.openDeleteModal}
              >
                Delete
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
            <Button outline color="danger" onClick={this.deleteDatasets}>
              Yes
            </Button>{' '}
            <Button outline color="secondary" onClick={this.toggleModal}>
              No
            </Button>
          </ModalFooter>
        </Modal>
      </Loader>
    );
  }
}

export default view(ListPage);
