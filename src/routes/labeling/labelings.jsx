import React, { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import Loader from "../../modules/loader";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
import LabelingTable from "./LabelingTable";
import useLabelings from "../../Hooks/useLabelings";
import Page from "../../components/Common/Page";
import { Empty } from "../export/components/Empty";

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
          <Group justify="space-between" align="center">
            <Text fw={700} size="xl">
              LABELING SETS
            </Text>
            <Button variant="outline" color="blue" onClick={onModalAddLabeling}>
              Create Labeling Set
            </Button>
          </Group>
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
