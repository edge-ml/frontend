import React, { useState, useContext, Fragment } from "react";
import { Button, Menu } from "@mantine/core";
import "./LabelingSelectionPanel.css";

import HelpModal from "./HelpModal";

import NotificationContext from "../NotificationHandler/NotificationProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faQuestion } from "@fortawesome/free-solid-svg-icons";

import Checkbox from "../Common/Checkbox";
import useProjectRouter from "../../Hooks/ProjectRouter";
import { LabelingContext } from "../../routes/dataset/LabelingContext";
import { DatasetContext } from "../../routes/dataset/DatasetContext";

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
  const { registerDatasetDownload } = useContext(NotificationContext);

  const [selectedTs, setSelectedTs] = useState(
    activeTimeSeries.map((elm) => elm._id)
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
        dataset.timeSeries.find((elm) => elm._id === select_id)
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
      <div>
        <Menu>
          <Menu.Target>
            <Button
              variant="outline"
              color="gray"
              style={{ marginRight: "0.5rem" }}
            >
              Selected Timeseries:{" "}
              <span style={{ fontWeight: "normal" }}>
                {activeTimeSeries.length + "/" + dataset.timeSeries.length}
              </span>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <div className="scrollable-dropdown">
              {dataset.timeSeries.map((elm) => {
                return (
                  <Menu.Item key={elm._id}>
                    <div
                      onClick={(e) => {
                        onClickSelectSeries(elm._id);
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Checkbox isSelected={selectedTs.includes(elm._id)} />
                      <div style={{ marginLeft: "0.5rem" }}>{elm.name}</div>
                    </div>
                  </Menu.Item>
                );
              })}
            </div>
            <Menu.Divider />
            <div style={{ padding: "0.5rem" }}>
              <Button
                fullWidth
                variant="outline"
                color="blue"
                onClick={(e) => {
                  onApplyTs(e);
                }}
              >
                Apply
              </Button>
            </div>
          </Menu.Dropdown>
        </Menu>
      </div>
    );
  };

  const name = activeLabeling && activeLabeling.name;

  return (
    <div>
      <div className="LabelingSelectionPanel p-1">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex" }}>
            <TimeSeriesSelection />
            <Menu>
              <Menu.Target>
                <Button variant="outline" color="gray">
                  {activeLabeling ? "Select Labeling: " : "Selected Labeling: "}
                  <span style={{ fontWeight: "normal" }}>{name || "None"}</span>
                </Button>
              </Menu.Target>
              <Menu.Dropdown className="scrollable-dropdown">
                {labelings.map((elm) => (
                  <Menu.Item
                    key={elm._id}
                    onClick={() => setActiveLabeling(elm)}
                  >
                    {elm.name}
                  </Menu.Item>
                ))}
                <Menu.Divider />
                <Menu.Item
                  style={{ fontWeight: 700 }}
                  onClick={() => navigate("labelings/new")}
                >
                  + Add Labeling Set
                </Menu.Item>
                {activeLabeling ? null : (
                  <Fragment>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      onClick={() => setActiveLabeling(undefined)}
                    >
                      Hide Labels
                    </Menu.Item>
                  </Fragment>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="outline"
            id="btn-secondary"
            style={{ margin: "0.25rem" }}
            onClick={downloadDataSet}
          >
            <FontAwesomeIcon icon={faDownload} />
          </Button>
          <Button
            variant="outline"
            id="buttonOpenHelpModal"
            style={{ margin: "0.25rem" }}
            color="cyan"
            onClick={toggleHelpModal}
          >
            <FontAwesomeIcon icon={faQuestion} />
          </Button>
        </div>
      </div>
      <div className="bottom-line"></div>
      {isHelpModalOpen ? (
        <HelpModal isOpen={isHelpModalOpen} onCloseModal={toggleHelpModal} />
      ) : null}
    </div>
  );
};

export default LabelingSelectionPanel;
