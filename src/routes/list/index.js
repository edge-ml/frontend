import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import CreateNewDatasetModal from '../../components/CreateNewDatasetModal/CreateNewDatasetModal';
import NotificationContext from '../../components/NotificationHandler/NotificationProvider';
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

const ListPage = (props) => {
  const [modal, setModal] = useState(false);
  const [datasets, setDatasets] = useState(undefined);
  const [datasetsToDelete, setDatasetsToDelete] = useState([]);
  const [ready, setReady] = useState(false);
  const [isCreateNewDatasetOpen, setIsCreateNewDatasetOpen] = useState(false);
  const [labelings, setLabelings] = useState(undefined);

  const { registerDownload } = useContext(NotificationContext);

  const toggleModal = () => {
    setModal(!modal);
    setDatasetsToDelete(modal ? [] : datasetsToDelete);
  };

  const deleteDatasets = () => {
    console.log('Delete datasets');
    deleteDatasets(datasetsToDelete)
      .then(() => {
        setModal(false);
        setDatasets(
          datasets.filter(
            (dataset) => !datasetsToDelete.includes(dataset['_id'])
          )
        );
        setDatasetsToDelete([]);
      })
      .catch((err) => {
        window.alert('Error deleting datasets');
        setModal(false);
      });
  };

  const deleteEntry = (datasetId) => {
    setDatasetsToDelete([datasetId]);
    openDeleteModal();
  };

  const toggleCreateNewDatasetModal = () => {
    setIsCreateNewDatasetOpen(!isCreateNewDatasetOpen);
  };

  const openDeleteModal = () => {
    if (datasetsToDelete.length > 0) {
      toggleModal();
    }
  };

  const selectAllEmpty = () => {
    setDatasetsToDelete(
      datasets
        .filter((elm) => Math.max(elm.end - elm.start, 0) === 0)
        .map((elm) => elm._id)
    );
  };

  const selectAll = () => {
    setDatasetsToDelete(datasets.map((elm) => elm._id));
  };

  const deselectAll = () => {
    setDatasetsToDelete([]);
  };

  useEffect(() => {
    Promise.all([
      getDatasets(),
      subscribeLabelingsAndLabels().then((labelings) => {
        setLabelings(labelings);
      }),
    ])
      .then(([datasets, _]) => {
        onDatasetsChanged(datasets);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const onDatasetsChanged = async (datasets) => {
    const labelings = await subscribeLabelingsAndLabels();
    console.log(datasets);
    if (!datasets) return;
    setDatasets(datasets);
    setLabelings(labelings);
    setModal(false);
    setReady(true);
    setIsCreateNewDatasetOpen(false);
  };

  const toggleCheck = (e, datasetId) => {
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
  };

  const downloadAllDatasets = async () => {
    registerDownload(datasets);
  };

  if (!ready) {
    return <Loader loading={!ready} />;
  }

  return (
    <div id="dataList">
      <Container style={{ padding: 0 }}>
        <DataUpload
          toggleCreateNewDatasetModal={toggleCreateNewDatasetModal}
        ></DataUpload>
        <DatasetTable
          datasets={datasets}
          datasetsToDelete={datasetsToDelete}
          openDeleteModal={openDeleteModal}
          selectAllEmpty={selectAllEmpty}
          downloadAllDatasets={downloadAllDatasets}
          toggleCheck={toggleCheck}
          labelings={labelings}
          deleteEntry={deleteEntry}
          selectAll={selectAll}
          deselectAll={deselectAll}
        ></DatasetTable>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} className={props.className}>
        <ModalHeader toggle={toggleModal}>Delete Dataset</ModalHeader>
        <ModalBody>
          Are you sure to delete the following datasets?
          {datasetsToDelete.map((id) => {
            const dataset = datasets.find((elm) => elm._id === id);
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
            onClick={deleteDatasets}
          >
            Yes
          </Button>{' '}
          <Button outline color="secondary" onClick={toggleModal}>
            No
          </Button>
        </ModalFooter>
      </Modal>
      <CreateNewDatasetModal
        isOpen={isCreateNewDatasetOpen}
        onCloseModal={toggleCreateNewDatasetModal}
        onDatasetComplete={onDatasetsChanged}
      />
    </div>
  );
};

export default ListPage;
