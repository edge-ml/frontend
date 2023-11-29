import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  createRef,
} from 'react';
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
import { useHistory, useLocation } from 'react-router-dom';

import './index.css';

import {
  getDatasets,
  deleteDatasets,
  getDatasetsWithPagination,
} from '../../services/ApiServices/DatasetServices';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';
import DatasetTable from './DatasetTable';
import DataUpload from './DataUpload';
import { UploadDatasetModal } from '../../components/UploadDatasetModal/UploadDatasetModal';
import PageSelection from './PageSelection';
import PageSizeInput from './PageSizeInput';
import FilterSelectionModal from './FilterSelection';
import { filter } from 'jszip';

const ListPage = (props) => {
  const [modal, setModal] = useState(false);
  const [datasets, setDatasets] = useState(undefined);
  const [total_datasets, setTotalDatasets] = useState(0);
  const [datasetsToDelete, setDatasetsToDelete] = useState([]);
  const [ready, setReady] = useState(false);
  const [isCreateNewDatasetOpen, setIsCreateNewDatasetOpen] = useState(false);
  const [labelings, setLabelings] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortDropDownIsOpen, setSortDropdownIsOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState('alphaAsc'); //alphaAsc, alphaDesc, dateAsc, dateDesc
  const [filters, setFilters] = useState([]); //{filter: filterParam}
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const { registerProjectDownload } = useContext(NotificationContext);
  //needed to access newest state in key event handler
  const total_datasetsRef = useRef(total_datasets);
  const currentPageRef = useRef(currentPage);
  const pageSizeRef = useRef(pageSize);
  const selectedSortingRef = useRef(selectedSorting);

  const location = useLocation();
  const history = useHistory();

  const toggleModal = () => {
    setModal(!modal);
  };

  const deleteSelectedDatasets = () => {
    deleteDatasets(datasetsToDelete).then(() => {
      setModal(false);
      setDatasetsToDelete([]);
      setDatasets(
        datasets.filter((dataset) => !datasetsToDelete.includes(dataset['_id']))
      );
    });
    resetDropdown().catch((err) => {
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

  const initURLSearchParams = () => {
    //TODO error handling
    let pageUpdate = currentPage;
    let pageSizeUpdate = pageSize;
    let sortUpdate = selectedSorting;
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('page')) {
      pageUpdate = parseInt(searchParams.get('page')) - 1;
    } else {
      searchParams.set('page', currentPage + 1);
    }
    if (searchParams.has('page_size')) {
      pageSizeUpdate = parseInt(searchParams.get('page_size'));
    } else {
      searchParams.set('page_size', pageSize);
    }
    if (searchParams.has('sort')) {
      sortUpdate = searchParams.get('sort');
    } else {
      searchParams.set('sort', selectedSorting);
    }
    history.replace({ search: `?${searchParams.toString()}` });

    selectedSortingRef.current = sortUpdate;
    currentPageRef.current = pageUpdate;
    pageSizeRef.current = pageSizeUpdate;
    setCurrentPage(pageUpdate);
    setPageSize(pageSizeUpdate);
    setSelectedSorting(sortUpdate);
    return {
      pageUpdate: pageUpdate === 0 ? 1 : pageUpdate,
      pageSizeUpdate: pageSizeUpdate,
      sortUpdate: sortUpdate,
    };
  };

  const changeURLSearchParams = (currentPage, pageSize, sort) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', currentPage + 1);
    searchParams.set('page_size', pageSize);
    searchParams.set('sort', sort);
    history.replace({ search: `?${searchParams.toString()}` });
  };

  const fetchDatasetets = (currentPage, pageSize, sort) => {
    getDatasetsWithPagination(currentPage + 1, pageSize, sort).then((data) => {
      onDatasetsChanged(data.datasets);
      total_datasetsRef.current = data.total_datasets;
      setTotalDatasets(data.total_datasets);
      changeURLSearchParams(currentPage, pageSize, sort);
    });
  };

  useEffect(() => {
    const pageInit = initURLSearchParams();
    Promise.all([
      getDatasetsWithPagination(
        pageInit.pageUpdate,
        pageInit.pageSizeUpdate,
        pageInit.sortUpdate
      ),
      subscribeLabelingsAndLabels().then((labelings) => {
        setLabelings(labelings);
      }),
    ])
      .then(([data, _]) => {
        onDatasetsChanged(data.datasets);
        total_datasetsRef.current = data.total_datasets;
        setTotalDatasets(data.total_datasets);
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
    if (pageSizeRef.current !== pageSize && ready) {
      pageSizeRef.current = pageSize;
      currentPageRef.current = 0;
      setCurrentPage(0);
      fetchDatasetets(0, pageSize, selectedSorting);
    }
  }, [pageSize]);

  useEffect(() => {
    if (selectedSortingRef.current !== selectedSorting && ready) {
      selectedSortingRef.current = selectedSorting;
      fetchDatasetets(currentPage, pageSize, selectedSorting);
    }
  }, [selectedSorting]);

  useEffect(() => {
    if (currentPageRef.current !== currentPage && ready) {
      currentPageRef.current = currentPage;
      fetchDatasetets(currentPage, pageSize, selectedSorting);
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
      Math.ceil(total_datasetsRef.current / pageSizeRef.current) - 1
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
    setCurrentPage(
      Math.ceil(total_datasetsRef.current / pageSizeRef.current) - 1
    );
  };

  const gotToFirstPage = () => {
    setCurrentPage(0);
  };

  const resetDropdown = () => {
    setSortDropdownIsOpen(false);
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
    resetDropdown();
  };

  const refreshList = () => {
    subscribeLabelingsAndLabels().then((labelings) => setLabelings(labelings));
    getDatasets().then((datasets) => setDatasets(datasets));
    resetDropdown();
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
          datasets={datasets}
          datasetsToDelete={datasetsToDelete}
          openDeleteModal={toggleModal}
          selectAllEmpty={selectAllEmpty}
          downloadAllDatasets={downloadAllDatasets}
          toggleCheck={toggleCheck}
          labelings={labelings}
          deleteEntry={deleteEntry}
          selectAll={selectAll}
          deselectAll={deselectAll}
          sortDropDownIsOpen={sortDropDownIsOpen}
          setSortDropdownIsOpen={setSortDropdownIsOpen}
          selectedSorting={selectedSorting}
          setSelectedSorting={setSelectedSorting}
          setFilterModalOpen={setFilterModalOpen}
        ></DatasetTable>
      </Container>
      {datasets.length > 0 ? (
        <div className="d-flex flex-row justify-content-center mt-3">
          <PageSelection
            pageSize={pageSize}
            datasetCount={total_datasets}
            goToPage={goToPage}
            goToNextPage={goToNextPage}
            goToLastPage={goToLastPage}
            currentPage={currentPage}
            goToPreviousPage={goToPreviousPage}
            goToFirstPage={gotToFirstPage}
          />
          <div className="position-relative ml-3">
            <PageSizeInput pageSize={pageSize} setPageSize={setPageSize} />
          </div>
        </div>
      ) : null}

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
      {filterModalOpen ? (
        <FilterSelectionModal
          filters={filters}
          setFilterModalOpen={setFilterModalOpen}
          filterModalOpen={filterModalOpen}
          applyFilter={applyFilter}
        />
      ) : null}
    </div>
  );
};

export default ListPage;
