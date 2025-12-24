import React, { useState, useContext } from "react";
import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core";
import NotificationContext from "../../components/NotificationHandler/NotificationProvider";
import Loader from "../../modules/loader";

import "./index.css";

import useLabelings from "../../Hooks/useLabelings";
import DatasetTable from "./DatasetTable";
import DataUpload from "./DataUpload";
import usePaginatedDatasets from "../../Hooks/usePaginatedDatasets";
import PageSelection from "./PageSelection";

const ListPage = () => {
  const [selectedDatasets, setSelectedDatasets] = useState([]);
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
  } = usePaginatedDatasets(1);

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
        .map((elm) => elm.id)
    );
  };

  const selectAll = () => {
    setSelectedDatasets(datasets.map((elm) => elm.id));
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

  if (!datasets || !labelings) {
    return <Loader loading={true}></Loader>;
  }

  return (
    <Stack id="dataList" className="h-100" gap="md">
      <DataUpload refreshDatasets={refreshDatasets}></DataUpload>
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
        updateDataset={updateDataset}
      ></DatasetTable>
      {datasets && datasets.length > 0 && (
        <Group justify="center" className="pb-3">
          <PageSelection
            currentPage={page}
            setPage={setPage}
            totalPages={totalPages}
          ></PageSelection>
        </Group>
      )}
      <Modal
        opened={deleteSelected.length > 0}
        onClose={() => setDeleteSelected([])}
        title="Delete datasets"
      >
        <Stack gap="md">
          {deleteSelected.length > 0 && (
            <Box>
              <Text fw={600}>Are you sure to delete:</Text>
              <Stack gap={4} mt="xs">
                {deleteSelected.map((datasetId) => (
                  <Text key={datasetId} size="sm">
                    {datasets.find((dataset) => dataset.id === datasetId).name}
                  </Text>
                ))}
              </Stack>
            </Box>
          )}
          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={() => setDeleteSelected([])}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteSelectedDatasets}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ListPage;
