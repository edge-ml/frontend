import {
  faDownload,
  faFilter,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment } from "react";
import { Box, Button, Checkbox, Group, Text } from "@mantine/core";
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
  const allSelected =
    datasets.length > 0 && selectedDatasets.length === datasets.length;
  const partiallySelected =
    selectedDatasets.length > 0 && !allSelected && datasets.length > 0;
  return (
    <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2 flex-grow-1">
      <Fragment>
        <Group justify="space-between">
          <Text fw={700} size="xl">
            DATASETS
          </Text>
          <Button
            color="gray"
            variant="outline"
            disabled={datasets.length === 0}
            onClick={downloadAllDatasets}
          >
            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon> Download All
          </Button>
        </Group>
        {datasets.length > 0 ? (
          <div style={{ borderRadius: 10 }}>
            <Group
              className="datasets-header-wrapper mt-3"
              justify="space-between"
              align="center"
            >
              <Group align="center" gap="sm">
                <Checkbox
                  checked={allSelected}
                  indeterminate={partiallySelected}
                  onChange={() => {
                    if (allSelected) {
                      deselectAll();
                    } else {
                      selectAll();
                    }
                  }}
                />
                <Button
                  className="btn-delete"
                  id="deleteDatasetsButton"
                  disabled={selectedDatasets.length === 0}
                  color="red"
                  variant="outline"
                  onClick={openDeleteModal}
                >
                  <FontAwesomeIcon className="me-2" icon={faTrashAlt} />
                  Delete
                </Button>
                <Button
                  id="selectAllEmptyButton"
                  variant="outline"
                  color="gray"
                  onClick={selectAllEmpty}
                  className="ms-2"
                >
                  <FontAwesomeIcon className="me-2" icon={faFilter} />
                  Select Empty Datasets
                </Button>
              </Group>
              <Group justify="flex-end" className="position-relative">
                <DatasetSorting
                  selectedSorting={selectedSorting}
                  setSelectedSorting={setSelectedSorting}
                />
              </Group>
            </Group>
            <Box
              className="w-100 position-relative"
              style={{
                border: "2px solid rgb(230, 230, 234)",
                borderRadius: "0px 0px 10px 10px",
                overflow: "hidden",
              }}
            >
              {datasets.map((dataset, index) => (
                <DatasetTableEntry
                  key={dataset + index}
                  dataset={dataset}
                  index={index}
                  toggleCheck={toggleCheck}
                  isSelected={selectedDatasets.includes(dataset.id)}
                  labelings={labelings}
                  deleteEntry={deleteEntry}
                  updateDataset={updateDataset}
                ></DatasetTableEntry>
              ))}
            </Box>
          </div>
        ) : (
          <Empty>No datasets available yet</Empty>
        )}
      </Fragment>
    </div>
  );
};

export default DatasetTable;
