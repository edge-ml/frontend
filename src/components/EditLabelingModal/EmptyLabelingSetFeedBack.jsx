import React from "react";
import { Alert } from "@mantine/core";
import "./EditLabelingModal.css";

const EmptyLabelingSetFeedBack = (props) => {
  if (!props.isLabelingSetEmpty) {
    return null;
  } else {
    return (
      <Alert color="red">
        {"A labeling set must contain at least one label."}
      </Alert>
    );
  }
};
export default EmptyLabelingSetFeedBack;
