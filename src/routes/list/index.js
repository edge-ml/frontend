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
import FilterSelectionModal from './FilterSelectionModal';

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
import PageSizeDropdown from './PageSizeDropdown';

const ListPage = (props) => {
  const [modal, setModal] = useState(false);
  //underlying datasets which get sorted, but not filtered
  const [datasets, setDatasets] = useState(undefined);
  //has to contain the filtered datasets after sorting
  const [filteredDatasets, setFilteredDatasets] = useState(undefined);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [ready, setReady] = useState(false);
  const [isCreateNewDatasetOpen, setIsCreateNewDatasetOpen] = useState(false);
  const [labelings, setLabelings] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  //datasets displayed on the current page
  const [displayedDatasets, setDisplayedDatasets] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [sortingDropDownIsOpen, setSortingDropdownIsOpen] = useState(false);
  const [selectedSortingString, setSelectedSortingString] = useState(null);
  const [sortingMethod, setSortingMethod] = useState(null);
  const [showFilterSelectionModal, setShowFilterSelectionModal] =
    useState(false);
  const [selectedFilter, setSelectedFilter] = useState('clearFilter');
  const [filterParam, setFilterParam] = useState(null);
  const { registerProjectDownload } = useContext(NotificationContext);
  //needed to access newest state in key event handler
  const datasetsRef = useRef(datasets);
  const currentPageRef = useRef(currentPage);
  const pageSizeRef = useRef(pageSize);

  const toggleModal = () => {
    setModal(!modal);
  };

  const getFilteredDatasets = () => {
    //deselect selected datasets to not cause confusion with datasets, which aren't visible
  };

  const deleteSelectedDatasets = () => {
    deleteDatasets(selectedDatasets).then(() => {
      setModal(false);
      setSelectedDatasets([]);
      setDatasets(
        datasets.filter((dataset) => !selectedDatasets.includes(dataset['_id']))
      );
    });
    resetDropdown().catch((err) => {
      window.alert('Error deleting datasets');
      setModal(false);
    });
  };

  const deleteEntry = (datasetId) => {
    setSelectedDatasets([datasetId]);
    toggleModal();
  };

  const toggleCreateNewDatasetModal = () => {
    setIsCreateNewDatasetOpen(!isCreateNewDatasetOpen);
  };

  const toggleFilterSelectionModal = () => {
    setShowFilterSelectionModal(!showFilterSelectionModal);
  };

  const selectAllEmpty = () => {
    setSelectedDatasets(
      datasets
        .filter((elm) =>
          elm.timeSeries
            .map((x) => x.length)
            .every((y) => y === 0 || y === null)
        )
        .map((elm) => elm._id)
    );
  };

  const applyFilter = (filter, filterParam) => {
    //clear selected before applying
    setSelectedDatasets([]);
    switch (filter) {
      case 'filterByName':
        break;
      case 'filterEmptyDatasets':
        selectAllEmpty();
        break;
      case 'filterByLabelingSets':
        break;
      default:
        return null;
    }
  };

  const selectAll = () => {
    setSelectedDatasets(datasets.map((elm) => elm._id));
  };

  const deselectAll = () => {
    setSelectedDatasets([]);
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
    handleChangingPageSize();
  }, [pageSize, datasets]);

  const handleChangingPageSize = () => {
    pageSizeRef.current = pageSize;
    datasetsRef.current = datasets;
    setCurrentPage(0);
    if (datasets) {
      setDisplayedDatasets(
        datasets.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
      );
    }
  };

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
      Math.ceil(datasetsRef.current.length / pageSizeRef.current) - 1
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
      Math.ceil(datasetsRef.current.length / pageSizeRef.current) - 1
    );
  };

  const gotToFirstPage = () => {
    setCurrentPage(0);
  };

  const resetDropdown = () => {
    setSelectedSortingString(null);
    setSortingMethod(null);
    setSortingDropdownIsOpen(false);
  };

  const applySorting = (sortingMethod) => {
    let _datasets = sortDatasets(sortingMethod);
    setDatasets(_datasets);
  };

  const sortDatasets = (sortingMethod) => {
    switch (sortingMethod) {
      case 'sortAlphaDesc':
        return sortAlphaDesc();
      case 'sortAlphaAsc':
        return sortAlphaAsc();
      case 'sortDateDesc':
        return sortDateDesc();
      case 'sortDateAsc':
        return sortDateAsc();
      //do nothing
      default:
        return [...datasets];
    }
  };

  const sortAlphaAsc = () => {
    const _datasets = [...datasets];
    _datasets.sort((a, b) => {
      const textA = a.name.toLowerCase();
      const textB = b.name.toLowerCase();
      if (textA < textB) {
        return -1;
      }
      if (textA > textB) {
        return 1;
      }
      return 0;
    });
    return _datasets;
  };

  const sortAlphaDesc = () => {
    const _datasets = [...datasets];
    _datasets.sort((a, b) => {
      const textA = a.name.toLowerCase();
      const textB = b.name.toLowerCase();
      if (textA < textB) {
        return 1;
      }
      if (textA > textB) {
        return -1;
      }
      return 0;
    });
    return _datasets;
  };

  const sortDateAsc = () => {
    const _datasets = [...datasets];
    _datasets.sort((a, b) => {
      //dataset starts
      const startA = Math.min(...a.timeSeries.map((elm) => elm.start));
      const startB = Math.min(...b.timeSeries.map((elm) => elm.start));
      return startA - startB;
    });
    return _datasets;
  };

  const sortDateDesc = () => {
    const _datasets = [...datasets];
    _datasets.sort((a, b) => {
      //dataset starts
      const startA = Math.min(...a.timeSeries.map((elm) => elm.start));
      const startB = Math.min(...b.timeSeries.map((elm) => elm.start));
      return startB - startA;
    });
    return _datasets;
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
    const checked = selectedDatasets.includes(datasetId);
    if (!checked) {
      if (!selectedDatasets.includes(datasetId)) {
        setSelectedDatasets([...selectedDatasets, datasetId]);
      }
    } else {
      setSelectedDatasets(selectedDatasets.filter((id) => id !== datasetId));
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
        <div className="table-margin">
          <DatasetTable
            displayedDatasets={displayedDatasets}
            selectedDatasets={selectedDatasets}
            openDeleteModal={toggleModal}
            selectAllEmpty={selectAllEmpty}
            downloadAllDatasets={downloadAllDatasets}
            toggleCheck={toggleCheck}
            labelings={labelings}
            deleteEntry={deleteEntry}
            selectAll={selectAll}
            deselectAll={deselectAll}
            sortingDropDownIsOpen={sortingDropDownIsOpen}
            setSortingDropdownIsOpen={setSortingDropdownIsOpen}
            selectedSortingString={selectedSortingString}
            setSelectedSortingString={setSelectedSortingString}
            setSortingMethod={setSortingMethod}
            applySorting={applySorting}
            toggleFilterSelectionModal={toggleFilterSelectionModal}
            applyFilter={applyFilter}
            filterSelected={selectedFilter !== 'clearFilter'}
          ></DatasetTable>
        </div>
      </Container>

      {datasets.length > 0 ? (
        <div className="fixed-bottom">
          <div className="d-flex justify-content-center flex-md-row flex-wrap">
            <div className="position-relative mr-md-3">
              <PageSizeDropdown pageSize={pageSize} setPageSize={setPageSize} />
            </div>
            <div className="">
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
          </div>
        </div>
      ) : null}

      <Modal isOpen={modal} toggle={toggleModal} className={props.className}>
        <ModalHeader toggle={toggleModal}>Delete Dataset</ModalHeader>
        <ModalBody>
          Are you sure to delete the following datasets?
          {console.log(selectedDatasets)}
          {selectedDatasets.map((id) => {
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
      {showFilterSelectionModal ? (
        <FilterSelectionModal
          toggleFilterSelectionModal={toggleFilterSelectionModal}
          showFilterSelectionModal={showFilterSelectionModal}
          applyFilter={applyFilter}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          setFilterParam={setFilterParam}
        />
      ) : null}
    </div>
  );
};

export default ListPage;
