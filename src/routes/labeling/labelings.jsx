import React, { useState } from "react";
import { Container, Button } from "reactstrap";
import Loader from "../../modules/loader";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
import LabelingTable from "./LabelingTable";
import useLabelings from "../../Hooks/useLabelings";
import Page from "../../components/Common/Page";
import { Empty } from "../export/components/Empty";
import DeleteConfirmationModal from "../../components/DeleteConfirmModal";

const Labelings = () => {
  const { labelings, updateLabeling, addLabeling, deleteLabeling } =
    useLabelings();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLabelings, setSelectedLabelings] = useState([]);

  const onModalAddLabeling = () => {
    setEditModalOpen(true);
  };

  if (!labelings) {
    return <Loader loading></Loader>;
  }

  const removeLabeling = (labelings) => {
    labelings.forEach((labeling) => {
      deleteLabeling(labeling.id);
    });

    const remainingLabelings = selectedLabelings.filter(
      (labeling) => !labelings.map((elm) => elm.id).includes(labeling.id)
    );
    setSelectedLabelings(remainingLabelings);
  };

  const toggleCheck = (e, labeling) => {
    const isChecked = e.target.checked;
    setSelectedLabelings((prevSelectedLabelings) => {
      if (isChecked) {
        return [...prevSelectedLabelings, labeling];
      } else {
        return prevSelectedLabelings
          .map((elm) => elm.id)
          .filter((id) => id !== labeling.id);
      }
    });
  };

  const labelingIdSet = new Set(labelings.map((elm) => elm.id)).size;
  const selectedLabelingSet = new Set(selectedLabelings).size;
  const allSelected = labelingIdSet === selectedLabelingSet;

  const selectAll = () => {
    if (allSelected) {
      setSelectedLabelings([]);
    } else {
      setSelectedLabelings(labelings.map((elm) => elm.id));
    }
  };

  return (
    <Loader loading={!labelings}>
      <Page
        header={
          <>
            <div className="fw-bold h4 justify-self-start">LABELING SETS</div>
            <div className="justify-f-end">
              <Button
                outline
                color="primary"
                onClick={onModalAddLabeling}
                className="btn-neutral ml-auto"
              >
                Create Labeling Set
              </Button>
            </div>
          </>
        }
      >
        {labelings.length === 0 ? (
          <Empty>No labelings yet</Empty>
        ) : (
          <LabelingTable
            labelings={labelings}
            updateLabeling={updateLabeling}
            deleteLabelings={removeLabeling}
            selectedLabelings={selectedLabelings}
            toggleCheck={toggleCheck}
            allSelected={allSelected}
            selectAll={selectAll}
          ></LabelingTable>
        )}
      </Page>
      <EditLabelingModal
        labelings={labelings}
        onCancel={() => setEditModalOpen(false)}
        onSave={(labeling) => {
          addLabeling(labeling);

          setEditModalOpen(false);
        }}
        isOpen={editModalOpen}
      ></EditLabelingModal>
    </Loader>
  );
};

export default Labelings;
