import { useEffect, useState } from 'react';
import { getDatasets } from '../../../services/ApiServices/DatasetServices';
import Checkbox from '../../Common/Checkbox';
import classNames from 'classnames';

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
}) => {
  const checkUsable = (dataset) => {
    return (
      selectedLabeling &&
      dataset.labelings.filter((elm) => elm.labelingId === selectedLabeling._id)
        .length <= 0
    );
  };

  return (
    <div>
      <h3>2. Select datasets</h3>
      <div>
        {datasets.map((dataset) => {
          return (
            <div
              className={classNames('datasetRow', {
                disabled: checkUsable(dataset),
              })}
            >
              <Checkbox
                onClick={() => toggleSelectDataset(dataset._id)}
              ></Checkbox>
              <div className="datasetName">{dataset.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wizard_SelectDataset;
