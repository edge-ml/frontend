import React, { useState, useContext, Fragment } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  Menu,
  ScrollArea,
  Text,
} from "@mantine/core";
import "./LabelingSelectionPanel.css";

import HelpModal from "./HelpModal";

import NotificationContext from "../NotificationHandler/NotificationProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faQuestion } from "@fortawesome/free-solid-svg-icons";

import Checkbox from "../Common/Checkbox";
import useProjectRouter from "../../Hooks/ProjectRouter";
import { LabelingContext } from "../../routes/dataset/LabelingContext";
import { DatasetContext } from "../../routes/dataset/DatasetContext";

const hideLabelsSymbol = "hide labels" + Math.floor(Math.random() * 1000);

const LabelingSelectionPanel = () => {
  const {
    activeTimeSeries,
    setActiveTimeSeries,
    dataset,
    labelings,
    activeLabeling,
    setActiveLabeling,
  } = useContext(DatasetContext);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isTSDropdownOpen, setIsTSDropdownOpen] = useState(false);
  const { registerDatasetDownload } = useContext(NotificationContext);

  const [selectedTs, setSelectedTs] = useState(
    activeTimeSeries.map((elm) => elm.id)
  );

  const navigate = useProjectRouter();

  const toggleHelpModal = () => {
    setIsHelpModalOpen(!isHelpModalOpen);
  };

  const downloadDataSet = () => {
    registerDatasetDownload(dataset);
  };

  const onApplyTs = () => {
    setActiveTimeSeries(
      selectedTs.map((select_id) =>
        dataset.timeSeries.find((elm) => elm.id === select_id)
      )
    );
  };

  const onClickSelectSeries = (elm_id) => {
    if (selectedTs.includes(elm_id)) {
      const idx = selectedTs.indexOf(elm_id);
      const arr = [...selectedTs];
      arr.splice(idx, 1);
      setSelectedTs(arr);
    } else {
      const arr = [...selectedTs];
      arr.push(elm_id);
      setSelectedTs(arr);
    }
  };

  const TimeSeriesSelection = () => {
    return (
      <Menu opened={isTSDropdownOpen} onChange={setIsTSDropdownOpen}>
        <Menu.Target>
          <Button
            variant="outline"
            color="gray"
            onClick={() => setIsTSDropdownOpen(!isTSDropdownOpen)}
            mr="sm"
          >
            Selected Timeseries:{" "}
            <Text component="span" fw={400}>
              {activeTimeSeries.length + "/" + dataset.timeSeries.length}
            </Text>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <ScrollArea h={200}>
            <Box>
              {dataset.timeSeries.map((elm) => {
                return (
                  <Box key={elm.id} p="xs">
                    <Box
                      onClick={(e) => {
                        onClickSelectSeries(elm.id);
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Group align="center" gap="xs">
                        <Checkbox isSelected={selectedTs.includes(elm.id)} />
                        <Text>{elm.name}</Text>
                      </Group>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </ScrollArea>
          <Divider my="sm" />
          <Button
            fullWidth
            variant="outline"
            color="blue"
            onClick={(e) => {
              onApplyTs(e);
              setIsTSDropdownOpen(false);
            }}
          >
            Apply
          </Button>
        </Menu.Dropdown>
      </Menu>
    );
  };

  const name = activeLabeling && activeLabeling.name;

  return (
    <div>
      <Group className="LabelingSelectionPanel" p="xs" justify="space-between">
        <Group align="center">
          <TimeSeriesSelection />
          <Menu>
            <Menu.Target>
              <Button variant="outline" color="gray">
                {activeLabeling ? "Select Labeling: " : "Selected Labeling: "}
                <Text component="span" fw={400}>
                  {name || "None"}
                </Text>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <ScrollArea h={200}>
                <Box>
                  {labelings.map((elm) => (
                    <Menu.Item key={elm.id} onClick={() => setActiveLabeling(elm)}>
                      {elm.name}
                    </Menu.Item>
                  ))}
                </Box>
              </ScrollArea>
              <Divider my="sm" />
              <Menu.Item onClick={() => navigate("labelings/new")}>
                <Text fw={700}>+ Add Labeling Set</Text>
              </Menu.Item>
              {activeLabeling ? null : (
                <>
                  <Divider my="sm" />
                  <Menu.Item c="red" onClick={() => setActiveLabeling(undefined)}>
                    Hide Labels
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Group align="center">
          <Button variant="outline" id="btn-secondary" onClick={downloadDataSet}>
            <FontAwesomeIcon icon={faDownload} />
          </Button>
          <Button
            variant="outline"
            id="buttonOpenHelpModal"
            color="cyan"
            onClick={toggleHelpModal}
          >
            <FontAwesomeIcon icon={faQuestion} />
          </Button>
        </Group>
      </Group>
      <div className="bottom-line"></div>
      {isHelpModalOpen ? (
        <HelpModal isOpen={isHelpModalOpen} onCloseModal={toggleHelpModal} />
      ) : null}
    </div>
  );
};

export default LabelingSelectionPanel;
