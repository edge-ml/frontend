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

  console.log(classifier);

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

  return (
    <Fragment>
      <h3>3. Select Classifier</h3>
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret size="lg">
          {classifier[classififier_index].name}
        </DropdownToggle>
        <DropdownMenu>
          {classifier.map((cls, idx) => (
            <DropdownItem
              onClick={() => {
                setSelectedClassifier(classifier[classififier_index]);
                set_classifier_index(idx);
              }}
            >
              {cls.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <div>
        <h4>Basic hyperparameters</h4>
        <HyperparameterView
          handleHyperparameterChange={handleHyperparameterChange}
          model={classifier[classififier_index]}
          isAdvanced={false}
          hyperparameters={classifier[classififier_index].parameters}
        ></HyperparameterView>
        <div className="advancedHeading">
          <h4>Advanced hyperparameters</h4>
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
        <Collapse isOpen={showAdvanced}>
          {console.log('show advanced')}
          <HyperparameterView
            handleHyperparameterChange={handleHyperparameterChange}
            hyperparameters={classifier[classififier_index].parameters}
            isAdvanced={true}
          ></HyperparameterView>
        </Collapse>
      </div>
    </Fragment>
  );
};

export default Wizard_Hyperparameters;
