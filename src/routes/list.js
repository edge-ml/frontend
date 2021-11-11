import {
  faCode,
  faFile,
  faMicrochip,
  faWifi
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    this.onUploadFromCode = this.onUploadFromCode.bind(this);
    this.toggleCreateNewDatasetModal = this.toggleCreateNewDatasetModal.bind(
      this
    );
    this.onUploadBLE = this.onUploadBLE.bind(this);
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

  onUploadBLE() {
    this.props.history.push('./ble');
  }

  onUploadFromCode() {
    this.props.history.push('./settings/getCode');
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
              <div
                className="card d-flex flex-row mb-4"
                style={{ display: 'flex' }}
              >
                <div className="card-body d-flex flex-column text-left">
                  <div className="mb-3">
                    <b>Data Upload</b>
                  </div>
                  <div className="d-flex flex-row align-items-stretch">
                    <div
                      className="d-flex flex-row justify-content-center align-items-start mr-5"
                      style={{ flex: '1 1 0px' }}
                    >
                      <FontAwesomeIcon
                        className="mr-3 mt-1"
                        icon={faMicrochip}
                        style={{ fontSize: 'x-large' }}
                      ></FontAwesomeIcon>
                      <div className="d-flex flex-column justify-content-between h-100">
                        <div className="d-flex flex-column">
                          <div>
                            <small>
                              <b>Direct Connect</b>
                            </small>
                          </div>
                          <small>
                            If you own a{' '}
                            <a
                              href="https://docs.arduino.cc/tutorials/nicla-sense-me/cheat-sheet"
                              target="_blank"
                            >
                              Bosch Arduino Nicle Sense ME
                            </a>{' '}
                            you can connect to it directly from your browser
                            using WebBLE. Simply download the source code as
                            .zip from{' '}
                            <a
                              href="https://github.com/edge-ml/nicla-sense-me-fw/releases/latest"
                              target="_blank"
                            >
                              nicla-sense-me-fw
                            </a>{' '}
                            and import it as a library to the Arduino IDE, then
                            flash File/Examples/Arduino_BHY2/App onto the Nicla
                            Sense ME.
                          </small>
                        </div>

                        <Button
                          id="buttonUploadFromBle"
                          block
                          className="mt-2"
                          color="success"
                          outline
                          onClick={this.onUploadBLE}
                          style={{ padding: '0px' }}
                        >
                          <small>Connect to Bluetooth Device</small>
                        </Button>
                      </div>
                    </div>
                    <div
                      className="d-flex flex-row justify-content-center align-items-start mr-5"
                      style={{ flex: '1 1 0px' }}
                    >
                      <FontAwesomeIcon
                        className="mr-3 mt-1"
                        icon={faFile}
                        style={{ fontSize: 'x-large' }}
                      ></FontAwesomeIcon>
                      <div className="d-flex flex-column justify-content-between h-100">
                        <div className="d-flex flex-column">
                          <div>
                            <small>
                              <b>File Upload</b>
                            </small>
                          </div>
                          <small>
                            If you have already collected data you can upload it
                            to edge-ml by following our{' '}
                            <a
                              href="/example_file.csv"
                              download="example_file.csv"
                            >
                              pre-defined CSV format
                            </a>
                            . You can also upload pre-labeled data.
                          </small>
                        </div>
                        <Button
                          id="buttonCreateDatasets"
                          className="mt-2"
                          color="success"
                          outline
                          onClick={this.toggleCreateNewDatasetModal}
                          style={{ padding: '0px' }}
                        >
                          <small>Upload CSV Files</small>
                        </Button>
                      </div>
                    </div>
                    <div
                      className="d-flex flex-row justify-content-center align-items-start"
                      style={{ flex: '1 1 0px' }}
                    >
                      <FontAwesomeIcon
                        className="mr-3 mt-1"
                        icon={faCode}
                        style={{ fontSize: 'x-large' }}
                      ></FontAwesomeIcon>
                      <div className="d-flex flex-column justify-content-between h-100">
                        <div className="d-flex flex-column">
                          <div>
                            <small>
                              <b>Library Upload</b>
                            </small>
                          </div>
                          <small>
                            If you have built a custom device and would like to
                            upload data from it directly to edge-ml you can use
                            our dedicated libraries for{' '}
                            <a href="https://github.com/edge-ml/arduino">
                              Arduino&nbsp;(ESP32)
                            </a>
                            ,{' '}
                            <a href="https://github.com/edge-ml/node">
                              node.js
                            </a>
                            , and{' '}
                            <a href="https://github.com/edge-ml/java">
                              Java&nbsp;(Android)
                            </a>
                            .
                          </small>
                        </div>
                        <Button
                          id="buttonUploadFromCode"
                          block
                          className="mt-2"
                          color="success"
                          outline
                          onClick={this.onUploadFromCode}
                          style={{ padding: '0px' }}
                        >
                          <small>Generate Code for my Device</small>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Table responsive>
                <thead>
                  <tr className="bg-light">
                    <th>
                      {' '}
                      <Button
                        id="deleteDatasetsButton"
                        size="sm"
                        color="danger"
                        outline
                        disabled={this.state.datasetsToDelete.length === 0}
                        onClick={this.openDeleteModal}
                      >
                        Delete
                      </Button>
                    </th>
                    <th>Name</th>
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
                        <th className="datasets-column">{dataset.name}</th>
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
              {this.state.datasets.length === 0 ? (
                <div className="w-100 text-center text-secondary">
                  No data collected.
                </div>
              ) : null}
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
