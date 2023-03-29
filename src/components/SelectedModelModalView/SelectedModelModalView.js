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
import Loader from '../../modules/loader';

export const SelectedModelModalView = ({
  model,
  labels,
  onDelete = null,
  onClosed,
  ...props
}) => {
  return (
    <Modal isOpen={model} size="xl" toggle={onClosed} {...props}>
      <Loader loading={!model}>
        {model ? (
          <div>
            <ModalHeader>Model: {model.name}</ModalHeader>
            <ModalBody>
              <General_info model={model}></General_info>
              <Button>Deploy</Button>
              <PerformanceInfo model={model}></PerformanceInfo>
            </ModalBody>
            <ModalFooter>
              {onDelete ? (
                <Button className="mr-auto" onClick={onDelete} color="danger">
                  Delete
                </Button>
              ) : null}
              <Button onClick={onClosed}>Close</Button>
            </ModalFooter>
          </div>
        ) : null}
      </Loader>
    </Modal>
  );
};

const General_info = ({ model }) => {
  return (
    <div>
      <h4>General info</h4>
      <div>
        <div>Name: {model.name}</div>
        <div>Classifier: {model.pipeline.classifier.name}</div>
        <div>Used labels: TODO</div>
      </div>
    </div>
  );
};

const Classification_report = ({ report }) => {
  console.log(report);
  const keys = Object.keys(report);
  console.log(keys);
  const metrics = Object.keys(report[keys[0]]);
  console.log(metrics);
  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th></th>
            {metrics.map((key) => (
              <th>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr>
              <th>{key}</th>
              {metrics.map((met) => (
                <th>{metric(report[key][met])}</th>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const Training_config = ({ model }) => {
  const { windower, featureExtractor, normalizer, classifier } = model.pipeline;
  console.log(windower);
  console.log(normalizer);
  console.log(classifier);
  const Detail_view = ({ stage }) => {
    return (
      <div>
        <div>Method: {stage.name}</div>
        {stage.parameters &&
          stage.parameters.map((param) => {
            return (
              <div>
                {param.name}: {param.value}
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div>
      <div>
        <h5>Windowing</h5>
        <Detail_view stage={windower}></Detail_view>
      </div>
      <div>
        <h5>Feature Extraction</h5>
        <Detail_view stage={featureExtractor}></Detail_view>
      </div>
      <div>
        <h5>Normalizer</h5>
        <Detail_view stage={normalizer}></Detail_view>
      </div>
      <div>
        <h5>Classifier</h5>
        <Detail_view stage={classifier}></Detail_view>
      </div>
    </div>
  );
};

const metric = (metric) => {
  const val = Math.round(metric * 100 * 100) / 100;
  return isNaN(val) ? '' : val;
};

const PerformanceInfo = ({ model }) => {
  const metrics = model.evaluator.metrics;
  return (
    <div>
      <h4>Performance metrics</h4>
      <div>Accuracy: {metric(metrics.accuracy_score)}</div>
      <div>Precision: {metric(metrics.precision_score)}</div>
      <div>Recall: {metric(metrics.recall_score)}</div>
      <Classification_report
        report={metrics.classification_report}
      ></Classification_report>
      <ConfusionMatrixView
        matrix={JSON.parse(metrics.confusion_matrix)}
        labelMap
        labelIds
      ></ConfusionMatrixView>
      <Training_config model={model}></Training_config>
    </div>
  );
};
