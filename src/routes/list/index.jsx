import React, { useState, useContext } from "react";
import NotificationContext from "../../components/NotificationHandler/NotificationProvider";
import Loader from "../../modules/loader";

import "./index.css";

import useLabelings from "../../Hooks/useLabelings";
import DatasetTable from "./DatasetTable";
import DataUpload from "./DataUpload";
import useDatasets from "../../Hooks/useDatasets";
import usePaginatedDatasets from "../../Hooks/usePaginatedDatasets";
import { Pagination } from "reactstrap";
import PageSelection from "./PageSelection";

const ListPage = (props) => {
  const [modal, setModal] = useState(false);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [sortDropDownIsOpen, setSortDropdownIsOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState("alphaAsc"); //alphaAsc, alphaDesc, dateAsc, dateDesc
  const [selectedFilter, setSelectedFilter] = useState(undefined); //name and display value of filter
  const { registerProjectDownload } = useContext(NotificationContext);

  const { labelings } = useLabelings();
  const { datasets, refreshDatasets, page, setPage, totalPages } = usePaginatedDatasets(1);

  const toggleModal = () => {
    setModal(!modal);
  };

  const deleteSelectedDatasets = () => {
    datasetApi.deleteDatasets(selectedDatasets).then(() => {
      setModal(false);
      setSelectedDatasets([]);
      setDatasets(
        datasets.filter((dataset) => !selectedDatasets.includes(dataset["_id"]))
      );
    });
  };

  const deleteEntry = (datasetId) => {
    setSelectedDatasets([datasetId]);
    toggleModal();
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

  const selectAll = () => {
    setSelectedDatasets(datasets.map((elm) => elm._id));
  };

  const deselectAll = () => {
    setSelectedDatasets([]);
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

  const toggleCreateNewDatasetModal = () => {};

  if (!datasets || !labelings) {
    return <Loader loading={true}></Loader>;
  }

  const applyFilter = (currentFilter, currentFilterParams) => {
    setSelectedFilter(currentFilter);
    setSelectedFilterParams(currentFilterParams);
    selectedFilterRef.current = currentFilter;
    selectedFilterParamsRef.current = currentFilterParams;
    setCurrentPage(0);
    fetchDatasetets(
      0,
      pageSize,
      selectedSorting,
      currentFilter,
      currentFilterParams
    );
  };

  return (
    <div id="dataList" className="d-flex flex-column h-100">
      <DataUpload
        toggleCreateNewDatasetModal={toggleCreateNewDatasetModal}
        refreshDatasets={refreshDatasets}
      ></DataUpload>
      <DatasetTable
        datasets={datasets}
        selectedDatasets={selectedDatasets}
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
        // setFilterModalOpen={setFilterModalOpen}
        selectedFilter={selectedFilter}
      ></DatasetTable>
      <div className="d-flex justify-content-center">
        <PageSelection
          currentPage={page}
          setPage={setPage}
          totalPages={totalPages}
        ></PageSelection>
      </div>
    </div>
  );
};

export default ListPage;
