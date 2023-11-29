import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import Checkbox from '../../../components/Common/Checkbox';

const LabelingSetsFilter = ({
  labelings,
  currenFilterParams,
  setCurrentFilterParams,
}) => {
  const [targetLabelingIds, setTargetLabelingIds] = useState([]);
  const [targetLabelIds, setTargetLabelIds] = useState([]);

  useEffect(() => {
    if (currenFilterParams !== undefined) {
      setTargetLabelIds(currenFilterParams.target_label_ids);
      setTargetLabelingIds(currenFilterParams.target_labeling_ids);
    } else {
      const _currentFilterParams = {};
      _currentFilterParams.target_label_ids = [];
      _currentFilterParams.target_labeling_ids = [];
      setCurrentFilterParams(_currentFilterParams);
    }
    return () => {};
  }, []);

  useEffect(() => {
    setCurrentFilterParams({
      ...currenFilterParams,
      target_labeling_ids: targetLabelingIds,
    });
  }, [targetLabelingIds]);

  useEffect(() => {
    setCurrentFilterParams({
      ...currenFilterParams,
      target_label_ids: targetLabelIds,
    });
  }, [targetLabelIds]);

  const onSelectLabel = (label) => {
    if (isSelectedLabel(label._id)) {
      setTargetLabelIds(targetLabelIds.filter((id) => id != label._id));
    } else {
      setTargetLabelIds([...targetLabelIds, label._id]);
    }
  };

  const onSelectLabelingSet = (labelingSet) => {
    if (isSelectedLabeling(labelingSet._id)) {
      const labelingIdToRemove = labelingSet._id;
      setTargetLabelingIds(
        targetLabelingIds.filter((id) => id !== labelingIdToRemove)
      );
      const labelIdsToRemove = [];
      labelingSet.labels.map((label) => {
        labelIdsToRemove.push(label._id);
      });
      setTargetLabelIds(
        targetLabelIds.filter((id) => !labelIdsToRemove.includes(id))
      );
    } else {
      setTargetLabelingIds([...targetLabelingIds, labelingSet._id]);
      const labelIdsToAdd = [];
      labelingSet.labels.map((label) => {
        labelIdsToAdd.push(label._id);
      });
      const labelIdsToAddFiltered = labelIdsToAdd.filter(
        (id) => !targetLabelIds.includes(id)
      );
      setTargetLabelIds([...targetLabelIds, ...labelIdsToAddFiltered]);
    }
  };

  const isSelectedLabeling = (labelingId) => {
    return targetLabelingIds.includes(labelingId);
  };

  const isSelectedLabel = (labelId) => {
    return targetLabelIds.includes(labelId);
  };

  const renderLabels = (labels) => {
    if (labels.length === 0) {
      return null;
    } else {
      return (
        <div className="d-flex flex-row mr-2 badgeSize pb-2 mt-2 mb-2">
          {labels.map((label, index) => {
            return (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  isSelected={isSelectedLabel(label._id)}
                  className="d-inline-block"
                  onClick={() => onSelectLabel(label)}
                />
                <Badge
                  key={label._id}
                  className={
                    label.name === ''
                      ? 'font-italic font-weight-normal badgeSize mx-1 border border-dark'
                      : 'badgeSize mx-1 my-1 border border-dark'
                  }
                  style={{ backgroundColor: label.color }}
                >
                  {label.name !== '' ? label.name : 'Untitled'}{' '}
                </Badge>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div>
      <div className="mb-4">
        {
          'Select the labelings and/or labels of the datasets you want to display:\n'
        }
      </div>
      <div>
        <ListGroup style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {labelings.map((labeling, index) => (
            <ListGroupItem key={index}>
              <div className="d-flex flex-row">
                <div className="d-flex align-items-center mr-2">
                  <Checkbox
                    isSelected={isSelectedLabeling(labeling._id)}
                    className="d-inline-block"
                    onClick={() => onSelectLabelingSet(labeling)}
                  ></Checkbox>
                  <div className="ml-2">
                    <b>{labeling.name}</b>
                  </div>
                </div>
                <div>{renderLabels(labeling.labels)}</div>
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default LabelingSetsFilter;
