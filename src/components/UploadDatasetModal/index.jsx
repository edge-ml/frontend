import { Modal, Stack, Text } from "@mantine/core";
import DragDrop from "../Common/DragDrop";
import FileList from "./FileList";
import { useState } from "react";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../Common/EdgeMLTable";

const UploadDatasetModal = ({ isOpen, onCloseModal, onDatasetComplete }) => {
  const [files, setFiles] = useState([]);

  const onFileInput = (fileList) => {
    setFiles([...fileList]);
  };

  return (
    <Modal opened={isOpen} onClose={onCloseModal} size="xl" title="Upload">
      <Stack gap="md">
        <DragDrop style={{ height: "100px" }} onFileInput={onFileInput} />
        <EdgeMLTable>
          <EdgeMLTableHeader>
            <Text fw={600}>Selected files</Text>
          </EdgeMLTableHeader>
          {files.map((file) => {
            return (
              <EdgeMLTableEntry key={file.name}>
                <FileList file={file}></FileList>
              </EdgeMLTableEntry>
            );
          })}
        </EdgeMLTable>
      </Stack>
    </Modal>
  );
};

export default UploadDatasetModal;
