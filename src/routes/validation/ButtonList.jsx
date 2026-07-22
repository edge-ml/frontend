import React from "react";
import {
  faTrashAlt,
  faDownload,
  faMicrochip,
  faPlay,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useProjectRouter from "../../Hooks/ProjectRouter";

const checkExportC = (model, stepOptions) => {
  if (!stepOptions) return false;
  return model.pipeline.selectedPipeline.steps.every((step) => {
    const stepOption = stepOptions.find(
      (elm) => elm.name === step.options.name
    );
    if (!stepOption) return false;
    if (!["PRE", "CORE"].includes(stepOption.type)) return true;
    return (
      ["PRE", "CORE"].includes(stepOption.type) &&
      stepOption.platforms.includes("C")
    );
  });
};

const ListButton = ({ onClick, icon, children, ...props }) => {
  return (
    <Button
      {...props}
      className="ms-2 my-2"
      onClick={(e) => {
        onClick(e);
        e.stopPropagation();
      }}
    >
      <FontAwesomeIcon icon={icon} />
      <div>
        <small>{children}</small>
      </div>
    </Button>
  );
};

const ButtonList = ({
  model,
  setModalModel,
  setModelDownload,
  onDeleteSingleModel,
  stepOptions,
  setDeployModalOpen,
}) => {
  const navigateTo = useProjectRouter();
  const canExport = model.trainStatus === "done" && !model.error;

  return (
    <Button.Group>
      {canExport && (
        <>
          <ListButton
            color="cyan"
            variant="outline"
            icon={faInfoCircle}
            onClick={() => setModalModel(model)}
          >
            Info
          </ListButton>
          <ListButton
            color="blue"
            variant="outline"
            icon={faPlay}
            onClick={() => navigateTo("models/live/" + model._id)}
          >
            View live
          </ListButton>
          <Tooltip
            label="Selected pipeline doesn't support C export"
            disabled={checkExportC(model, stepOptions)}
          >
            <ListButton
              color="blue"
              variant="outline"
              icon={faMicrochip}
              onClick={() => setDeployModalOpen(true)}
              disabled={!checkExportC(model, stepOptions)}
            >
              Deploy
            </ListButton>
          </Tooltip>
          <ListButton
            color="blue"
            variant="outline"
            icon={faDownload}
            onClick={() => setModelDownload(model)}
          >
            Download
          </ListButton>
        </>
      )}
      <ListButton
        color="red"
        variant="outline"
        icon={faTrashAlt}
        onClick={() => onDeleteSingleModel(model)}
      >
        Delete
      </ListButton>
    </Button.Group>
  );
};

export default ButtonList;
