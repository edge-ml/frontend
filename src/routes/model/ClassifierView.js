import React from 'react';
import Select from 'react-select';

import {
  Button,
  InputGroup,
  InputGroupAddon,
  Input,
  FormFeedback,
} from 'reactstrap';
import { AdvancedHyperparameters } from './AdvancedHyperparameters';

import { HyperparameterView } from './HyperparameterView';

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
  project,
  showAdvanced,
  toggleShowAdvanced,
}) => {
  return (
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body h-100 d-flex flex-column align-items-start flex-column justify-content-between">
        <div className="d-flex flex-row justify-content-between w-100">
          <h4>Classifier</h4>
          <Select
            options={models.map((m) => {
              return { value: m.id, label: m.name };
            })}
            value={modelSelection}
            onChange={changeModelSelection}
            isSearchable={false}
            styles={{
              valueContainer: () => ({
                width: 200,
                height: 25,
              }),
            }}
          ></Select>
        </div>
        <div
          className="mt-3 mb-3"
          style={{
            width: '100%',
            height: '0.5px',
            backgroundColor: 'lightgray',
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
        <h6 className="mt-3">Hyperparameters</h6>
        <HyperparameterView
          model={models.find((m) => m.id === parseInt(selectedModelId, 10))}
          hyperparameters={hyperparameters}
          handleHyperparameterChange={handleHyperparameterChange}
          isAdvanced={false}
        />
        <AdvancedHyperparameters
          showAdvanced={showAdvanced}
          toggleShowAdvanced={toggleShowAdvanced}
          model={models.find((m) => m.id === parseInt(selectedModelId, 10))}
          hyperparameters={hyperparameters}
          handleHyperparameterChange={handleHyperparameterChange}
        />
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
