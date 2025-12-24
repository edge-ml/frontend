import React, { useState } from "react";
import { Box, Button, Group, Menu, Stack, Text } from "@mantine/core";
import LabelBadge from "../Common/LabelBadge";

export const BleLabelingMenu = ({
  labelings,
  selectedLabeling,
  handleSelectLabeling,
  shortcutKeys,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <Box m="sm">
      <Group className="header-wrapper" justify="space-between" align="center">
        <Text fw={700} size="lg">
          4. Labelings
        </Text>
        <Menu opened={dropdownOpen} onChange={setDropdownOpen}>
          <Menu.Target>
            <Button variant="outline" color="blue">
              Labelings
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {labelings.map((labeling) => (
              <Menu.Item
                key={labeling.name}
                onClick={() => handleSelectLabeling(labeling)}
              >
                {labeling.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Stack className="body-wrapper" p="md" gap="xs">
        {selectedLabeling ? (
          <Text fw={600}>Labels in {selectedLabeling.name}:</Text>
        ) : null}
        <Group wrap="wrap" gap="xs">
          {selectedLabeling &&
            selectedLabeling.labels.map((label, labelIdx) => (
              <Stack key={label.id} align="center" gap={2}>
                <LabelBadge color={label.color}>{label.name}</LabelBadge>
                <Text size="xs">{shortcutKeys[labelIdx]}</Text>
              </Stack>
            ))}
        </Group>
        <Text size="sm">To start/stop labeling the data during recording:</Text>
        <Text size="sm">
          Press the shortcut key on the keyboard which corresponds the desired
          label.
        </Text>
      </Stack>
    </Box>
  );
};
