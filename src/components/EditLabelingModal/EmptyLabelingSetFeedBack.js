import React from 'react';
import { Alert } from 'reactstrap';
import './EditLabelingModal.css';

const EmptyLabelingSetFeedBack = (props) => {
  if (!props.isLabelingSetEmpty) {
    return null;
  } else {
    return (
      <Alert color="danger">
        {'A labeling set must contain at least one label.'}
      </Alert>
    );
  }
};
export default EmptyLabelingSetFeedBack;
