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
import DatasetSorting from './DatasetSorting';

const DatasetTable = (props) => {
  return (
    <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2">
      <Fragment>
        <div className="w-100 d-flex flex-row justify-content-center align-items-center">
          <div className="font-weight-bold h4">DATASETS</div>
          <Button
            id="downloadAllDatasetsButton"
            size="sm"
            color="secondary"
            className="btn-download-all ml-auto"
            disabled={props.datasets.length === 0}
            onClick={props.downloadAllDatasets}
          >
            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon> Download All
          </Button>
        </div>
        {props.datasets.length > 0 ? (
          <div style={{ borderRadius: 10 }}>
            <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row align-content-baseline">
              <div className="d-flex flex-row align-items-center p-1">
                <Button
                  className="ml-3 mr-2 btn-delete"
                  id="deleteDatasetsButton"
                  size="sm"
                  disabled={props.datasetsToDelete.length === 0}
                  color="secondary"
                  onClick={props.openDeleteModal}
                >
                  <FontAwesomeIcon
                    className="mr-2"
                    icon={faTrashAlt}
                  ></FontAwesomeIcon>
                  Delete
                </Button>
                <div className="ml-0 mr-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      props.selectAllOnPage();
                    }}
                  >
                    {'Select Page'}
                  </Button>
                </div>
                <div>
                  <Button
                    size="sm"
                    onClick={() => {
                      props.deselectAll();
                    }}
                  >
                    {'Deselect All'}
                  </Button>
                </div>
              </div>
              <div className="d-flex flex-md-row justify-content-end position-relative">
                <div className="position-absolute">
                  <div className="mr-5">
                    {' '}
                    <DatasetSorting
                      sortDropDownIsOpen={props.sortDropDownIsOpen}
                      setSortDropdownIsOpen={props.setSortDropdownIsOpen}
                      selectedSorting={props.selectedSorting}
                      setSelectedSorting={props.setSelectedSorting}
                    />
                  </div>
                </div>
                <div className="position-absolute">
                  <Button
                    size="sm"
                    className="mr-2"
                    active={props.selectedFilter}
                    onClick={() => props.setFilterModalOpen(true)}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                  </Button>
                </div>
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
              {props.datasets.map((dataset, index) => (
                <DatasetTableEntry
                  key={dataset['_id']}
                  dataset={dataset}
                  index={index}
                  toggleCheck={props.toggleCheck}
                  isSelected={props.datasetsToDelete.some(
                    (datasetsToDelete) =>
                      datasetsToDelete._id === dataset['_id']
                  )}
                  labelings={props.labelings}
                  labels={props.labels}
                  deleteEntry={props.deleteEntry}
                ></DatasetTableEntry>
              ))}
            </div>
          </div>
        ) : props.selectedFilter ? (
          <Container
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: '50vh' }}
          >
            <div className="text-center">No results found.</div>
            <div>
              <Button outline onClick={props.removeFilter}>
                Remove Filter
              </Button>
            </div>
          </Container>
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
