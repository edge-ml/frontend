import React, { useState } from "react";
import { Button } from "reactstrap";
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
            onClick={(e) => setSelectedLabelTypeId(label._id)}
            key={index}
          >
            {label.name} {"(" + (index + 1) + ")"}
          </Button>
        ))}
    </div>
  );
};

const TimeDisplay = ({ from, to }) => {
  return (
    <div className="mx-2">
      <small>
        <div className="d-flex justify-content-center fw-bold">
          Selected Label
        </div>
      </small>
      <div className="d-flex align-items-center">
        <small>
          <div className="monospace text-sm">
            {new Date(from).toUTCString().split(" ")[4]}
          </div>
        </small>
        <small>
          <div className="mx-1 monospace">-</div>
        </small>
        <small>
          <div className="monospace">
            {new Date(to).toUTCString().split(" ")[4]}
          </div>
        </small>
      </div>
    </div>
  );
};

const LabelingPanel = ({ }) => {


  const { hideLabels,
    onAddLabel,
    onDeleteSelectedLabel,
    selectedLabel,
    activeLabeling,
    selectedLabelTypeId,
    setSelectedLabelTypeId } = useContext(DatasetContext);


  const handleLabelTypeClicked = (e, id) => {
    e.preventDefault();
    onSelectedLabelTypeIdChanged(id);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div>
      <div className="labelingPanelBorder"></div>
      <div className="d-flex justify-content-between p-1">
        {!hideLabels ? (
          <div className="d-flex">
            <LabelButtonView
              labeling={activeLabeling}
              selectedLabelTypeId={selectedLabelTypeId}
              setSelectedLabelTypeId={setSelectedLabelTypeId}
            ></LabelButtonView>
          </div>
        ) : (
          <div></div>
        )}
        <div className="d-flex">
          <TimeDisplay from={selectedLabel && selectedLabel.start} to={selectedLabel && selectedLabel.end}></TimeDisplay>
          <Button
            disabled={selectedLabel === undefined}
            className="deleteButton m-1"
            outline
            color="danger"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </Button>
          <DeleteModal
            isOpen={deleteModalOpen}
            onCancel={() => setDeleteModalOpen(false)}
            onDelete={() => { onDeleteSelectedLabel(); setDeleteModalOpen(false) }}
          >
            <div>SelectedLabel</div>
          </DeleteModal>
        </div>
      </div>
    </div>
  );
};

export default LabelingPanel;
