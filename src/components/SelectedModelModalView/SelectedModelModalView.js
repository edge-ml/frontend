import React, { useState } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Row,
  Col,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import { humanFileSize, toPercentage } from '../../services/helpers';
import ConfusionMatrixView from '../ConfusionMatrix/ConfusionMatrixView';
import { CrossValidationTable } from './CrossValidationTable';

export const SelectedModelModalView = ({
  model,
  labels,
  onDelete = null,
  onClosed = () => {},
  ...props
}) => {
  console.log(model);
  return (
    <Modal isOpen={model} size="xl" toggle={onClosed} {...props}>
      <ModalHeader>Model: {model.name}</ModalHeader>
      <ModalBody>
        <General_info model={model}></General_info>
        <Perofrmance_info model={model}></Perofrmance_info>
      </ModalBody>
      <ModalFooter>
        {onDelete ? (
          <Button className="mr-auto" onClick={onDelete} color="danger">
            Delete
          </Button>
        ) : null}
        <Button onClick={onClosed}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

const General_info = ({ model }) => {
  return (
    <div>
      <h4>General info</h4>
      <div>
        <div>Name: {model.name}</div>
        <div>Classifier: {model.trainRequest.classifier.name}</div>
        <div>Used labels: TODO</div>
      </div>
    </div>
  );
};

const metric = (metric) => Math.round(metric * 100 * 100) / 100;

const Perofrmance_info = ({ model }) => {
  console.log(model.model.metrics);
  const metrics = model.model.metrics;
  return (
    <div>
      <h4>Performance metrics</h4>
      <div>Accuracy: {metric(metrics.accuracy_score)}</div>
      <div>Precision: {metric(metrics.precision_score)}</div>
      <div>Recall: {metric(metrics.recall_score)}</div>

      <ConfusionMatrixView
        matrix={JSON.parse(metrics.confusion_matrix)}
        labelMap
        labelIds
      ></ConfusionMatrixView>
    </div>
  );
};
