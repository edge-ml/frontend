import { Modal } from "@mantine/core";
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
      <DragDrop
        style={{ height: "100px", marginTop: "0.5rem", marginBottom: "0.5rem" }}
        onFileInput={onFileInput}
      />
      <EdgeMLTable>
        <EdgeMLTableHeader>Selected files</EdgeMLTableHeader>
        {files.map((file) => {
          return (
            <EdgeMLTableEntry key={file.name}>
              <FileList file={file}></FileList>
            </EdgeMLTableEntry>
          );
        })}
      </EdgeMLTable>
    </Modal>
  );
};

export default UploadDatasetModal;
