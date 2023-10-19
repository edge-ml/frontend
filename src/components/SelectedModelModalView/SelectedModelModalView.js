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
  Badge,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import { humanFileSize, toPercentage } from '../../services/helpers';
import ConfusionMatrixView from '../ConfusionMatrix/ConfusionMatrixView';
import { CrossValidationTable } from './CrossValidationTable';
import Loader from '../../modules/loader';
import { Collapse } from 'react-bootstrap/lib/Navbar';

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
  console.log(model);
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
                <th>Classifier</th>
                <td>{model.pipeline.classifier.name}</td>
              </tr>
              <tr>
                <th>Used labels</th>
                <td>
                  {model.pipeline.labels.map((elm, index) => (
                    <Badge key={index}>{elm}</Badge>
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
  const { windower, featureExtractor, normalizer, classifier } = model.pipeline;

  const Advanced_params = ({ params }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    if (params.filter((elm) => elm.is_advanced).length === 0) {
      return <div></div>;
    }

    return (
      <div>
        <div className="cursor-pointer" onClick={toggle}>
          <FontAwesomeIcon
            icon={isOpen ? faCaretDown : faCaretRight}
          ></FontAwesomeIcon>
          <div className="d-inline ml-1">Advanced Parameters</div>
        </div>
        {isOpen ? (
          <div className="ml-3">
            {params &&
              params
                .filter((elm) => elm.is_advanced)
                .map((param) => {
                  return (
                    <div>
                      {param.name}: {param.value}
                    </div>
                  );
                })}
          </div>
        ) : null}
      </div>
    );
  };

  const Detail_view = ({ stage }) => {
    console.log(stage.parameters);
    return (
      <div>
        <div>Method: {stage.name}</div>
        {stage.parameters &&
          stage.parameters
            .filter((elm) => !elm.is_advanced)
            .map((param) => {
              return (
                <div>
                  {param.name}: {param.value}
                </div>
              );
            })}
        <Advanced_params params={stage.parameters}></Advanced_params>
      </div>
    );
  };

  return (
    <div className="mt-3">
      <h5>
        <b>Training configuration</b>
      </h5>
      <div className="d-flex justify-content-between">
        <div className="m-2">
          <h6 className="text-center">
            <b>Windowing</b>
          </h6>
          <Detail_view stage={windower}></Detail_view>
        </div>
        <div className="m-2">
          <h6 className="text-center">
            <b>Feature Extraction</b>
          </h6>
          <Detail_view stage={featureExtractor}></Detail_view>
        </div>
        <div className="m-2">
          <h6 className="text-center">
            <b>Normalizer</b>
          </h6>
          <Detail_view stage={normalizer}></Detail_view>
        </div>
        <div className="m-2">
          <h6 className="text-center">
            <b>Classifier</b>
          </h6>
          <Detail_view stage={classifier}></Detail_view>
        </div>
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
          report={metrics.classification_report}
        ></Classification_report>
        <ConfusionMatrixView
          matrix={JSON.parse(metrics.confusion_matrix)}
          labels={model.pipeline.labels}
        ></ConfusionMatrixView>
      </div>
      <Training_config model={model}></Training_config>
    </div>
  );
};
