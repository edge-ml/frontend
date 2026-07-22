import React, { useState } from "react";
import Checkbox from "../../components/Common/Checkbox";
import { Button, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import DeleteModal from "../../components/Common/DeleteModal";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../components/Common/EdgeMLTable";
import ModelTableEntry from "./ModelTableEntry";

const ModelTable = ({ models, stepOptions, updateModel, deleteModels }) => {
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
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <Group gap="xs" ml="sm">
          <Checkbox
            isSelected={models.length === selectedModels.length}
            onClick={onSelectAll}
          />
          <Button
            className="btn-delete"
            id="deleteDatasetsButton"
            size="compact-sm"
            variant="outline"
            color="red"
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
      </EdgeMLTableHeader>
      {models.map((model) => (
        <EdgeMLTableEntry key={"model_table_entry" + model._id}>
          <ModelTableEntry
            model={model}
            stepOptions={stepOptions}
            selectedModels={selectedModels.map((m) => m._id)}
            clickCheckBox={clickCheckBox}
            onDeleteModels={onDeleteModels}
            updateModel={updateModel}
          />
        </EdgeMLTableEntry>
      ))}
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
    </EdgeMLTable>
  );
};

export default ModelTable;
