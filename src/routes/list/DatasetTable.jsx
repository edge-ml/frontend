import {
  faDownload,
  faFilter,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useState } from "react";
import { Button, Container } from "reactstrap";
import Checkbox from "../../components/Common/Checkbox";
import DatasetTableEntry from "./DatasetTableEntry";
import DatasetSorting from "./DatasetSorting";

const DatasetTable = ({
  datasets,
  downloadAllDatasets,
  selectedDatasets,
  openDeleteModal,
  selectAllEmpty,
  selectedSorting,
  setSelectedSorting,
  selectAll,
  deselectAll,
  toggleCheck,
  labelings,
  labels,
  deleteEntry,
  updateDataset
}) => {
  const [areAllSelected, setAllSelected] = useState(false);
  return (
    <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2 flex-grow-1">
      <Fragment>
        <div className="w-100 d-flex justify-content-between">
          <div className="fw-bold h4">DATASETS</div>
          <Button
            color="secondary"
            size="sm"
            outline
            disabled={datasets.length === 0}
            onClick={downloadAllDatasets}
          >
            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon> Download All
          </Button>
        </div>
        {datasets.length > 0 ? (
          <div style={{ borderRadius: 10 }}>
            <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row align-content-baseline">
              <div className="d-flex flex-row align-items-center p-1">
                <div className="ml-0 me-0 ml-md-2 me-md-3 ">
                  <Checkbox
                    isSelected={areAllSelected}
                    onClick={(e) => {
                      setAllSelected(!areAllSelected);
                      if (areAllSelected) {
                        deselectAll();
                      } else {
                        selectAll();
                      }
                    }}
                  ></Checkbox>
                </div>
                <Button
                  outline
                  className="ms-3 btn-delete"
                  id="deleteDatasetsButton"
                  size="sm"
                  disabled={selectedDatasets.length === 0}
                  color="danger"
                  onClick={openDeleteModal}
                >
                  <FontAwesomeIcon
                    className="me-2"
                    icon={faTrashAlt}
                  ></FontAwesomeIcon>
                  Delete
                </Button>
                <Button
                  id="selectAllEmptyButton"
                  size="sm"
                  outline
                  color="secondary"
                  onClick={selectAllEmpty}
                  /* disabled={props.datasets.every((elm) => elm.end != 0)}*/
                  className="ms-2"
                >
                  <FontAwesomeIcon
                    className="me-2"
                    icon={faFilter}
                  ></FontAwesomeIcon>
                  Select Empty Datasets
                </Button>
              </div>
              <div className="d-flex flex-md-row justify-content-end position-relative">
                <div className="d-flex align-items-center me-2">
                  <DatasetSorting
                    selectedSorting={selectedSorting}
                    setSelectedSorting={setSelectedSorting}
                  />
                </div>
                {/* <div className="d-flex align-items-center">
                  <Button
                    outline
                    active={props.filterSelected}
                    className="me-3"
                    size="sm"
                    onClick={props.toggleFilterSelectionModal}
                  >
                    <FontAwesomeIcon icon={faFilter} size="sm" />
                  </Button>
                </div> */}
              </div>
            </div>
            <div
              className="w-100 position-relative"
              style={{
                border: "2px solid rgb(230, 230, 234)",
                borderRadius: "0px 0px 10px 10px",
                overflow: "hidden",
              }}
            >
              {datasets.map((dataset, index) => (
                <DatasetTableEntry
                  key={dataset + index}
                  dataset={dataset}
                  index={index}
                  toggleCheck={toggleCheck}
                  isSelected={selectedDatasets.includes(dataset["_id"])}
                  labelings={labelings}
                  labels={labels}
                  deleteEntry={deleteEntry}
                  updateDataset={updateDataset}
                ></DatasetTableEntry>
              ))}
            </div>
          </div>
        ) : (
          <Container
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
            <div className="text-center">No datasets available yet.</div>
          </Container>
        )}
      </Fragment>
    </div>
  );
};

export default DatasetTable;
