import React, { useState, useContext } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox as MantineCheckbox,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";

import HelpModal from "./HelpModal";
import NotificationContext from "../NotificationHandler/NotificationProvider";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faQuestion,
  faWaveSquare,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import useProjectRouter from "../../Hooks/ProjectRouter";
import { DatasetContext } from "../../routes/dataset/DatasetContext";

import "./LabelingSelectionPanel.css";

const TimeSeriesSelection = () => {
  const { activeTimeSeries, setActiveTimeSeries, dataset } =
    useContext(DatasetContext);

  const [selectedTs, setSelectedTs] = useState(
    activeTimeSeries.map((elm) => elm._id)
  );

  const toggleSelect = (elmId) => {
    setSelectedTs((prev) =>
      prev.includes(elmId)
        ? prev.filter((id) => id !== elmId)
        : [...prev, elmId]
    );
  };

  const onSelectAll = () =>
    setSelectedTs(dataset.timeSeries.map((elm) => elm._id));

  const onClear = () => setSelectedTs([]);

  const onApply = () => {
    setActiveTimeSeries(
      selectedTs
        .map((select_id) =>
          dataset.timeSeries.find((elm) => elm._id === select_id)
        )
        .filter(Boolean)
    );
  };

  return (
    <Menu withinPortal position="bottom-start">
      <Menu.Target>
        <Button variant="default" radius="md">
          <FontAwesomeIcon icon={faWaveSquare} className="dsp-toolbar-icon" />
          <Box mx={6} fz="sm" fw={600}>
            Time Series
          </Box>
          <Badge size="sm" variant="light" color="teal">
            {activeTimeSeries.length}/{dataset.timeSeries.length}
          </Badge>
        </Button>
      </Menu.Target>
      <Menu.Dropdown w={280}>
        <Stack gap={0} p="4px" maw={280}>
          {dataset.timeSeries.map((elm) => (
            <Menu.Item
              key={elm._id}
              leftSection={
                <MantineCheckbox
                  size="xs"
                  readOnly
                  tabIndex={-1}
                  checked={selectedTs.includes(elm._id)}
                />
              }
              onClick={() => toggleSelect(elm._id)}
            >
              <Text fz="sm" truncate="end">
                {elm.name}
              </Text>
            </Menu.Item>
          ))}
        </Stack>
        <Divider />
        <Group justify="space-between" px="xs" py="6px" gap="xs">
          <Group gap={4}>
            <Button size="compact-xs" variant="subtle" color="gray" onClick={onSelectAll}>
              All
            </Button>
            <Button size="compact-xs" variant="subtle" color="gray" onClick={onClear}>
              None
            </Button>
          </Group>
          <Button size="compact-xs" onClick={onApply}>
            Apply
          </Button>
        </Group>
      </Menu.Dropdown>
    </Menu>
  );
};

const LabelingSelection = ({ navigate }) => {
  const { labelings, activeLabeling, setActiveLabeling } =
    useContext(DatasetContext);

  return (
    <Menu withinPortal position="bottom-start">
      <Menu.Target>
        <Button variant="default" radius="md">
          <FontAwesomeIcon icon={faTags} className="dsp-toolbar-icon" />
          <Box mx={6} fz="sm" fw={600}>
            Labeling
          </Box>
          <Text fz="sm" c="dimmed" maw={180} truncate="end">
            {activeLabeling?.name || "None"}
          </Text>
        </Button>
      </Menu.Target>
      <Menu.Dropdown w={260}>
        <Stack gap={0} p="4px" maw={260}>
          {labelings.map((elm) => (
            <Menu.Item
              key={elm._id}
              fw={activeLabeling?._id === elm._id ? 700 : undefined}
              rightSection={
                activeLabeling?._id === elm._id ? (
                  <Badge size="sm" variant="light" color="teal">
                    active
                  </Badge>
                ) : null
              }
              onClick={() => setActiveLabeling(elm)}
            >
              <Text fz="sm" truncate="end">
                {elm.name}
              </Text>
            </Menu.Item>
          ))}
        </Stack>
        <Divider />
        <Menu.Item fw={700} onClick={() => navigate("labelings/new")}>
          + Add Labeling Set
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const LabelingSelectionPanel = () => {
  const { dataset } = useContext(DatasetContext);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { registerDatasetDownload } = useContext(NotificationContext);

  const navigate = useProjectRouter();

  return (
    <div className="dsp-toolbar-wrap">
      <Group
        justify="space-between"
        wrap="nowrap"
        px="sm"
        py={6}
        className="dsp-toolbar"
      >
        <Group gap="xs" wrap="nowrap">
          <TimeSeriesSelection />
          <LabelingSelection navigate={navigate} />
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Download dataset" withinPortal>
            <ActionIcon
              id="btn-secondary"
              aria-label="Download dataset"
              variant="default"
              radius="md"
              w={30}
              h={30}
              onClick={() => registerDatasetDownload(dataset)}
            >
              <FontAwesomeIcon icon={faDownload} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Help & shortcuts" withinPortal>
            <ActionIcon
              id="buttonOpenHelpModal"
              aria-label="Open help"
              variant="default"
              radius="md"
              w={30}
              h={30}
              onClick={() => setIsHelpModalOpen(true)}
            >
              <FontAwesomeIcon icon={faQuestion} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      {isHelpModalOpen ? (
        <HelpModal isOpen onCloseModal={() => setIsHelpModalOpen(false)} />
      ) : null}
    </div>
  );
};

export default LabelingSelectionPanel;
