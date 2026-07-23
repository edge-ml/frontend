import React, { useState } from "react";
import Checkbox from "../../components/Common/Checkbox";
import { Button, Group, Text, Table } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import DeleteModal from "../../components/Common/DeleteModal";
import ModelTableEntry from "./ModelTableEntry";
import { Empty } from "../export/components/Empty";

const ModelTable = ({ models, stepOptions, updateModel, deleteModels, onCreate }) => {
  const [selectedModels, setSelectedModels] = useState([]);
  const [modelsToDelete, setModelsToDelete] = useState([]);

  const onSelectAll = () => {
    const allSelected = models.length === selectedModels.length;
    if (allSelected) {
      setSelectedModels([]);
    } else {
      setSelectedModels(models);
    }
  };

  const clickCheckBox = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((elm) => elm._id !== model._id)
        : [...prev, model]
    );
  };

  const onDeleteModels = (models) => {
    setModelsToDelete(models);
  };

  return (
    <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2 flex-grow-1">
      <Group justify="space-between" mb="xs">
        <Text fw={700} size="xl">
          MODELS
        </Text>
        <Button variant="outline" size="sm" onClick={onCreate}>
          Train a model
        </Button>
      </Group>
      {models.length > 0 ? (
        <Table className="mt-3">
          <Table.Thead>
            <Table.Tr style={{ borderBottom: "2px solid rgb(230, 230, 234)" }}>
              <Table.Th colSpan={4} p={0}>
                <Group
                  justify="space-between"
                  style={{
                    background: "rgb(249, 251, 252)",
                    padding: "10px",
                  }}
                >
                  <Group gap="xs" p="xs">
                    <Checkbox
                      isSelected={models.length === selectedModels.length}
                      onClick={onSelectAll}
                    />
                    <Button
                      id="deleteDatasetsButton"
                      variant="outline"
                      color="red"
                      size="sm"
                      disabled={selectedModels.length === 0}
                      onClick={() =>
                        onDeleteModels(
                          selectedModels.map((elm) =>
                            models.find((model) => model._id === elm._id)
                          )
                        )
                      }
                    >
                      <FontAwesomeIcon className="me-2" icon={faTrashAlt} />
                      Delete
                    </Button>
                  </Group>
                </Group>
              </Table.Th>
            </Table.Tr>
            <Table.Tr>
              <Table.Th w={40}></Table.Th>
              <Table.Th>Model</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th w={110}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {models.map((model) => (
              <ModelTableEntry
                key={"model_table_entry" + model._id}
                model={model}
                stepOptions={stepOptions}
                selectedModels={selectedModels.map((m) => m._id)}
                clickCheckBox={clickCheckBox}
                onDeleteModels={onDeleteModels}
                updateModel={updateModel}
              />
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Empty>No models trained yet</Empty>
      )}
      <DeleteModal
        isOpen={!!modelsToDelete.length}
        onCancel={() => setModelsToDelete([])}
        onDelete={() => {
          deleteModels(modelsToDelete);
          setModelsToDelete([]);
        }}
      >
        {modelsToDelete.map((model) => (
          <div key={model._id}>
            <b>{model.name}</b>
          </div>
        ))}
      </DeleteModal>
    </div>
  );
};

export default ModelTable;
