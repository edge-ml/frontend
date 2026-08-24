import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Group,
  Kbd,
  Text,
  Tooltip,
} from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { hexToForegroundColor } from "../../services/ColorService";
import { DatasetContext } from "../../routes/dataset/DatasetContext";
import DeleteModal from "../Common/DeleteModal";

import "./LabelingPanel.css";

const LabelTypeButton = ({ label, index, isSelected, onSelect }) => (
  <Tooltip
    label={`Shortcut: ${index + 1} or Ctrl+${index + 1}`}
    openDelay={400}
    withinPortal
  >
    <button
      className={`dsp-label-chip ${isSelected ? "selected" : ""}`}
      style={
        isSelected
          ? {
              backgroundColor: label.color,
              color: hexToForegroundColor(label.color),
              borderColor: label.color,
            }
          : { color: label.color, borderColor: `${label.color}66` }
      }
      onClick={() => onSelect(label._id)}
    >
      <Kbd
        fw={700}
        px={6}
        style={
          isSelected
            ? {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "inherit",
                border: "none",
              }
            : undefined
        }
      >
        {index + 1}
      </Kbd>
      <Box component="span" fz="sm" fw={600} truncate="end">
        {label.name}
      </Box>
    </button>
  </Tooltip>
);

const SelectedLabelRange = ({ from, to }) => {
  const formatTime = (timestamp) =>
    Number.isFinite(timestamp)
      ? new Date(timestamp).toUTCString().split(" ")[4]
      : "--:--:--";

  return (
    <Group gap="xs" wrap="nowrap">
      <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
        Selected Label
      </Text>
      <Group gap={4} wrap="nowrap" ff="monospace" fz="sm">
        <Text inherit ff="monospace">
          {formatTime(from)}
        </Text>
        <Text inherit c="dimmed">
          –
        </Text>
        <Text inherit ff="monospace">
          {formatTime(to)}
        </Text>
      </Group>
    </Group>
  );
};

const LabelingPanel = () => {
  const {
    activeLabeling,
    selectedLabel,
    onDeleteSelectedLabel,
    selectedLabelTypeId,
    setSelectedLabelTypeId,
  } = useContext(DatasetContext);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="dsp-labelbar-wrap">
      <Group justify="space-between" wrap="nowrap" px="sm" py={6}>
        <Group gap="xs" wrap="nowrap" className="dsp-labelbar-chips">
          {(activeLabeling?.labels ?? []).map((label, index) => (
            <LabelTypeButton
              key={label._id}
              label={label}
              index={index}
              isSelected={label._id === selectedLabelTypeId}
              onSelect={setSelectedLabelTypeId}
            />
          ))}
          {!activeLabeling && (
            <Text fz="sm" c="dimmed" fs="italic">
              No labeling selected
            </Text>
          )}
        </Group>

        <Group gap="xs" wrap="nowrap">
          <SelectedLabelRange
            from={selectedLabel?.start}
            to={selectedLabel?.end}
          />
          <Button
            disabled={!selectedLabel}
            aria-label="Delete selected label"
            variant="outline"
            color="red"
            radius="md"
            leftIcon={<FontAwesomeIcon icon={faTrashCan} size="xs" />}
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
            <div>Selected Label</div>
          </DeleteModal>
        </Group>
      </Group>
    </div>
  );
};

export default LabelingPanel;
