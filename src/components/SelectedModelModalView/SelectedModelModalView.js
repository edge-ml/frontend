import React from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Row,
  Col
} from 'reactstrap';

import { humanFileSize, toPercentage } from '../../services/helpers';

export const SelectedModelModalView = ({
  model,
  //#region
  /* for lack of typescript see:
    {
      "id":"62003a17f49340bc5b975454",
      "name":"dsa",
      "creation_date":1644182039.67456,
      "classifier":"Random Forest Classifier",
      "accuracy":1.0,
      "precision":1.0,
      "f1_score":1.0,
      "size": 27650
      "hyperparameters":{ // this is different for each hyperparameter
          "n_estimators":100,
          "criterion":"gini",
          "max_depth":null,
          "min_samples_split":2,
          "min_samples_leaf":1,
          "min_weight_fraction_leaf":0,
          "max_features":"auto",
          "max_leaf_nodes":null,
          "min_impurity_decrease":0,
          "bootstrap":true,
          "oob_score":false,
          "random_state":null,
          "warm_start":false,
          "class_weight":null,
          "ccp_alpha":0,
          "max_samples":null
      },
      "confusion_matrix":"[[39  0  0]\n [ 0 22  0]\n [ 0  0  1]]",
      "classification_report":"              precision    recall  f1-score   support\n\n         0.0       1.00      1.00      1.00        39\n         1.0       1.00      1.00      1.00        22\n         2.0       1.00      1.00      1.00         1\n\n    accuracy                           1.00        62\n   macro avg       1.00      1.00      1.00        62\nweighted avg       1.00      1.00      1.00        62\n"
    }
  */
  //#endregion
  baseModels,
  //#region
  /*
    [{name: "Edge Model Base",…},…]
    0: {name: "Edge Model Base",…}
    1: {name: "Random Forest Classifier", description: "A simple random forest classifier.", id: 1,…}
      description: "A simple random forest classifier."
      hyperparameters: {,…}
        bootstrap: {parameter_type: "selection", display_name: "Bootstrap Sampling", parameter_name: "bootstrap",…}
          default: "True"
          description: "Whether bootstrap samples are used when building trees. If False, the whole dataset is used to build each tree."
          display_name: "Bootstrap Sampling"
          multi_select: false
          options: ["True", "False"]
          parameter_name: "bootstrap"
          parameter_type: "selection"
          required: true
        ccp_alpha: {parameter_type: "number", display_name: "CCP Alpha", parameter_name: "ccp_alpha",…}
        class_weight: {parameter_type: "selection", display_name: "Class Weight", parameter_name: "class_weight",…}
        criterion: {parameter_type: "selection", display_name: "Criterion", parameter_name: "criterion",…}
        max_depth: {parameter_type: "number", display_name: "Max Depth", parameter_name: "max_depth",…}
        max_features: {parameter_type: "selection", display_name: "Max Features", parameter_name: "max_features",…}
        max_leaf_nodes: {parameter_type: "number", display_name: "Max Leaf Nodes", parameter_name: "max_leaf_nodes",…}
        max_samples: {parameter_type: "number", display_name: "Max Samples", parameter_name: "max_samples",…}
        min_impurity_decrease: {parameter_type: "number", display_name: "Min Impurity Decrease",…}
        min_samples_leaf: {parameter_type: "number", display_name: "Min Samples Leaf", parameter_name: "min_samples_leaf",…}
        min_samples_split: {parameter_type: "number", display_name: "Min Samples Split", parameter_name: "min_samples_split",…}
        min_weight_fraction_leaf: {parameter_type: "number", display_name: "Min Weight Fraction Leaf",…}
        n_estimators: {parameter_type: "number", display_name: "N-Estimators", parameter_name: "n_estimators",…}
        oob_score: {parameter_type: "selection", display_name: "OOB Score", parameter_name: "oob_score",…}
        random_state: {parameter_type: "number", display_name: "Random State", parameter_name: "random_state",…}
        sliding_step: {parameter_type: "number", display_name: "Sliding Step", parameter_name: "sliding_step",…}
        warm_start: {parameter_type: "selection", display_name: "Warm Start", parameter_name: "warm_start",…}
        window_size: {parameter_type: "number", display_name: "Window Size", parameter_name: "window_size",…}
      id: 1
      model: {is_fit: false, _hyperparameters: {}, clf: {,…}}
      name: "Random Forest Classifier"
    2: {name: "K-Nearest Neighbours Classifier", description: "A simple K-Nearest Neighbours classifier.",…}
  */
  //#endregion
  onDelete = null,
  onClosed = () => {},
  ...props
}) => {
  const base = baseModels.find(x => x.name === model.classifier);
  console.assert(base !== undefined);
  return (
    <Modal isOpen={model && baseModels} size="xl" {...props}>
      <ModalHeader>Model: {model.name}</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <Table borderless responsive>
              <tbody>
                <tr>
                  {' '}
                  <th>ID</th>
                  <td>{model.id}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Name</th>
                  <td>{model.name}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Creation Date</th>
                  <td>
                    {new Date(
                      parseInt(model.creation_date) * 1000
                    ).toISOString()}
                  </td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Size on Disk</th>
                  <td>{humanFileSize(model.size)}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Classifier</th>
                  <td>{base.name}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Accuracy</th>
                  <td>{toPercentage(model.accuracy)}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Precision</th>
                  <td>{toPercentage(model.precision)}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>f1 Score</th>
                  <td>{toPercentage(model.f1_score)}</td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Report</th>{' '}
                  <td>
                    <pre>{model.classification_report}</pre>
                  </td>{' '}
                </tr>
                <tr>
                  {' '}
                  <th>Confusion Matrix</th>{' '}
                  <td>
                    <pre>{model.confusion_matrix}</pre>
                  </td>{' '}
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col>
            <Table borderless responsive>
              <tbody>
                {Object.entries(model.hyperparameters).map(([key, val]) => (
                  <tr>
                    {' '}
                    <th>
                      {base.hyperparameters[key]
                        ? base.hyperparameters[key].display_name
                        : key}
                    </th>{' '}
                    <td>{String(val)}</td>{' '}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
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
