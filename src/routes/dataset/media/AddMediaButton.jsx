import React, { useContext, useRef, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { DatasetContext } from "../DatasetContext";
import { uploadMediaWithNotification } from "./mediaUpload";
import { ACCEPTED_MEDIA } from "./mediaUtils";

// Adds audio or video files to the open dataset.
const AddMediaButton = () => {
  const { dataset, refreshDataset } = useContext(DatasetContext);
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const upload = async (files) => {
    setUploading(true);
    for (const file of files) {
      const added = await uploadMediaWithNotification(
        dataset._id,
        file,
        "It was placed at the start of the dataset. Use Align in its menu to move it."
      );
      if (added) await refreshDataset();
    }
    setUploading(false);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={ACCEPTED_MEDIA}
        data-testid="add-media-input"
        onChange={(event) => {
          const files = [...event.target.files];
          event.target.value = "";
          if (files.length > 0) upload(files);
        }}
      />
      <Tooltip label="Add audio or video" withinPortal>
        <ActionIcon
          aria-label="Add audio or video"
          variant="default"
          radius="md"
          w={30}
          h={30}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <FontAwesomeIcon icon={faPhotoFilm} />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default AddMediaButton;
