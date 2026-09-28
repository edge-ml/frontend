import React, { useState } from "react";
import { Container } from "@mantine/core";
import useLabelings from "../../Hooks/useLabelings";
import LabelingTable from "./LabelingTable";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
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
      <LabelingTable
        labelings={labelings}
        onEdit={onEdit}
        deleteLabelings={deleteLabelings}
        onCreate={() => setCreateModalOpen(true)}
      />
      <EditLabelingModal
        isOpen={createModalOpen || editModalOpen}
        currentLabeling={editLabeling}
        labelings={labelings}
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
