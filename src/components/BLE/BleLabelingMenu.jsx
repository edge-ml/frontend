import React from "react";
import { Badge, Button, Group, Menu, Paper, Stack, Text } from "@mantine/core";
import { IconChevronDown, IconKeyboard, IconTags } from "@tabler/icons-react";

export const BleLabelingMenu = ({
  labelings,
  selectedLabeling,
  handleSelectLabeling,
  handleSelectLabel,
  shortcutKeys,
  recorderState,
  currentLabel,
}) => {
  const isRecording = recorderState === "recording";

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={650}>Labels</Text>
          <Text size="sm" c="dimmed">
            Optional markers saved with this recording
          </Text>
        </div>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button
              variant="outline"
              rightSection={<IconChevronDown size={15} />}
              leftSection={<IconTags size={16} />}
              disabled={isRecording}
            >
              {selectedLabeling?.name || "Choose labeling"}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {labelings.length === 0 ? (
              <Menu.Item disabled>No labelings available</Menu.Item>
            ) : (
              labelings.map((labeling) => (
                <Menu.Item
                  key={labeling._id || labeling.name}
                  onClick={() => handleSelectLabeling(labeling)}
                >
                  {labeling.name}
                </Menu.Item>
              ))
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>

      {selectedLabeling ? (
        <div className="ble-label-grid">
          {selectedLabeling.labels.map((label, labelIndex) => {
            const isActive =
              isRecording &&
              currentLabel?.id === label._id &&
              currentLabel?.end === undefined;
            return (
              <Paper
                component="button"
                type="button"
                key={label._id}
                className={`ble-label-button${
                  isActive ? " ble-label-button--active" : ""
                }`}
                onClick={() => handleSelectLabel(labelIndex)}
                disabled={!isRecording}
                withBorder
                radius="md"
              >
                <span
                  className="ble-label-button__swatch"
                  style={{ backgroundColor: label.color }}
                />
                <span className="ble-label-button__name">{label.name}</span>
                <Badge
                  color="gray"
                  variant="light"
                  size="sm"
                  leftSection={<IconKeyboard size={12} />}
                >
                  {shortcutKeys[labelIndex]?.toUpperCase()}
                </Badge>
              </Paper>
            );
          })}
        </div>
      ) : (
        <Text size="sm" c="dimmed" className="ble-empty-copy">
          Choose a labeling if you want to mark activities while recording.
        </Text>
      )}

      {selectedLabeling && (
        <Text size="xs" c="dimmed">
          {isRecording
            ? "Click a label or use its keyboard shortcut to start and stop it."
            : "Label controls become active when recording starts."}
        </Text>
      )}
    </Stack>
  );
};
