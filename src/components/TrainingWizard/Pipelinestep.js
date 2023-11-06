import { useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';
import { HyperparameterView } from '../Hyperparameters/HyperparameterView';

const Pipelinestep = ({
  step,
  selectedPipelineStep,
  setPipelineStep,
  stepNum,
}) => {
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
            {stepNum +
              1 +
              '. ' +
              step.name +
              (step.options.length === 1 ? ': ' + step.options[0].name : '')}
          </h3>
          <h5>{step.description}</h5>
        </div>
      </div>
      <hr></hr>
      <div className="mb-2">
        {step.options.length > 1 ? (
          <div className="">
            <div className="d-flex justify-content-start align-items-center">
              <b>Method: </b>
              <div>
                <Dropdown
                  className="ml-2"
                  style={{ position: 'unset', padding: 'unset' }}
                  isOpen={dropdownOpen}
                  toggle={toggleDropdown}
                >
                  <DropdownToggle caret>
                    {selectedPipelineStep.name}
                  </DropdownToggle>
                  <DropdownMenu>
                    {step.options.map((option) => (
                      <DropdownItem onClick={() => onSelectStepOption(option)}>
                        {option.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <div className="my-2">
              <b>Description: </b>
              {selectedPipelineStep.description}
            </div>
          </div>
        ) : null}
      </div>
      {console.log(selectedPipelineStep.parameters)}
      {selectedPipelineStep.parameters.length > 0 ? (
        <div>
          <b>Parameters:</b>
        </div>
      ) : null}
      <HyperparameterView
        handleHyperparameterChange={onHandleHyperparameterChange}
        isAdvanced={false}
        hyperparameters={selectedPipelineStep.parameters}
      ></HyperparameterView>
    </div>
  );
};

export default Pipelinestep;
