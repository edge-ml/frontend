import React, { useState } from "react";
import { Table } from "../../components/Common/Table";
import Checkbox from "../../components/Common/Checkbox";
import { Button, Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../components/Common/EdgeMLTable";
import ModelTableEntry from "./ModelTableEntry";

const ModelTable = ({ models, stepOptions, onDeleteModels, updateModel }) => {
  const [selectedModels, setSelectedModels] = useState([]);

  const onSelectAll = () => {
    const allSelected = models.length === selectedModels.length;
    if (allSelected) {
      setSelectedModels([]);
    } else {
      setSelectedModels(models.map((model) => model._id));
    }
  };

  const clickCheckBox = (model_id) => {
    if (selectedModels.includes(model_id)) {
      setSelectedModels(selectedModels.filter((elm) => elm != model_id));
    } else {
      setSelectedModels([...selectedModels, model_id]);
    }
  };

  return (
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <div className="ml-0 me-0 ml-md-2 me-md-3 ">
          <Checkbox
            isSelected={models.length == selectedModels.length}
            onClick={onSelectAll}
          ></Checkbox>
        </div>
        <Button
          className="btn-delete"
          id="deleteDatasetsButton"
          size="sm"
          outline
          color="danger"
          // onClick={onOpenDeleteModal}
        >
          <FontAwesomeIcon className="me-2" icon={faTrashAlt}></FontAwesomeIcon>
          Delete
        </Button>
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
              stepOptions={stepOptions}
              updateModel={updateModel}
            ></ModelTableEntry>
          </EdgeMLTableEntry>
        );
      })}
    </EdgeMLTable>
  );
};

export default ModelTable;
