import React, { useState } from "react";
import { Button } from "reactstrap";
import Checkbox from "../../components/Common/Checkbox";
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

  return (
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <div className="d-flex flex-row align-items-center p-1">
          <div className="ml-md-2 me-md-3 ">
            <Checkbox isSelected={allSelected} onClick={selectAll}></Checkbox>
          </div>
          <Button
            outline
            className="ms-3 btn-delete"
            id="deleteDatasetsButton"
            size="sm"
            color="danger"
            disabled={selectedLabelings.length === 0}
            onClick={deleteSelectedLabelings}
          >
            <FontAwesomeIcon
              className="me-2"
              icon={faTrashAlt}
            ></FontAwesomeIcon>
            Delete
          </Button>
        </div>
      </EdgeMLTableHeader>
      {labelings.map((labeling, index) => (
        <EdgeMLTableEntry key={labeling.id}>
          <LabelingTableEntry
            key={"labeling" + index}
            labeling={labeling}
            labelings={labelings}
            isSelected={selectedLabelings
              .map((elm) => elm.id)
              .includes(labeling.id)}
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
            ? selectedLabelings.map((labeling, index) => (
                <div className="m-2" key={index}>
                  {labeling.name}
                </div>
              ))
            : null}
        </div>
      </DeleteConfirmationModal>
    </EdgeMLTable>
  );
};

export default LabelingTable;
