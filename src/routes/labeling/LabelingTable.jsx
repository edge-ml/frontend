import React, { useState } from "react";
import { Button, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../components/Common/Checkbox";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../components/Common/EdgeMLTable";
import LabelingTableEntry from "./LabelingTableEntry";
import DeleteModal from "../../components/Common/DeleteModal";

const LabelingTable = ({ labelings, onEdit, deleteLabelings }) => {
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
    <>
      <EdgeMLTable>
        <EdgeMLTableHeader>
          <Group gap="xs" ml="sm">
            <Checkbox
              isSelected={labelings.length === selectedLabelings.length}
              onClick={onSelectAll}
            />
            <Button
              variant="outline"
              color="red"
              size="compact-sm"
              onClick={() => setDeleteSelected(selectedLabelings)}
            >
              <FontAwesomeIcon className="me-2" icon={faTrashAlt} />
              Delete
            </Button>
          </Group>
        </EdgeMLTableHeader>
        {labelings.map((labeling) => (
          <EdgeMLTableEntry key={labeling._id}>
            <LabelingTableEntry
              labeling={labeling}
              isSelected={selectedLabelings.includes(labeling)}
              toggleCheck={() => toggleCheck(labeling)}
              onEdit={() => onEdit(labeling)}
            />
          </EdgeMLTableEntry>
        ))}
      </EdgeMLTable>
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
    </>
  );
};

export default LabelingTable;
