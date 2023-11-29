import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import Checkbox from '../../../components/Common/Checkbox';

const LabelingSetsFilter = ({ labelings, currenFilterParams }) => {
  const [targetLabelingIds, setTargetLabelingIds] = useState([]);
  const [targetLabelIds, setTargetLabelIds] = useState([]);

  useEffect(() => {
    if (currenFilterParams !== undefined) {
      setTargetLabelIds(currenFilterParams.target_label_ids);
      setTargetLabelingIds(currenFilterParams.target_labeling_ids);
    }
    return () => {};
  }, []);

  const onSelectLabel = () => {};

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
              <div className="d-flex">
                <div className="d-flex align-items-center">
                  <Checkbox
                    isSelected={isSelectedLabeling(labeling._id)}
                    className="d-inline-block"
                    onClick={() => onSelectLabelingSet(labeling)}
                  ></Checkbox>
                  <div className="ml-2">{labeling.name}</div>
                </div>
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default LabelingSetsFilter;
