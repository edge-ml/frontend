import React, { useState, useContext } from "react";
import NotificationContext from "../../components/NotificationHandler/NotificationProvider";
import Loader from "../../modules/loader";

import "./index.css";

import useLabelings from "../../Hooks/useLabelings";
import DatasetTable from "./DatasetTable";
import DataUpload from "./DataUpload";
import usePaginatedDatasets from "../../Hooks/usePaginatedDatasets";
import PageSelection from "./PageSelection";
import DeleteModal from "../../components/Common/DeleteModal";

const ListPage = () => {
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [sortDropDownIsOpen, setSortDropdownIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(undefined);
  const { registerProjectDownload } = useContext(NotificationContext);
  const [deleteSelected, setDeleteSelected] = useState([]);

  const { labelings } = useLabelings();
  const {
    datasets,
    refreshDatasets,
    page,
    setPage,
    totalPages,
    sorting,
    setSorting,
    updateDataset,
    deleteDatasets,
  } = usePaginatedDatasets(pageSize);

  const deleteSelectedDatasets = () => {
    deleteDatasets(deleteSelected);
    setDeleteSelected([]);
  };

  const deleteEntry = (datasetId) => {
    setDeleteSelected([datasetId]);
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
    setSelectedDatasets((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const downloadAllDatasets = async () => {
    registerProjectDownload();
  };

  if (!datasets || !labelings) {
    return <Loader loading />;
  }

  return (
    <div id="dataList" className="d-flex flex-column h-100">
      <DataUpload
        refreshDatasets={refreshDatasets}
      />
      <DatasetTable
        datasets={datasets}
        selectedDatasets={selectedDatasets}
        openDeleteModal={() => setDeleteSelected(selectedDatasets)}
        selectAllEmpty={selectAllEmpty}
        downloadAllDatasets={downloadAllDatasets}
        toggleCheck={toggleCheck}
        labelings={labelings}
        deleteEntry={deleteEntry}
        selectAll={selectAll}
        deselectAll={deselectAll}
        selectedSorting={sorting}
        setSelectedSorting={setSorting}
        selectedFilter={selectedFilter}
        updateDataset={updateDataset}
      />
      <div className="d-flex justify-content-center mt-3">
        {datasets?.length > 0 && (
          <PageSelection
            currentPage={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        )}
      </div>
      <DeleteModal
        isOpen={deleteSelected.length > 0}
        onCancel={() => setDeleteSelected([])}
        onDelete={deleteSelectedDatasets}
      >
        {deleteSelected.length > 0 && (
          <div>
            <h5>Are you sure to delete:</h5>
            {deleteSelected.map((datasetId) => (
              <div key={datasetId}>
                {datasets.find((d) => d._id === datasetId)?.name}
              </div>
            ))}
          </div>
        )}
      </DeleteModal>
    </div>
  );
};

export default ListPage;
