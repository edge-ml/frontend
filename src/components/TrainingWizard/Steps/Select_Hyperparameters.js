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
  modelName,
  setModelName,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [selectedClassifier, setSelectedClassifier] = useState(0);

  const hyperparameters = classifier[selectedClassifier].hyperparameters;
  const hyperparameters_basic = Object.keys(
    classifier[selectedClassifier].hyperparameters
  ).filter((elm) => !hyperparameters[elm].is_advanced);
  console.log(hyperparameters_basic);

  return (
    <div>
      <ModalBody>
        <div>
          <h3>3. Select Classifier</h3>
          <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle caret size="lg">
              {classifier[selectedClassifier].name}
            </DropdownToggle>
            <DropdownMenu>
              {classifier.map((cls, idx) => (
                <DropdownItem onClick={() => setSelectedClassifier(idx)}>
                  {cls.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <div>
            <InputGroup style={{ maxWidth: '350px' }}>
              <InputGroupAddon addonType="prepend">Model Name</InputGroupAddon>
              <Input
                type={'text'}
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                invalid={!modelName}
              ></Input>
            </InputGroup>
          </div>
          <div>
            <h4>Basic hyperparameters</h4>
            <HyperparameterView
              model={classifier[selectedClassifier]}
              isAdvanced={false}
              hyperparameters={[]}
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
              <HyperparameterView
                model={classifier[selectedClassifier]}
                isAdvanced={true}
              ></HyperparameterView>
            </Collapse>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="fotter">
        <Button onClick={onBack}>Back</Button>
        <div>2/3</div>
        <Button onClick={onTrain} color="primary">
          Train
        </Button>
      </ModalFooter>
    </div>
  );
};

export const HyperparameterView = ({
  model,
  handleHyperparameterChange,
  hyperparameters,
  isAdvanced,
}) => {
  console.log(model);

  return (
    <Container fluid>
      <Row>
        {model &&
          Object.keys(model.hyperparameters)
            .filter((h) => model.hyperparameters[h].is_advanced == isAdvanced)
            .map((h) => {
              if (model.hyperparameters[h].parameter_type === 'number') {
                return (
                  <Col className="col-md-4 col-12 pl-0">
                    <NumberHyperparameter
                      {...model.hyperparameters[h]}
                      id={'input_' + model.hyperparameters[h].parameter_name}
                      handleChange={handleHyperparameterChange}
                      // value={
                      //   hyperparameters.find(
                      //     (e) =>
                      //       e.parameter_name ===
                      //       model.hyperparameters[h].parameter_name
                      //   ).state
                      // }
                    />
                  </Col>
                );
              } else if (
                model.hyperparameters[h].parameter_type === 'selection'
              ) {
                return (
                  <Col className="col-md-4 col-12 pl-0">
                    <SelectionHyperparameter
                      {...model.hyperparameters[h]}
                      id={'input_' + model.hyperparameters[h].parameter_name}
                      handleChange={handleHyperparameterChange}
                      // value={
                      //   model.hyperparameters.find(
                      //     (e) =>
                      //       e.parameter_name ===
                      //       model.hyperparameters[h].parameter_name
                      //   ).state
                      // }
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
