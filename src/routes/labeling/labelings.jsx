import React, { useState } from "react";
import { Button, Container } from "@mantine/core";
import useLabelings from "../../Hooks/useLabelings";
import LabelingTable from "./LabelingTable";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
import { Empty } from "../export/components/Empty";
import Loader from "../../modules/loader";

const LabelingsPage = () => {
  const { labelings, createLabeling, updateLabeling, deleteLabelings } =
    useLabelings();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLabeling, setEditLabeling] = useState(null);

  if (!labelings) {
    return <Loader loading />;
  }

  const onEdit = (labeling) => {
    setEditLabeling(labeling);
    setEditModalOpen(true);
  };

  const onSave = async (labeling) => {
    if (editLabeling) {
      await updateLabeling(labeling);
    } else {
      await createLabeling(labeling);
    }
    setEditModalOpen(false);
    setEditLabeling(null);
  };

  return (
    <Container fluid p="md">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold h4">LABELINGS</div>
        <Button onClick={() => setCreateModalOpen(true)}>
          Create Labeling
        </Button>
      </div>
      {labelings.length === 0 ? (
        <Empty>No labelings created yet</Empty>
      ) : (
        <LabelingTable
          labelings={labelings}
          onEdit={onEdit}
          deleteLabelings={deleteLabelings}
        />
      )}
      <EditLabelingModal
        isOpen={createModalOpen || editModalOpen}
        labeling={editLabeling}
        onClose={() => {
          setCreateModalOpen(false);
          setEditModalOpen(false);
          setEditLabeling(null);
        }}
        onSave={onSave}
      />
    </Container>
  );
};

export default LabelingsPage;
