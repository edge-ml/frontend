import { useEffect, useState } from 'react';
import { getDatasets } from '../../../services/ApiServices/DatasetServices';
import Checkbox from '../../Common/Checkbox';
import classNames from 'classnames';
import { Button, ModalBody, ModalFooter } from 'reactstrap';

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
  onNext,
  onBack,
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
      <ModalBody>
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
      </ModalBody>
      <ModalFooter className="fotter">
        <Button onClick={onBack}>Back</Button>
        <div>2/3</div>
        <Button onClick={onNext}>Next</Button>
      </ModalFooter>
    </div>
  );
};

export default Wizard_SelectDataset;
