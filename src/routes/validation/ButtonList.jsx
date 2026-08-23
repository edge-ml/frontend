import React from "react";
import {
  faTrashAlt,
  faDownload,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { canDownload, canDeployEmbedded } from "../../components/Common/modelExport";

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
  setDeployModalOpen,
}) => {
  // Deploy stays hidden for now: embedded-only (flashes the model onto a BLE
  // microcontroller via canDeployEmbedded). Restore when needed.
  const deployable = canDeployEmbedded(model);
  void deployable;
  void setDeployModalOpen;
  const downloadable = canDownload(model);

  return (
    <>
      {model.trainStatus === "done" && !model.error && (
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
        color="red"
        variant="outline"
        icon={faTrashAlt}
        onClick={() => onDeleteSingleModel(model)}
      >
        Delete
      </ListButton>
    </>
  );
};

export default ButtonList;
