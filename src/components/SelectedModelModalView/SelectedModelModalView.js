import React, { Fragment, useState } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Row,
  Col,
  Badge,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import { humanFileSize, toPercentage } from '../../services/helpers';
import ConfusionMatrixView from '../ConfusionMatrix/ConfusionMatrixView';
import { CrossValidationTable } from './CrossValidationTable';
import Loader from '../../modules/loader';
import { Collapse } from 'react-bootstrap/lib/Navbar';

import './index.css';
import classNames from 'classnames';

export const SelectedModelModalView = ({
  model,
  labels,
  onDelete = null,
  onClosed,
  onButtonDeploy,
  onButtonDownload,
  ...props
}) => {
  return (
    <Modal isOpen={model} size="xl" toggle={onClosed} {...props}>
      <Loader loading={!model}>
        {model ? (
          <div>
            <ModalHeader>Model: {model.name}</ModalHeader>
            <ModalBody>
              <General_info
                model={model}
                onButtonDeploy={onButtonDeploy}
                onButtonDownload={onButtonDownload}
              ></General_info>
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

const General_info = ({
  model,
  onDeploy,
  onButtonDeploy,
  onButtonDownload,
}) => {
  return (
    <div>
      <h5>
        <b>General information</b>
      </h5>
      <Row>
        <Col className="col-auto">
          <Table borderless size="sm" striped>
            <tbody>
              <tr>
                <th>Name</th>
                <td>{model.name}</td>
              </tr>
              <tr>
                <th>Pipeline</th>
                <td>{model.pipeLineRequest.selectedPipeline.name}</td>
              </tr>

              <tr>
                <th>Used labels</th>
                <td>
                  {model.labels.map((elm, index) => (
                    <Badge style={{ backgroundColor: elm.color }} key={index}>
                      {elm.name}
                    </Badge>
                  ))}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col>
          <div className="d-flex justify-content-end align-items-start">
            <Button
              className="mr-2"
              onClick={(e) => {
                onButtonDownload(model);
                e.stopPropagation();
              }}
            >
              Download
            </Button>
            <Button
              onClick={(e) => {
                onButtonDeploy(model);
                e.stopPropagation();
              }}
            >
              Deploy
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const Classification_report = ({ report }) => {
  const keys = Object.keys(report);
  const metrics = Object.keys(report[keys[0]]);
  return (
    <div>
      <Table borderless size="sm" striped>
        <thead>
          <tr>
            <th></th>
            {metrics.map((key) => (
              <th className="text-center">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr>
              <th>{key}</th>
              {metrics.map((met) => (
                <td className="px-4">{metric(report[key][met])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const Training_config = ({ model }) => {
  const [selectedStep, setSelectedStep] = useState(
    model.pipeLineRequest.selectedPipeline.steps[0]
  );

  const Render_Step = (step) => {
    return (
      <div
        className={classNames('training_step', {
          training_step_selected: step.name === selectedStep.name,
        })}
        onClick={() => onClickStep(step)}
      >
        <div>{step.name}</div>
      </div>
    );
  };

  const onClickStep = (step) => {
    setSelectedStep(step);
  };

  return (
    <Fragment>
      <h5>
        <b>Pipeline configuration</b>
      </h5>
      <div className="d-flex justify-content-start">
        {model.pipeLineRequest.selectedPipeline.steps
          .filter((elm) => elm.type === 'PRE' || elm.type === 'CORE')
          .map((elm) => Render_Step(elm, onClickStep))}
      </div>

      <div className="m-2">
        <h5>
          <b>{selectedStep.name}</b>
        </h5>
        <div>
          <b>Method: </b>
          {selectedStep.options.name}
        </div>
        {selectedStep.options.parameters.length > 0 ? (
          <div>
            <b>Parameters: </b>
            {selectedStep.options.parameters.map((param) => (
              <div>
                <span>{param.name}: </span>
                <span>{param.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Fragment>
  );
};

const metric = (metric) => {
  const val = Math.round(metric * 100 * 100) / 100;
  return isNaN(val) ? '' : val;
};

const PerformanceInfo = ({ model }) => {
  const metrics = model.performance.metrics;
  console.log(model.performance.classification_report);
  return (
    <div className="my-4">
      <h5>
        <b>Performance metrics</b>
      </h5>
      <Table borderless size="sm" striped style={{ width: '150px' }}>
        <tbody>
          <tr>
            <td>
              <b>Accuracy</b>
            </td>
            <td>{metric(metrics.accuracy_score)}%</td>
          </tr>
          <tr>
            <td>
              <b>Precision</b>
            </td>
            <td>{metric(metrics.precision_score)}%</td>
          </tr>
          <tr>
            <td>
              <b>Recall</b>
            </td>
            <td>{metric(metrics.recall_score)}%</td>
          </tr>
        </tbody>
      </Table>
      <div className="d-flex align-items-center m-2">
        <Classification_report
          report={model.performance.classification_report}
        ></Classification_report>
        <ConfusionMatrixView
          matrix={JSON.parse(model.performance.confusion_matrix)}
          labels={model.labels.map((elm) => elm.name)}
        ></ConfusionMatrixView>
      </div>
      <Training_config model={model}></Training_config>
    </div>
  );
};
