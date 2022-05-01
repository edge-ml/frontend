import React from 'react';

import { Row, Col, Container } from 'reactstrap';

import Loader from '../../modules/loader';

import NumberHyperparameter from '../../components/Hyperparameters/NumberHyperparameter';
import SelectionHyperparameter from '../../components/Hyperparameters/SelectionHyperparameter';

export const HyperparameterView = ({
  model,
  hyperparameters,
  handleHyperparameterChange,
  isAdvanced
}) => {
  return (
    <Loader loading={!model}>
      <Container fluid>
        <Row>
          {model &&
            Object.keys(model.hyperparameters)
              .filter(h => model.hyperparameters[h].is_advanced == isAdvanced)
              .map(h => {
                if (model.hyperparameters[h].parameter_type === 'number') {
                  return (
                    <Col className="col-4 pl-0" style={{ minWidth: '400px' }}>
                      <NumberHyperparameter
                        {...model.hyperparameters[h]}
                        id={'input_' + model.hyperparameters[h].parameter_name}
                        handleChange={handleHyperparameterChange}
                        value={
                          hyperparameters.find(
                            e =>
                              e.parameter_name ===
                              model.hyperparameters[h].parameter_name
                          ).state
                        }
                      />
                    </Col>
                  );
                } else if (
                  model.hyperparameters[h].parameter_type === 'selection'
                ) {
                  return (
                    <Col className="col-4 pl-0" style={{ minWidth: '400px' }}>
                      <SelectionHyperparameter
                        {...model.hyperparameters[h]}
                        id={'input_' + model.hyperparameters[h].parameter_name}
                        handleChange={handleHyperparameterChange}
                        value={
                          hyperparameters.find(
                            e =>
                              e.parameter_name ===
                              model.hyperparameters[h].parameter_name
                          ).state
                        }
                      />
                    </Col>
                  );
                }
              })}
        </Row>
      </Container>
    </Loader>
  );
};
