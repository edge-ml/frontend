import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import NotificationContext from '../../components/NotificationHandler/NotificationProvider';
import Loader from '../../modules/loader';

import './index.css';

import {
  getDatasets,
  deleteDatasets,
} from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import DatasetTable from './DatasetTable';
import DataUpload from './DataUpload';
import { UploadDatasetModal } from '../../components/UploadDatasetModal/UploadDatasetModal';
import PageSelection from './PageSelection';

const ListPage = (props) => {
  const [modal, setModal] = useState(false);
  const [datasets, setDatasets] = useState(undefined);
  const [datasetsToDelete, setDatasetsToDelete] = useState([]);
  const [ready, setReady] = useState(false);
  const [isCreateNewDatasetOpen, setIsCreateNewDatasetOpen] = useState(false);
  const [labelings, setLabelings] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [displayedDatasets, setDisplayedDatasets] = useState([]);
  const pageSize = 10;
  const { registerProjectDownload } = useContext(NotificationContext);
  //needed to access newest state in key event handler
  const datasetsRef = React.useRef(datasets);
  const currentPageRef = React.useRef(currentPage);

  const toggleModal = () => {
    setModal(!modal);
  };

  const deleteSelectedDatasets = () => {
    deleteDatasets(datasetsToDelete)
      .then(() => {
        setModal(false);
        setDatasetsToDelete([]);
        setDatasets(
          datasets.filter(
            (dataset) => !datasetsToDelete.includes(dataset['_id'])
          )
        );
      })
      .catch((err) => {
        window.alert('Error deleting datasets');
        setModal(false);
      });
  };

  const deleteEntry = (datasetId) => {
    setDatasetsToDelete([datasetId]);
    toggleModal();
  };

  const toggleCreateNewDatasetModal = () => {
    setIsCreateNewDatasetOpen(!isCreateNewDatasetOpen);
  };

  const selectAllEmpty = () => {
    setDatasetsToDelete(
      datasets
        .filter((elm) =>
          elm.timeSeries
            .map((x) => x.length)
            .every((y) => y === 0 || y === null)
        )
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

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    datasetsRef.current = datasets;
    setCurrentPage(0);
    if (datasets) {
      setDisplayedDatasets(
        datasets.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
      );
    }
  }, [datasets]);

  useEffect(() => {
    currentPageRef.current = currentPage;
    if (datasets) {
      setDisplayedDatasets(
        datasets.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
      );
    }
  }, [currentPage]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        console.log('left');
        goToPreviousPage();
        break;
      case 'ArrowRight':
        console.log('right');
        goToNextPage();
        break;
      default:
        break;
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (
      currentPageRef.current <
      Math.ceil(datasetsRef.current.length / pageSize) - 1
    ) {
      setCurrentPage(currentPageRef.current + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageRef.current > 0) {
      setCurrentPage(currentPageRef.current - 1);
    }
  };

  const goToLastPage = () => {
    setCurrentPage(Math.ceil(datasetsRef.current.length / pageSize) - 1);
  };

  const gotToFirstPage = () => {
    setCurrentPage(0);
  };

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

  const refreshList = () => {
    subscribeLabelingsAndLabels().then((labelings) => setLabelings(labelings));
    getDatasets().then((datasets) => setDatasets(datasets));
  };

  const toggleCheck = (e, datasetId) => {
    const checked = datasetsToDelete.includes(datasetId);
    if (!checked) {
      if (!datasetsToDelete.includes(datasetId)) {
        setDatasetsToDelete([...datasetsToDelete, datasetId]);
      }
    } else {
      setDatasetsToDelete(datasetsToDelete.filter((id) => id !== datasetId));
    }
  };

  const downloadAllDatasets = async () => {
    registerProjectDownload();
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
          displayedDatasets={displayedDatasets}
          datasetsToDelete={datasetsToDelete}
          openDeleteModal={toggleModal}
          selectAllEmpty={selectAllEmpty}
          downloadAllDatasets={downloadAllDatasets}
          toggleCheck={toggleCheck}
          labelings={labelings}
          deleteEntry={deleteEntry}
          selectAll={selectAll}
          deselectAll={deselectAll}
        ></DatasetTable>
      </Container>

      <div className="d-flex justify-content-center mt-3">
        <PageSelection
          pageSize={pageSize}
          datasetCount={datasets.length}
          goToPage={goToPage}
          goToNextPage={goToNextPage}
          goToLastPage={goToLastPage}
          currentPage={currentPage}
          goToPreviousPage={goToPreviousPage}
          goToFirstPage={gotToFirstPage}
        />
      </div>

      <Modal isOpen={modal} toggle={toggleModal} className={props.className}>
        <ModalHeader toggle={toggleModal}>Delete Dataset</ModalHeader>
        <ModalBody>
          Are you sure to delete the following datasets?
          {console.log(datasetsToDelete)}
          {datasetsToDelete.map((id) => {
            const dataset = datasets.find((elm) => elm._id === id);
            if (!dataset) {
              return;
            }
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
            onClick={deleteSelectedDatasets}
          >
            Yes
          </Button>{' '}
          <Button outline color="secondary" onClick={toggleModal}>
            No
          </Button>
        </ModalFooter>
      </Modal>
      <UploadDatasetModal
        isOpen={isCreateNewDatasetOpen}
        onCloseModal={toggleCreateNewDatasetModal}
        onDatasetComplete={refreshList}
      />
    </div>
  );
};

export default ListPage;
