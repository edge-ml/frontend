import React, { useState } from "react";
import { Button, Group, Text, Table } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../components/Common/Checkbox";
import LabelingTableEntry from "./LabelingTableEntry";
import DeleteModal from "../../components/Common/DeleteModal";
import { Empty } from "../export/components/Empty";

const LabelingTable = ({ labelings, onEdit, deleteLabelings, onCreate }) => {
  const [selectedLabelings, setSelectedLabelings] = useState([]);
  const [deleteSelected, setDeleteSelected] = useState([]);

  const onSelectAll = () => {
    const allSelected = labelings.length === selectedLabelings.length;
    setSelectedLabelings(allSelected ? [] : labelings);
  };

  const toggleCheck = (labeling) => {
    setSelectedLabelings((prev) =>
      prev.includes(labeling)
        ? prev.filter((l) => l._id !== labeling._id)
        : [...prev, labeling]
    );
  };

  return (
    <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2 flex-grow-1">
      <Group justify="space-between" mb="xs">
        <Text fw={700} size="xl">
          LABELINGS
        </Text>
        <Button variant="outline" size="sm" onClick={onCreate}>
          Create Labeling
        </Button>
      </Group>
      {labelings.length > 0 ? (
        <Table className="mt-3">
          <Table.Thead>
            <Table.Tr style={{ borderBottom: "2px solid rgb(230, 230, 234)" }}>
              <Table.Th colSpan={3} p={0}>
                <Group
                  justify="space-between"
                  style={{
                    background: "rgb(249, 251, 252)",
                    padding: "10px",
                  }}
                >
                  <Group gap="xs" p="xs">
                    <Checkbox
                      isSelected={labelings.length === selectedLabelings.length}
                      onClick={onSelectAll}
                    />
                    <Button
                      variant="outline"
                      color="red"
                      size="sm"
                      disabled={selectedLabelings.length === 0}
                      onClick={() => setDeleteSelected(selectedLabelings)}
                    >
                      <FontAwesomeIcon className="me-2" icon={faTrashAlt} />
                      Delete
                    </Button>
                  </Group>
                </Group>
              </Table.Th>
            </Table.Tr>
            <Table.Tr>
              <Table.Th w={40}></Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th w={110}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {labelings.map((labeling) => (
              <LabelingTableEntry
                key={labeling._id}
                labeling={labeling}
                isSelected={selectedLabelings.includes(labeling)}
                toggleCheck={() => toggleCheck(labeling)}
                onEdit={() => onEdit(labeling)}
                onDelete={() => setDeleteSelected([labeling])}
              />
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Empty>No labelings created yet</Empty>
      )}
      <DeleteModal
        isOpen={deleteSelected.length > 0}
        onCancel={() => setDeleteSelected([])}
        onDelete={() => {
          deleteLabelings(deleteSelected);
          setDeleteSelected([]);
        }}
      >
        {deleteSelected.map((l) => (
          <div key={l._id}>
            <b>{l.name}</b>
          </div>
        ))}
      </DeleteModal>
    </div>
  );
};

export default LabelingTable;
