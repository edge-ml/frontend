import React from "react";
import {
  faTrashAlt,
  faDownload,
  faMicrochip,
  faPlay,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "reactstrap";
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
    <Button {...props} className="btn-edit ms-2 my-2" onClick={onClickStop}>
      <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
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
  setDeployModalOpen
}) => {
  const navigateTo = useProjectRouter();

  return (
    <>
      {model.trainStatus === "done" && !model.error && (
        <>
          <ListButton
            color="info"
            outline
            icon={faInfoCircle}
            onClick={() => setModalModel(model)}
          >
            Info
          </ListButton>
          <ListButton
            color="primary"
            outline
            icon={faPlay}
            onClick={() => navigateTo("models/live/" + model.id)}
          >
            View live
          </ListButton>
          <ListButton
            color="primary"
            outline
            icon={faMicrochip}
            onClick={() => {
              setDeployModalOpen(true);
            }}
            disabled={!checkExportC(model, stepOptions)}
          >
            Deploy
          </ListButton>
          <ListButton
            color="primary"
            outline
            icon={faDownload}
            onClick={() => setModelDownload(model)}
          >
            Download
          </ListButton>
        </>
      )}
      <ListButton
        color="danger"
        outline
        icon={faTrashAlt}
        onClick={() => onDeleteSingleModel(model)}
      >
        Delete
      </ListButton>
    </>
  );
};

export default ButtonList;
