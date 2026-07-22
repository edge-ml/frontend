import {
  faDownload,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import Checkbox from "../../components/Common/Checkbox";
import DatasetTableEntry from "./DatasetTableEntry";
import DatasetSorting from "./DatasetSorting";
import { Empty } from "../export/components/Empty";

const DatasetTable = ({
  datasets,
  downloadAllDatasets,
  selectedDatasets,
  openDeleteModal,
  selectAllEmpty,
  selectedSorting,
  setSelectedSorting,
  selectAll,
  deselectAll,
  toggleCheck,
  labelings,
  deleteEntry,
  updateDataset,
}) => {
  const [areAllSelected, setAllSelected] = useState(false);
  return (
    <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2 flex-grow-1">
      <Group justify="space-between" mb="xs">
        <Text fw={700} size="xl">
          DATASETS
        </Text>
        <Button
          variant="outline"
          size="compact-sm"
          disabled={datasets.length === 0}
          onClick={downloadAllDatasets}
        >
          <FontAwesomeIcon icon={faDownload} /> Download All
        </Button>
      </Group>
      {datasets.length > 0 ? (
        <div style={{ borderRadius: 10 }}>
          <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row align-content-baseline">
            <Group gap="xs" p="xs">
              <Checkbox
                isSelected={areAllSelected}
                onClick={() => {
                  setAllSelected(!areAllSelected);
                  if (areAllSelected) {
                    deselectAll();
                  } else {
                    selectAll();
                  }
                }}
              />
              <Button
                variant="outline"
                color="red"
                size="compact-sm"
                disabled={selectedDatasets.length === 0}
                onClick={openDeleteModal}
                id="deleteDatasetsButton"
              >
                <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                Delete
              </Button>
              <Button
                id="selectAllEmptyButton"
                size="compact-sm"
                variant="outline"
                onClick={selectAllEmpty}
              >
                Select Empty Datasets
              </Button>
            </Group>
            <Group gap="xs">
              <DatasetSorting
                selectedSorting={selectedSorting}
                setSelectedSorting={setSelectedSorting}
              />
            </Group>
          </div>
          <div
            className="w-100 position-relative"
            style={{
              border: "2px solid rgb(230, 230, 234)",
              borderRadius: "0px 0px 10px 10px",
              overflow: "hidden",
            }}
          >
            {datasets.map((dataset, index) => (
              <DatasetTableEntry
                key={dataset._id}
                dataset={dataset}
                index={index}
                toggleCheck={toggleCheck}
                isSelected={selectedDatasets.includes(dataset._id)}
                labelings={labelings}
                deleteEntry={deleteEntry}
                updateDataset={updateDataset}
              />
            ))}
          </div>
        </div>
      ) : (
        <Empty>No datasets available yet</Empty>
      )}
    </div>
  );
};

export default DatasetTable;
