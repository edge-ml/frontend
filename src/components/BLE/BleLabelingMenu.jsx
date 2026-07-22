import React, { useState } from "react";
import { Card, Menu, Button, Badge } from "@mantine/core";
import LabelBadge from "../Common/LabelBadge";

export const BleLabelingMenu = ({
  labelings,
  selectedLabeling,
  handleSelectLabeling,
  shortcutKeys,
}) => {

  return (
    <div style={{ margin: "0.5rem" }}>
      <div className="header-wrapper d-flex justify-content-between align-content-center ">
        <h4>4. Labelings</h4>
        <Menu>
          <Menu.Target>
            <Button variant="outline" color="blue">
              Labelings
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {labelings.map((labeling) => (
              <Menu.Item
                key={labeling.name}
                onClick={(e) => handleSelectLabeling(labeling)}
              >
                {labeling.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
      <div className="body-wrapper p-3 d-flex flex-column">
        {selectedLabeling ? <h5>Labels in {selectedLabeling.name}:</h5> : null}
        <div className="d-flex mb-2 flex-wrap">
          {selectedLabeling &&
            selectedLabeling.labels.map((label, labelIdx) => (
              <div
                key={label._id}
                className="d-flex flex-column align-items-center me-1"
              >
                <LabelBadge color={label.color}> {label.name}</LabelBadge>
                <span>{shortcutKeys[labelIdx]}</span>
              </div>
            ))}
        </div>
        <span>To start/stop labeling the data during recording:</span>
        <span>
          Press the shortcut key on the keyboard which corresponds the desired
          label.
        </span>
      </div>
    </div>
  );
};
