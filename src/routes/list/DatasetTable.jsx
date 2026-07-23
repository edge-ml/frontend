import {
  faDownload,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Group, Text, Table } from "@mantine/core";
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
          size="sm"
          disabled={datasets.length === 0}
          onClick={downloadAllDatasets}
          leftSection={<FontAwesomeIcon icon={faDownload} />}
        >
          Download All
        </Button>
      </Group>
      {datasets.length > 0 ? (
        <Table className="mt-3">
          <Table.Thead>
            <Table.Tr style={{ borderBottom: "2px solid rgb(230, 230, 234)" }}>
              <Table.Th colSpan={5} p={0}>
                <Group
                  justify="space-between"
                  style={{
                    background: "rgb(249, 251, 252)",
                    padding: "10px",
                  }}
                >
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
                      size="sm"
                      disabled={selectedDatasets.length === 0}
                      onClick={openDeleteModal}
                      id="deleteDatasetsButton"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                      Delete
                    </Button>
                    <Button
                      id="selectAllEmptyButton"
                      variant="outline"
                      size="sm"
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
                </Group>
              </Table.Th>
            </Table.Tr>
            <Table.Tr>
              <Table.Th w={40}></Table.Th>
              <Table.Th>Dataset</Table.Th>
              <Table.Th>Labelings</Table.Th>
              <Table.Th>Metadata</Table.Th>
              <Table.Th w={110}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {datasets.map((dataset) => (
              <DatasetTableEntry
                key={dataset._id}
                dataset={dataset}
                toggleCheck={toggleCheck}
                isSelected={selectedDatasets.includes(dataset._id)}
                labelings={labelings}
                deleteEntry={deleteEntry}
                updateDataset={updateDataset}
              />
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Empty>No datasets available yet</Empty>
      )}
    </div>
  );
};

export default DatasetTable;
