import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, Fragment } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Collapse,
  ModalBody,
} from 'reactstrap';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import { HyperparameterView } from '../../Hyperparameters/HyperparameterView';

const Wizard_Hyperparameters = ({
  classifier,
  onBack,
  onNext,
  onTrain,
  setSelectedClassifier,
  setClassifier,
  footer,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [classififier_index, set_classifier_index] = useState(0);

  const handleHyperparameterChange = ({ parameter_name, value }) => {
    const newClassifier = [...classifier];
    const idx = newClassifier[classififier_index].parameters.findIndex(
      (elm) => elm.parameter_name === parameter_name
    );
    newClassifier[classififier_index].parameters[idx].value = value;
    setClassifier(newClassifier);
    setSelectedClassifier(newClassifier[classififier_index]);
  };

  if (classifier.length === 0) {
    return null;
  }

  const advancedCnt = classifier[classififier_index].parameters.filter(
    (p) => p.is_advanced
  ).length;
  const basicCnt = classifier[classififier_index].parameters.filter(
    (p) => !p.is_advanced
  ).length;

  return (
    <Fragment>
      <h3 className="font-weight-bold">3. Select Classifier</h3>
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret size="lg">
          {classifier[classififier_index].name}
        </DropdownToggle>
        <DropdownMenu>
          {classifier.map((cls, idx) => (
            <DropdownItem
              onClick={() => {
                setSelectedClassifier(classifier[idx]);
                set_classifier_index(idx);
              }}
            >
              {cls.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <div>
        <div className="w-100 align-items-center mb-2">
          <div className="font-weight-bold h5 justify-self-start">
            Hyperparameters
          </div>
        </div>
        {basicCnt > 0 ? (
          <HyperparameterView
            handleHyperparameterChange={handleHyperparameterChange}
            model={classifier[classififier_index]}
            isAdvanced={false}
            hyperparameters={classifier[classififier_index].parameters}
          ></HyperparameterView>
        ) : (
          <div className="mb-3">
            {advancedCnt > 0
              ? 'No basic hyperparameters. You can find advanced hyperparameters in the following section.'
              : 'No hyperparameters'}
          </div>
        )}
        {advancedCnt > 0 ? (
          <Fragment>
            <div className="advancedHeading">
              <div className="w-100 align-items-center mb-2">
                <div className="font-weight-bold h5 justify-self-start">
                  Advanced Hyperparameters
                </div>
                <div
                  className="buttonShowAdvancedHyperparameters"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? (
                    <FontAwesomeIcon
                      className="faIconAdvancedHyperparameters"
                      size="lg"
                      icon={faCaretDown}
                    />
                  ) : (
                    <FontAwesomeIcon
                      className="faIconAdvancedHyperparameters"
                      size="lg"
                      icon={faCaretRight}
                    />
                  )}
                </div>
              </div>
            </div>
            <Collapse isOpen={showAdvanced}>
              <HyperparameterView
                handleHyperparameterChange={handleHyperparameterChange}
                hyperparameters={classifier[classififier_index].parameters}
                isAdvanced={true}
              ></HyperparameterView>
            </Collapse>
          </Fragment>
        ) : null}
      </div>
    </Fragment>
  );
};

Wizard_Hyperparameters.validate = ({ selectedClassifier }) => {
  if (!selectedClassifier) {
    return 'You need to select a classifier';
  }
};

export default Wizard_Hyperparameters;
