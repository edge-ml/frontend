import React, { useState, useContext } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Kbd,
  Text,
  Tooltip,
} from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faRotateRight,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import { hexToForegroundColor } from "../../services/ColorService";
import { indexToShortcutKey } from "../../services/ShortcutKeys";
import { DatasetContext } from "../../routes/dataset/DatasetContext";
import DeleteModal from "../Common/DeleteModal";
import {
  datasetBounds,
  formatElapsed,
  mediaOf,
} from "../../routes/dataset/media/mediaUtils";

import "./LabelingPanel.css";

const LabelTypeButton = ({ label, index, isSelected, onSelect }) => {
  const shortcutKey = indexToShortcutKey(index)?.toUpperCase();
  return (
  <Tooltip
    label={`Shortcut: ${shortcutKey} or Ctrl+${shortcutKey}`}
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
        {shortcutKey}
      </Kbd>
      <Box component="span" fz="sm" fw={600} truncate="end">
        {label.name}
      </Box>
    </button>
  </Tooltip>
  );
};

const SelectedLabelRange = ({ from, to, origin }) => {
  // Next to recordings, times count from the start of the dataset, like the
  // player and the time axis, and are precise enough to place a boundary.
  const formatTime = (timestamp) =>
    !Number.isFinite(timestamp)
      ? "--:--:--"
      : origin !== undefined
        ? formatElapsed(timestamp - origin, 10)
        : new Date(timestamp).toUTCString().split(" ")[4];

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
        {origin !== undefined && Number.isFinite(from) && Number.isFinite(to) ? (
          <Text inherit c="dimmed">
            ({((to - from) / 1000).toFixed(2)} s)
          </Text>
        ) : null}
      </Group>
    </Group>
  );
};

const LabelingPanel = () => {
  const {
    dataset,
    activeLabeling,
    selectedLabel,
    onDeleteSelectedLabel,
    selectedLabelTypeId,
    setSelectedLabelTypeId,
    undoLabelChange,
    redoLabelChange,
    canUndo,
    canRedo,
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

        <Group gap="xs" wrap="nowrap" className="dsp-labelbar-actions">
          <SelectedLabelRange
            from={selectedLabel?.start}
            to={selectedLabel?.end}
            origin={
              mediaOf(dataset).length > 0
                ? datasetBounds(dataset)?.start
                : undefined
            }
          />
          <Group gap={4} wrap="nowrap">
            <Tooltip label="Undo the last label change (Ctrl+Z)" withinPortal openDelay={300}>
              <ActionIcon
                variant="default"
                radius="md"
                aria-label="Undo the last label change"
                disabled={!canUndo}
                onClick={() => undoLabelChange()}
              >
                <FontAwesomeIcon icon={faRotateLeft} size="xs" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Redo (Ctrl+Shift+Z)" withinPortal openDelay={300}>
              <ActionIcon
                variant="default"
                radius="md"
                aria-label="Redo the label change"
                disabled={!canRedo}
                onClick={() => redoLabelChange()}
              >
                <FontAwesomeIcon icon={faRotateRight} size="xs" />
              </ActionIcon>
            </Tooltip>
          </Group>
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
