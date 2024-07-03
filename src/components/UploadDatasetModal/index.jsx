import { Modal, ModalBody, ModalHeader } from "reactstrap";
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
    <Modal isOpen={isOpen} size="xl">
      <ModalHeader>Upload</ModalHeader>
      <ModalBody>
        <DragDrop
          style={{ height: "100px" }}
          className="my-2"
          onFileInput={onFileInput}
        />
        <EdgeMLTable>
          <EdgeMLTableHeader>Selected files</EdgeMLTableHeader>
          {files.map((file) => {
            return (
              <EdgeMLTableEntry>
                <FileList file={file}></FileList>
              </EdgeMLTableEntry>
            );
          })}
        </EdgeMLTable>
      </ModalBody>
    </Modal>
  );
};

export default UploadDatasetModal;
