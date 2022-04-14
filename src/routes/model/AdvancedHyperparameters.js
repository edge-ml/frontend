import React from 'react';
import { Collapse, CardBody, Card, CardHeader } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import { HyperparameterView } from './HyperparameterView';

export const AdvancedHyperparameters = ({
  showAdvanced,
  toggleShowAdvanced,
  model,
  hyperparameters,
  handleHyperparameterChange
}) => {
  return (
    <div className="mb-3 mt-2 align-self-stretch">
      <Card>
        <CardHeader
          className="align-items-start text-left"
          onClick={toggleShowAdvanced}
        >
          {showAdvanced ? (
            <FontAwesomeIcon icon={faCaretDown} />
          ) : (
            <FontAwesomeIcon icon={faCaretRight} />
          )}
          <span className="font-weight-bold"> Advanced Hyperparameters</span>
        </CardHeader>
        <Collapse isOpen={showAdvanced}>
          <CardBody>
            <HyperparameterView
              model={model}
              hyperparameters={hyperparameters}
              handleHyperparameterChange={handleHyperparameterChange}
              isAdvanced={true}
            />
          </CardBody>
        </Collapse>
      </Card>
    </div>
  );
};
