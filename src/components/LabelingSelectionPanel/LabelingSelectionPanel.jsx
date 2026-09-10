import React, { useState, useMemo, useContext } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox as MantineCheckbox,
  Divider,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  TextInput,
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
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import useProjectRouter from "../../Hooks/ProjectRouter";
import { DatasetContext } from "../../routes/dataset/DatasetContext";

import "./LabelingSelectionPanel.css";

const TimeSeriesSelection = () => {
  const { activeTimeSeries, setActiveTimeSeries, dataset } =
    useContext(DatasetContext);
  const [search, setSearch] = useState("");

  const activeIds = useMemo(
    () => new Set(activeTimeSeries.map((elm) => elm._id)),
    [activeTimeSeries]
  );

  // Toggle in real time — charts update immediately, no Apply step. Rebuild
  // from dataset.timeSeries so the active set always keeps the dataset order.
  const toggle = (id) => {
    const next = new Set(activeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setActiveTimeSeries(dataset.timeSeries.filter((ts) => next.has(ts._id)));
  };

  const onSelectAll = () => setActiveTimeSeries(dataset.timeSeries);
  const onClear = () => setActiveTimeSeries([]);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? dataset.timeSeries.filter((ts) => ts.name.toLowerCase().includes(query))
    : dataset.timeSeries;

  return (
    <Menu
      withinPortal
      position="bottom-start"
      closeOnItemClick={false}
      keepMounted={false}
    >
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
      <Menu.Dropdown w={300}>
        <Box px="6px" pt="6px">
          <TextInput
            size="xs"
            placeholder="Search time series…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            // Keep the Menu's arrow/typeahead handling from hijacking typing,
            // but let Escape bubble up so it still closes the menu.
            onKeyDown={(e) => {
              if (e.key !== "Escape") e.stopPropagation();
            }}
            leftSection={
              <FontAwesomeIcon icon={faMagnifyingGlass} size="xs" />
            }
          />
        </Box>
        <ScrollArea.Autosize mah={280} type="auto">
          <Stack gap={0} p="4px">
            {filtered.length === 0 ? (
              <Text fz="sm" c="dimmed" ta="center" py="sm">
                No matching time series
              </Text>
            ) : (
              filtered.map((elm) => (
                <Menu.Item
                  key={elm._id}
                  leftSection={
                    <MantineCheckbox
                      size="xs"
                      readOnly
                      tabIndex={-1}
                      checked={activeIds.has(elm._id)}
                    />
                  }
                  onClick={() => toggle(elm._id)}
                >
                  <Text fz="sm" truncate="end">
                    {elm.name}
                  </Text>
                </Menu.Item>
              ))
            )}
          </Stack>
        </ScrollArea.Autosize>
        <Divider />
        <Group justify="space-between" px="xs" py="6px" gap="xs">
          <Text fz="xs" c="dimmed">
            {activeTimeSeries.length} of {dataset.timeSeries.length} shown
          </Text>
          <Group gap={4}>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              onClick={onSelectAll}
            >
              All
            </Button>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              onClick={onClear}
            >
              None
            </Button>
          </Group>
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
