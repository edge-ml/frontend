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
import { canDownload, canDeployEmbedded } from "../../components/Common/modelExport";

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
  setDeployModalOpen
}) => {
  const navigateTo = useProjectRouter();
  const deployable = canDeployEmbedded(model);
  const downloadable = canDownload(model);

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
            onClick={() => navigateTo("models/live/" + model._id)}
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
            disabled={!deployable}
            title={
              deployable
                ? "Deploy to an embedded device"
                : "Only models exportable to C can be deployed to embedded devices"
            }
          >
            Deploy
          </ListButton>
          <ListButton
            color="primary"
            outline
            icon={faDownload}
            onClick={() => setModelDownload(model)}
            disabled={!downloadable}
            title={
              downloadable
                ? "Download the model"
                : "This model runs on the server only; there is nothing to download"
            }
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
