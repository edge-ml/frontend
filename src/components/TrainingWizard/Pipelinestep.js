import { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';
import { HyperparameterView } from '../Hyperparameters/HyperparameterView';

const Pipelinestep = ({ step, selectedPipelineStep, setPipelineStep }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const onSelectStepOption = (option) => {
    console.log('CLICK');
    setPipelineStep(option);
  };

  const onHandleHyperparameterChange = ({ parameter_name, state }) => {
    const tmpSelectedPipelineStep = selectedPipelineStep;
    const idx = tmpSelectedPipelineStep.parameters.findIndex(
      (elm) => elm.parameter_name == parameter_name
    );
    tmpSelectedPipelineStep.parameters[idx].value = state;
    setPipelineStep(tmpSelectedPipelineStep);
  };

  console.log(selectedPipelineStep);
  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <div>
          <h3 className="font-weight-bold">
            {step.name +
              (step.options.length === 1 ? ': ' + step.options[0].name : '')}
          </h3>
          <h5>{step.description}</h5>
        </div>
        {step.options.length > 1 ? (
          <div>
            <Dropdown
              style={{ position: 'relative !important' }}
              isOpen={dropdownOpen}
              toggle={toggleDropdown}
            >
              <DropdownToggle caret>{selectedPipelineStep.name}</DropdownToggle>
              <DropdownMenu>
                {step.options.map((option) => (
                  <DropdownItem onClick={() => onSelectStepOption(option)}>
                    {option.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : null}
      </div>

      <HyperparameterView
        handleHyperparameterChange={onHandleHyperparameterChange}
        isAdvanced={false}
        hyperparameters={selectedPipelineStep.parameters}
      ></HyperparameterView>
    </div>
  );
};

export default Pipelinestep;
