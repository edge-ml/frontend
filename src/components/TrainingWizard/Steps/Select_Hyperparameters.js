import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  Col,
  Container,
  Collapse,
  ModalBody,
  Button,
  ModalFooter,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import { getModels } from '../../../services/ApiServices/MlService';
import NumberHyperparameter from '../../Hyperparameters/NumberHyperparameter';
import SelectionHyperparameter from '../../Hyperparameters/SelectionHyperparameter';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

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
    <div>
      <ModalBody>
        <div>
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
        </div>
      </ModalBody>
      {footer}
    </div>
  );
};

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
  isAdvanced,
}) => {
  return (
    <Container fluid>
      <Row>
        {hyperparameters.length > 0 &&
          hyperparameters
            .filter((h) => h.is_advanced === isAdvanced)
            .map((h) => {
              if (h.parameter_type === 'number') {
                return (
                  <Col className="col-md-6 col-12 pl-0">
                    <NumberHyperparameter
                      {...h}
                      id={'input_' + h.parameter_name}
                      handleChange={handleHyperparameterChange}
                      value={h.value}
                    />
                  </Col>
                );
              } else if (h.parameter_type === 'selection') {
                console.log(h.value);
                return (
                  <Col className="col-md-6 col-12 pl-0">
                    <SelectionHyperparameter
                      {...h}
                      id={'input_' + h.parameter_name}
                      handleChange={handleHyperparameterChange}
                      value={h.value}
                    />
                  </Col>
                );
              }
            })}
      </Row>
    </Container>
  );
};

export default Wizard_Hyperparameters;
