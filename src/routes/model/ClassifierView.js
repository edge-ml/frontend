import React from 'react';
import Select from 'react-select';

import NumberHyperparameter from '../../components/Hyperparameters/NumberHyperparameter';
import SelectionHyperparameter from '../../components/Hyperparameters/SelectionHyperparameter';

import {
  Button,
  InputGroup,
  InputGroupAddon,
  Input,
  FormFeedback,
  Row,
  Col
} from 'reactstrap';

export const ClassifierView = ({
  models,
  modelSelection,
  changeModelSelection,
  modelName,
  changeModelName,
  hyperparameters,
  selectedModelId,
  handleHyperparameterChange,
  handleTrainButton,
  project
}) => {
  return (
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body h-100 d-flex flex-column align-items-start flex-column justify-content-between">
        <div className="d-flex flex-row justify-content-between w-100">
          <h4>Classifier</h4>
          <Select
            options={models.map(m => {
              return { value: m.id, label: m.name };
            })}
            value={modelSelection}
            onChange={changeModelSelection}
            isSearchable={false}
            styles={{
              valueContainer: () => ({
                width: 200,
                height: 25
              })
            }}
          ></Select>
        </div>

        <div
          className="mt-3 mb-3"
          style={{
            width: '100%',
            height: '0.5px',
            backgroundColor: 'lightgray'
          }}
        ></div>
        <InputGroup style={{ width: '350px' }}>
          <InputGroupAddon addonType="prepend">Model Name</InputGroupAddon>
          <Input
            type={'text'}
            value={modelName}
            onChange={changeModelName}
            invalid={!modelName}
          ></Input>
        </InputGroup>
        <FormFeedback invalid></FormFeedback>
        <h6 style={{ marginTop: '16px' }}>Hyperparameters</h6>
        <Row>
          {models
            .filter(m => m.id === parseInt(selectedModelId, 10))
            .map(m => {
              return Object.keys(m.hyperparameters).map((h, index) => {
                if (m.hyperparameters[h].parameter_type === 'number') {
                  {
                    console.log(
                      hyperparameters.find(
                        e =>
                          e.parameter_name ===
                          m.hyperparameters[h].parameter_name
                      )
                    );
                  }
                  return (
                    <Col className="col-4" style={{ minWidth: '400px' }}>
                      <NumberHyperparameter
                        {...m.hyperparameters[h]}
                        id={index}
                        handleChange={handleHyperparameterChange}
                        value={
                          hyperparameters.find(
                            e =>
                              e.parameter_name ===
                              m.hyperparameters[h].parameter_name
                          ).state
                        }
                      />
                    </Col>
                  );
                } else if (
                  m.hyperparameters[h].parameter_type === 'selection'
                ) {
                  return (
                    <Col className="col-4" style={{ minWidth: '400px' }}>
                      <SelectionHyperparameter
                        {...m.hyperparameters[h]}
                        id={index}
                        handleChange={handleHyperparameterChange}
                        value={
                          hyperparameters.find(
                            e =>
                              e.parameter_name ===
                              m.hyperparameters[h].parameter_name
                          ).state
                        }
                      />
                    </Col>
                  );
                }
              });
            })}
        </Row>
        <Button
          disabled={!modelName}
          onClick={handleTrainButton}
          project={project}
        >
          Train Model
        </Button>
      </div>
    </div>
  );
};
