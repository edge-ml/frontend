import { useEffect, useState } from 'react';
import { Badge, Container, ModalBody, ModalFooter, Button } from 'reactstrap';
import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
import '../index.css';
import Checkbox from '../../../components/Common/Checkbox';
import classNames from 'classnames';

const Wizard_SelectLabeling = ({
  labelings,
  datasets,
  setLabeling,
  toggleZeroClass,
  zeroClass,
  selectedLabeling,
  onNext,
  onBack,
  footer,
}) => {
  const countDatasets = (labeling) => {
    return datasets
      .map((elm) => elm.labelings.map((l) => l.labelingId))
      .flat()
      .filter((elm) => elm === labeling._id).length;
  };

  return (
    <div>
      <ModalBody>
        <div className="content">
          <h3>1. Select Labeling</h3>
          <div>
            {labelings
              .filter((elm) => countDatasets(elm))
              .map((labeling) => (
                <div
                  className={classNames('labelingRow', {
                    disabled: countDatasets(labeling) === 0,
                  })}
                >
                  <Checkbox
                    onClick={() => setLabeling(labeling)}
                    isSelected={
                      selectedLabeling
                        ? selectedLabeling._id === labeling._id
                        : false
                    }
                  ></Checkbox>
                  <div className="labelingName">{labeling.name} </div>
                  <div>
                    {labeling.labels.map((label) => (
                      <Badge
                        className="badge"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                  <div>{`(${countDatasets(labeling)} ${
                    countDatasets(labeling) === 1 ? 'dataset' : 'datasets'
                  })`}</div>
                </div>
              ))}
          </div>
          <div className="d-flex">
            <Checkbox
              onClick={() => toggleZeroClass(!zeroClass)}
              isSelected={zeroClass}
            ></Checkbox>
            <div>Use 0-Class</div>
          </div>
        </div>
      </ModalBody>
      {footer}
    </div>
  );
};

export default Wizard_SelectLabeling;
