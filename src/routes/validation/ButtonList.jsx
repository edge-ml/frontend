import React from "react";
import {
  faTrashAlt,
  faDownload,
  faMicrochip,
  faPlay,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@mantine/core";
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
  const onClickStop = (e) => {
    onClick(e);
    e.stopPropagation();
  };

  return (
    <Button
      {...props}
      size="xs"
      variant="outline"
      onClick={onClickStop}
      leftSection={<FontAwesomeIcon icon={icon} />}
    >
      {children}
    </Button>
  );
};

const ButtonList = ({
  model,
  setModalModel,
  setModelDownload,
  onDeleteSingleModel,
  stepOptions,
  setDeployModalOpen
}) => {
  const navigateTo = useProjectRouter();

  return (
    <>
      {model.trainStatus === "done" && !model.error && (
        <>
          <ListButton
            color="blue"
            icon={faInfoCircle}
            onClick={() => setModalModel(model)}
          >
            Info
          </ListButton>
          <ListButton
            color="blue"
            icon={faPlay}
            onClick={() => navigateTo("models/live/" + model.id)}
          >
            View live
          </ListButton>
          <ListButton
            color="blue"
            icon={faMicrochip}
            onClick={() => {
              setDeployModalOpen(true);
            }}
            disabled={!checkExportC(model, stepOptions)}
          >
            Deploy
          </ListButton>
          <ListButton
            color="blue"
            icon={faDownload}
            onClick={() => setModelDownload(model)}
          >
            Download
          </ListButton>
        </>
      )}
      <ListButton
        color="red"
        icon={faTrashAlt}
        onClick={() => onDeleteSingleModel(model)}
      >
        Delete
      </ListButton>
    </>
  );
};

export default ButtonList;
