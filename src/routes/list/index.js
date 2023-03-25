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
import { downloadDatasets } from '../../services/DatasetService';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import { downloadAllAsZip } from '../../services/DatasetService';
import DatasetTable from './DatasetTable';
import DataUpload from './DataUpload';
import { UploadDatasetModal } from '../../components/UploadDatasetModal/UploadDatasetModal';

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
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.deleteDatasets = this.deleteDatasets.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.toggleCreateNewDatasetModal =
      this.toggleCreateNewDatasetModal.bind(this);
    this.downloadAllDatasets = this.downloadAllDatasets.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.selectAllEmpty = this.selectAllEmpty.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
  }

  componentDidMount() {
    Promise.all([
      getDatasets(),
      subscribeLabelingsAndLabels().then((labelings) => {
        this.setState({
          labelings: labelings,
        });
      }),
    ]).then(([datasets, _]) => {
      this.onDatasetsChanged(datasets);
    });
  }

  async downloadAllDatasets() {
    await downloadDatasets(this.state.datasets.map((elm) => elm._id));
  }

  selectAllEmpty() {
    this.setState({
      datasetsToDelete: this.state.datasets
        .filter((elm) => Math.max(elm.end - elm.start, 0) === 0)
        .map((elm) => elm._id),
    });
  }

  selectAll() {
    this.setState({
      datasetsToDelete: this.state.datasets.map((elm) => elm._id),
    });
  }

  deselectAll() {
    this.setState({
      datasetsToDelete: [],
    });
  }

  async onDatasetsChanged(datasets) {
    if (!datasets) return;
    try {
      const labelingData = await subscribeLabelingsAndLabels();
      this.setState({
        modalID: null,
        modal: false,
        ready: true,
        datasets: datasets,
        isCreateNewDatasetOpen: false,
        labelings: labelingData.labelings,
        labels: labelingData.labels,
      });
    } catch (e) {
      console.log(e);
    }
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
    console.log('Delete datasets');
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

  deleteEntry(datasetId) {
    this.setState(
      {
        datasetsToDelete: [datasetId],
      },
      () => this.openDeleteModal()
    );
  }

  render() {
    if (!this.state.ready) {
      return <Loader loading={!this.state.ready}></Loader>;
    }
    return (
      <div id="dataList">
        <Container style={{ padding: 0 }}>
          <DataUpload
            toggleCreateNewDatasetModal={this.toggleCreateNewDatasetModal}
          ></DataUpload>
          <DatasetTable
            datasets={this.state.datasets}
            datasetsToDelete={this.state.datasetsToDelete}
            openDeleteModal={this.openDeleteModal}
            selectAllEmpty={this.selectAllEmpty}
            downloadAllDatasets={this.downloadAllDatasets}
            toggleCheck={this.toggleCheck}
            labelings={this.state.labelings}
            deleteEntry={this.deleteEntry}
            selectAll={this.selectAll}
            deselectAll={this.deselectAll}
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
        <UploadDatasetModal
          isOpen={this.state.isCreateNewDatasetOpen}
          onCloseModal={this.toggleCreateNewDatasetModal}
          onDatasetComplete={this.onDatasetsChanged}
        />
      </div>
    );
  }
}

export default ListPage;
