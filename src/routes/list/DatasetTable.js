import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import DatasetTableEntry from './DatasetTableEntry';

const DatasetTable = (props) => {
  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <div className="font-weight-bold h4">Datasets</div>
        <div>
          <Button
            id="deleteDatasetsButton"
            size="sm"
            color="danger"
            outline
            disabled={props.datasetsToDelete.length === 0}
            onClick={props.openDeleteModal}
          >
            Delete
          </Button>
          <Button
            className="mx-2"
            id="downloadAllDatasetsButton"
            size="sm"
            color="danger"
            outline
            disabled={!props.datasets.some((elm) => elm.end === 0)}
            onClick={props.deleteAllEmptyDatasets}
          >
            Delete all empty
          </Button>
          <Button
            id="downloadAllDatasetsButton"
            size="sm"
            color="primary"
            outline
            disabled={props.datasets.length === 0}
            onClick={props.downloadAllDatasets}
          >
            Download all
          </Button>
        </div>
      </div>
      <div className="divider"></div>
      <div>
        {props.datasets.map((dataset, index) => (
          <DatasetTableEntry
            dataset={dataset}
            index={index}
            toggleCheck={props.toggleCheck}
            isSelected={props.datasetsToDelete.includes(dataset['_id'])}
          ></DatasetTableEntry>
        ))}
      </div>
    </Fragment>
  );
};

export default DatasetTable;
