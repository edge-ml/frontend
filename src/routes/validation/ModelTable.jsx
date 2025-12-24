import React, { useState } from "react";
import { Button, Checkbox, Group } from "@mantine/core";
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

  const clickCheckBox = (model_id) => {
    if (selectedModels.includes(model_id)) {
      setSelectedModels(selectedModels.filter((elm) => elm != model_id));
    } else {
      setSelectedModels([...selectedModels, model_id]);
    }
  };

  const onDeleteModels = (models) => {
    setModelsToDelete(models);
  };

  return (
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <Group align="center" gap="sm">
          <Checkbox
            checked={models.length === selectedModels.length}
            onChange={onSelectAll}
          />
          <Button
            id="deleteDatasetsButton"
            size="xs"
            variant="outline"
            color="red"
            onClick={() => {
              onDeleteModels(
                selectedModels.map((elm) =>
                  models.find((model) => model.id === elm.id)
                )
              );
            }}
          >
            <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
            Delete
          </Button>
        </Group>
      </EdgeMLTableHeader>
      {models.map((model, index) => {
        return (
          <EdgeMLTableEntry key={"model_table_entry" + model.id}>
            <ModelTableEntry
              model={model}
              stepOptions={stepOptions}
              selectedModels={selectedModels}
              clickCheckBox={clickCheckBox}
              onDeleteModels={onDeleteModels}
              updateModel={updateModel}
            ></ModelTableEntry>
          </EdgeMLTableEntry>
        );
      })}
      <DeleteModal
        isOpen={!!modelsToDelete.length}
        onCancel={() => setModelsToDelete([])}
        onDelete={() => {
          deleteModels(modelsToDelete);
          setModelsToDelete([]);
        }}
      >
        {modelsToDelete.map((model) => (
          <div key={model.id}>
            <b>{model.name}</b>
          </div>
        ))}
      </DeleteModal>
    </EdgeMLTable>
  );
};

export default ModelTable;
