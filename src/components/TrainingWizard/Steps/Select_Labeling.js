import { useEffect, useState, Fragment } from 'react';
import { Badge, Container, ModalBody, ModalFooter, Button } from 'reactstrap';
import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
import '../index.css';
import Checkbox from '../../../components/Common/Checkbox';
import classNames from 'classnames';
import {
  EdgeMLTable,
  EdgeMLTableHeader,
  EdgeMLTableEntry,
} from '../../Common/EdgeMLTable';
import { toggleElement } from '../../../services/helpers';

const Wizard_SelectLabeling = ({
  labelings,
  datasets,
  setLabeling,
  selectedLabeling,
  toggleZeroClass,
  zeroClass,
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
    <Fragment>
      <h3 className="font-weight-bold">1. Select Labeling</h3>
      <EdgeMLTable>
        <EdgeMLTableHeader>
          <div>
            <h4>
              <b>Labeling</b>
            </h4>
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <Checkbox
              onClick={() => toggleZeroClass(!zeroClass)}
              isSelected={zeroClass}
            ></Checkbox>
            <div className="ml-2">Use 0-Class</div>
          </div>
        </EdgeMLTableHeader>
        {labelings
          .filter((elm) => countDatasets(elm))
          .map((labeling) => (
            <EdgeMLTableEntry
              className={classNames('labelingRow', {
                disabled: countDatasets(labeling) === 0,
              })}
            >
              <Checkbox
                onClick={() => setLabeling({ ...labeling, disabledLabels: [] })}
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
                    onClick={() =>
                      selectedLabeling?.disabledLabels &&
                      selectedLabeling._id === labeling._id &&
                      setLabeling({
                        ...selectedLabeling,
                        disabledLabels: toggleElement(
                          selectedLabeling.disabledLabels,
                          label._id
                        ),
                      })
                    }
                    style={{
                      ...(selectedLabeling?.disabledLabels.includes(label._id)
                        ? { textDecoration: 'line-through' }
                        : { backgroundColor: label.color }),
                      userSelect: 'none',
                    }}
                    {...(selectedLabeling?.disabledLabels.includes(label._id)
                      ? { color: 'light' }
                      : {})}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
              <div>{`(${countDatasets(labeling)} ${
                countDatasets(labeling) === 1 ? 'dataset' : 'datasets'
              })`}</div>
            </EdgeMLTableEntry>
          ))}
      </EdgeMLTable>
    </Fragment>
  );
};

export default Wizard_SelectLabeling;
