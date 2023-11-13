import {
  faDownload,
  faFilter,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Fragment, useState } from 'react';
import { Button, Container } from 'reactstrap';
import Checkbox from '../../components/Common/Checkbox';
import DatasetTableEntry from './DatasetTableEntry';
import DatasetSort from './DatasetSort';

const DatasetTable = (props) => {
  const [areAllSelected, setAllSelected] = useState(false);
  return (
    <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2">
      <Fragment>
        <div className="w-100 d-flex flex-row justify-content-center align-items-center">
          <div className="font-weight-bold h4">DATASETS</div>
          <Button
            id="downloadAllDatasetsButton"
            size="sm"
            color="secondary"
            className="btn-neutral ml-auto"
            disabled={props.displayedDatasets.length === 0}
            onClick={props.downloadAllDatasets}
          >
            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon> Download All
          </Button>
        </div>
        {props.displayedDatasets.length > 0 ? (
          <div style={{ borderRadius: 10 }}>
            <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row align-content-baseline">
              <div className="d-flex flex-row align-items-center p-1">
                <div className="ml-0 mr-0 ml-md-2 mr-md-3 ">
                  <Checkbox
                    isSelected={areAllSelected}
                    onClick={(e) => {
                      setAllSelected(!areAllSelected);
                      if (areAllSelected) {
                        props.deselectAll();
                      } else {
                        props.selectAll();
                      }
                    }}
                  ></Checkbox>
                </div>
                <Button
                  className="ml-3 btn-delete"
                  id="deleteDatasetsButton"
                  size="sm"
                  disabled={props.selectedDatasets.length === 0}
                  color="secondary"
                  onClick={props.openDeleteModal}
                >
                  <FontAwesomeIcon
                    className="mr-2"
                    icon={faTrashAlt}
                  ></FontAwesomeIcon>
                  Delete
                </Button>
                <Button
                  id="selectAllEmptyButton"
                  size="sm"
                  color="secondary"
                  onClick={props.selectAllEmpty}
                  /* disabled={props.datasets.every((elm) => elm.end != 0)}*/
                  className="ml-2"
                >
                  <FontAwesomeIcon
                    className="mr-2"
                    icon={faFilter}
                  ></FontAwesomeIcon>
                  Select Empty Datasets
                </Button>
              </div>
              <div className="d-flex flex-row justify-content-end position-relative">
                <div className="position-absolute" style={{ right: '60px' }}>
                  <DatasetSort
                    sortingDropDownIsOpen={props.sortingDropDownIsOpen}
                    setSortingDropdownIsOpen={props.setSortingDropdownIsOpen}
                    selectedSortingString={props.selectedSortingString}
                    setSelectedSortingString={props.setSelectedSortingString}
                    setSortingMethod={props.setSortingMethod}
                    applySorting={props.applySorting}
                  />
                </div>
                <Button
                  active={props.filterSelected}
                  className="mr-3"
                  onClick={props.toggleFilterSelectionModal}
                >
                  <FontAwesomeIcon icon={faFilter} />
                </Button>
              </div>
            </div>
            <div
              className="w-100 position-relative"
              style={{
                border: '2px solid rgb(230, 230, 234)',
                borderRadius: '0px 0px 10px 10px',
                overflow: 'hidden',
              }}
            >
              {props.displayedDatasets.map((dataset, index) => (
                <DatasetTableEntry
                  key={dataset + index}
                  dataset={dataset}
                  index={index}
                  toggleCheck={props.toggleCheck}
                  isSelected={props.selectedDatasets.includes(dataset['_id'])}
                  labelings={props.labelings}
                  labels={props.labels}
                  deleteEntry={props.deleteEntry}
                ></DatasetTableEntry>
              ))}
            </div>
          </div>
        ) : (
          <Container
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '50vh' }}
          >
            <div className="text-center">No datasets available yet.</div>
          </Container>
        )}
      </Fragment>
    </div>
  );
};

export default DatasetTable;
