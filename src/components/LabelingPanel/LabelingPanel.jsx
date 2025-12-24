import React, { useState, useEffect } from "react";
import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { hexToForegroundColor } from "../../services/ColorService";
import { useContext } from "react";
import { DatasetContext } from "../../routes/dataset/DatasetContext";

import "./LabelingPanel.css";
import DeleteModal from "../Common/DeleteModal";

const LabelButtonView = ({
  labeling,
  selectedLabelTypeId,
  setSelectedLabelTypeId,
}) => {
  return (
    <Box>
      {labeling &&
        labeling.labels.map((label, index) => (
          <Button
            className="labelingButton"
            m="xs"
            style={{
              backgroundColor:
                label.id === selectedLabelTypeId ? label.color : "white",
              color:
                label.id === selectedLabelTypeId
                  ? hexToForegroundColor(label.color)
                  : label.color,
            }}
            onClick={(e) => setSelectedLabelTypeId(label.id)}
            key={index}
          >
            {label.name} {"(" + (index + 1) + ")"}
          </Button>
        ))}
    </Box>
  );
};

const TimeDisplay = ({ from, to }) => {
  return (
    <Stack mx="sm" gap={4}>
      <Text size="xs" fw={700} ta="center">
        Selected Label
      </Text>
      <Group align="center" gap="xs">
        <Text size="xs" className="monospace">
          {new Date(from).toUTCString().split(" ")[4]}
        </Text>
        <Text size="xs" className="monospace">
          -
        </Text>
        <Text size="xs" className="monospace">
          {new Date(to).toUTCString().split(" ")[4]}
        </Text>
      </Group>
    </Stack>
  );
};

const LabelingPanel = ({}) => {
  const {
    hideLabels,
    onAddLabel,
    onDeleteSelectedLabel,
    selectedLabel,
    activeLabeling,
    selectedLabelTypeId,
    setSelectedLabelTypeId,
  } = useContext(DatasetContext);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleKeys = (e) => {
    if (e.key === "Delete" && selectedLabel) {
      setDeleteModalOpen(true);
    }
    if (e.ctrlKey && e.key > 0) {
      if (e.key - 1 > activeLabeling.labels.length) {
        return;
      }
      const newLabelType = activeLabeling.labels[Number(e.key - 1)];
      setSelectedLabelTypeId(newLabelType.id);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
    };
  });

  return (
    <Box>
      <Box className="labelingPanelBorder" />
      <Group justify="space-between" p="xs">
        {!hideLabels ? (
          <LabelButtonView
            labeling={activeLabeling}
            selectedLabelTypeId={selectedLabelTypeId}
            setSelectedLabelTypeId={setSelectedLabelTypeId}
          />
        ) : (
          <Box />
        )}
        <Group align="center">
          <TimeDisplay
            from={selectedLabel && selectedLabel.start}
            to={selectedLabel && selectedLabel.end}
          />
          <Button
            disabled={selectedLabel === undefined}
            className="deleteButton"
            m="xs"
            variant="outline"
            color="red"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </Button>
          <DeleteModal
            isOpen={deleteModalOpen}
            onCancel={() => setDeleteModalOpen(false)}
            onDelete={() => {
              onDeleteSelectedLabel();
              setDeleteModalOpen(false);
            }}
          >
            <div>SelectedLabel</div>
          </DeleteModal>
        </Group>
      </Group>
      <DeleteModal
        isOpen={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={() => {
          onDeleteSelectedLabel();
          setDeleteModalOpen(false);
        }}
      >
        The selected label
      </DeleteModal>
    </Box>
  );
};

export default LabelingPanel;
