import React, { useContext, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { DatasetContext } from "../DatasetContext";
import { UploadDatasetModal } from "../../../components/UploadDatasetModal/UploadDatasetModal";

// Adds sensor data (CSV), audio or video to the open dataset, with the same
// dialog that creates datasets.
const AddMediaButton = () => {
  const { dataset, refreshDataset } = useContext(DatasetContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip label="Add sensor data, audio or video" withinPortal>
        <ActionIcon
          aria-label="Add data"
          variant="default"
          radius="md"
          w={30}
          h={30}
          onClick={() => setOpen(true)}
        >
          <FontAwesomeIcon icon={faFileCirclePlus} />
        </ActionIcon>
      </Tooltip>
      {open ? (
        <UploadDatasetModal
          isOpen
          targetDataset={dataset}
          onCloseModal={() => setOpen(false)}
          onDatasetComplete={refreshDataset}
        />
      ) : null}
    </>
  );
};

export default AddMediaButton;
