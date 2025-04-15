import React, { useState } from "react";
import Checkbox from "../../components/Common/Checkbox";
import { Button } from "reactstrap";
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
  }

  return (
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <div className="ml-0 me-0 ml-md-2 me-md-3 d-flex align-items-center">
          <Checkbox
            isSelected={models.length == selectedModels.length}
            onClick={onSelectAll}
          ></Checkbox>
          <Button
            className="btn-delete ms-2"
            id="deleteDatasetsButton"
            size="sm"
            outline
            color="danger"
            onClick={() => {
              onDeleteModels(
                selectedModels.map((elm) =>
                  models.find((model) => model._id === elm._id)
                )
              );
            }}
          >
            <FontAwesomeIcon
              className="me-2"
              icon={faTrashAlt}
            ></FontAwesomeIcon>
            Delete
          </Button>
        </div>
      </EdgeMLTableHeader>
      {models.map((model, index) => {
        return (
          <EdgeMLTableEntry key={"model_table_entry" + model._id}>
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
          <div key={model._id}>
            <b>{model.name}</b>
          </div>
        ))}
      </DeleteModal>
    </EdgeMLTable>
  );
};

export default ModelTable;
