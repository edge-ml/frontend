import { Modal, Table } from "@mantine/core";
import DragDrop from "../Common/DragDrop";
import FileList from "./FileList";
import { useState } from "react";

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
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Selected files</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {files.map((file) => (
            <Table.Tr key={file.name}>
              <Table.Td>
                <FileList file={file} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Modal>
  );
};

export default UploadDatasetModal;
