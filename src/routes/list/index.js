import React, { Component } from 'react';
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import CreateNewDatasetModal from '../../components/CreateNewDatasetModal/CreateNewDatasetModal';

import Loader from '../../modules/loader';

import './index.css';

import {
  getDatasets,
  deleteDatasets,
} from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { downloadAllAsZip } from '../../services/DatasetService';
import DatasetTable from './DatasetTable';
import DataUpload from './DataUpload';

class ListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      datasets: undefined,
      datasetsToDelete: [],
      ready: false,
      CreateNewDatasetToggle: false,
      labelings: undefined,
      label: undefined,
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.deleteDatasets = this.deleteDatasets.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.onUploadFromCode = this.onUploadFromCode.bind(this);
    this.toggleCreateNewDatasetModal =
      this.toggleCreateNewDatasetModal.bind(this);
    this.onUploadBLE = this.onUploadBLE.bind(this);
    this.downloadAllDatasets = this.downloadAllDatasets.bind(this);
    this.deleteAllEmptyDatasets = this.deleteAllEmptyDatasets.bind(this);
  }

  componentDidMount() {
    Promise.all([
      getDatasets(),
      subscribeLabelingsAndLabels().then((labelingdata) => {
        this.setState({
          labelings: labelingdata.labelings,
          labels: labelingdata.labels,
        });
      }),
    ]).then(([datasets, _]) => {
      this.onDatasetsChanged(datasets);
    });
  }

  async downloadAllDatasets() {
    const { labelings, labels } = await subscribeLabelingsAndLabels();
    downloadAllAsZip(this.state.datasets, labelings, labels);
  }

  deleteAllEmptyDatasets() {
    this.setState(
      {
        datasetsToDelete: this.state.datasets
          .filter((elm) => elm.end === 0)
          .map((elm) => elm._id),
      },
      () => this.toggleModal()
    );
  }

  onDatasetsChanged(datasets) {
    if (!datasets) return;
    this.setState({
      modalID: null,
      modal: false,
      ready: true,
      datasets: datasets,
      isCreateNewDatasetOpen: false,
    });
  }

  onUploadBLE() {
    this.props.history.push('./ble');
  }

  onUploadFromCode() {
    this.props.history.push('./settings/getCode');
  }

  toggleCheck(e, datasetId) {
    const checked = this.state.datasetsToDelete.includes(datasetId);
    if (!checked) {
      if (!this.state.datasetsToDelete.includes(datasetId)) {
        this.setState({
          datasetsToDelete: [...this.state.datasetsToDelete, datasetId],
        });
      }
    } else {
      this.setState({
        datasetsToDelete: this.state.datasetsToDelete.filter(
          (id) => id !== datasetId
        ),
      });
    }
  }

  toggleCreateNewDatasetModal() {
    this.setState({
      isCreateNewDatasetOpen: !this.state.isCreateNewDatasetOpen,
    });
  }

  openDeleteModal() {
    if (this.state.datasetsToDelete.length > 0) {
      this.toggleModal();
    }
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal,
      datasetsToDelete: this.state.modal ? [] : this.state.datasetsToDelete,
    });
  }

  deleteDatasets() {
    deleteDatasets(this.state.datasetsToDelete)
      .then(() => {
        this.setState({
          modal: false,
          datasets: this.state.datasets.filter(
            (dataset) => !this.state.datasetsToDelete.includes(dataset['_id'])
          ),
          datasetsToDelete: [],
        });
      })
      .catch((err) => {
        window.alert('Error deleting datasets');
        this.setState({
          modal: false,
        });
      });
  }

  render() {
    if (!this.state.ready) {
      return <Loader loading={!this.state.ready}></Loader>;
    }
    return (
      <div id="dataList">
        <Container style={{ margin: '5px' }}>
          <DataUpload></DataUpload>
          <DatasetTable
            datasets={this.state.datasets}
            datasetsToDelete={this.state.datasetsToDelete}
            openDeleteModal={this.openDeleteModal}
            deleteAllEmptyDatasets={this.deleteAllEmptyDatasets}
            downloadAllDatasets={this.downloadAllDatasets}
            toggleCheck={this.toggleCheck}
            labelings={this.state.labelings}
            labels={this.state.labels}
          ></DatasetTable>
        </Container>

        <Modal
          isOpen={this.state.modal}
          toggle={this.toggleModal}
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggleModal}>Delete Dataset</ModalHeader>
          <ModalBody>
            Are you sure to delete the following datasets?
            {this.state.datasetsToDelete.map((id) => {
              const dataset = this.state.datasets.find((elm) => elm._id === id);
              return (
                <React.Fragment key={id}>
                  <br />
                  <b>{dataset.name}</b>
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