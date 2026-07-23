import React, { useState } from "react";
import { Button } from "@mantine/core";
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
    <div>
      {labeling &&
        labeling.labels.map((label, index) => (
          <Button
            className="m-1 labelingButton"
            style={{
              backgroundColor:
                label._id === selectedLabelTypeId ? label.color : "white",
              color:
                label._id === selectedLabelTypeId
                  ? hexToForegroundColor(label.color)
                  : label.color,
            }}
            onClick={() => setSelectedLabelTypeId(label._id)}
            key={index}
          >
            {label.name} {"(" + (index + 1) + ")"}
          </Button>
        ))}
    </div>
  );
};

const TimeDisplay = ({ from, to }) => {
  const formatTime = (timestamp) =>
    Number.isFinite(timestamp)
      ? new Date(timestamp).toUTCString().split(" ")[4]
      : "--:--:--";

  return (
    <div style={{ margin: "0 0.5rem" }}>
      <small>
        <div style={{ display: "flex", justifyContent: "center", fontWeight: 700 }}>
          Selected Label
        </div>
      </small>
      <div style={{ display: "flex", alignItems: "center" }}>
        <small>
          <div className="monospace text-sm">
            {formatTime(from)}
          </div>
        </small>
        <small>
          <div style={{ margin: "0 0.25rem" }} className="monospace">-</div>
        </small>
        <small>
          <div className="monospace">
            {formatTime(to)}
          </div>
        </small>
      </div>
    </div>
  );
};

const LabelingPanel = () => {
  const {
    hideLabels,
    onDeleteSelectedLabel,
    selectedLabel,
    activeLabeling,
    selectedLabelTypeId,
    setSelectedLabelTypeId,
  } = useContext(DatasetContext);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div>
      <div className="labelingPanelBorder"></div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem" }}>
        {!hideLabels ? (
          <div style={{ display: "flex" }}>
            <LabelButtonView
              labeling={activeLabeling}
              selectedLabelTypeId={selectedLabelTypeId}
              setSelectedLabelTypeId={setSelectedLabelTypeId}
            />
          </div>
        ) : (
          <div></div>
        )}
        <div style={{ display: "flex" }}>
          <TimeDisplay
            from={selectedLabel && selectedLabel.start}
            to={selectedLabel && selectedLabel.end}
          />
          <Button
            disabled={selectedLabel === undefined}
            className="deleteButton m-1"
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
        </div>
      </div>
    </div>
  );
};

export default LabelingPanel;
