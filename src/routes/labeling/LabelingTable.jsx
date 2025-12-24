import React, { useState } from "react";
import { Button, Checkbox, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../components/Common/EdgeMLTable";
import LabelingTableEntry from "./LabelingTableEntry";
import DeleteConfirmationModal from "../../components/DeleteConfirmModal";

const LabelingTable = ({
  labelings,
  selectedLabelings,
  toggleCheck,
  updateLabeling,
  deleteLabelings,
  allSelected,
  selectAll,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const deleteSelectedLabelings = async () => {
    setDeleteModalOpen(true);
  };
  const partiallySelected =
    selectedLabelings.length > 0 &&
    !allSelected &&
    labelings.length > 0;

  return (
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <Group className="p-1" align="center">
          <Checkbox
            checked={allSelected}
            indeterminate={partiallySelected}
            onChange={() => selectAll()}
          />
          <Button
            className="ms-3 btn-delete"
            id="deleteDatasetsButton"
            size="xs"
            variant="outline"
            color="red"
            disabled={selectedLabelings.length === 0}
            onClick={deleteSelectedLabelings}
          >
            <FontAwesomeIcon
              className="me-2"
              icon={faTrashAlt}
            ></FontAwesomeIcon>
            Delete
          </Button>
        </Group>
      </EdgeMLTableHeader>
      {labelings.map((labeling, index) => (
        <EdgeMLTableEntry key={labeling.id}>
          <LabelingTableEntry
            key={"labeling" + index}
            labeling={labeling}
            labelings={labelings}
            isSelected={selectedLabelings.includes(labeling.id)}
            updateLabeling={updateLabeling}
            deleteLabelings={deleteLabelings}
            toggleCheck={toggleCheck}
          ></LabelingTableEntry>
        </EdgeMLTableEntry>
      ))}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          deleteLabelings(selectedLabelings);
          setDeleteModalOpen(false);
        }}
      >
        <div>
          <div>Are you sure you want to delete the following labelings?</div>
          {selectedLabelings.length > 0
            ? selectedLabelings.map((labelingId) => {
                const labeling = labelings.find(
                  (entry) => entry.id === labelingId
                );
                return (
                  <div className="m-2" key={labelingId}>
                    {labeling ? labeling.name : labelingId}
                  </div>
                );
              })
            : null}
        </div>
      </DeleteConfirmationModal>
    </EdgeMLTable>
  );
};

export default LabelingTable;
