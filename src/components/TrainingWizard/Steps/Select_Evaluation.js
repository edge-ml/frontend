import { useState, Fragment } from 'react';
import {
  ModalBody,
  Row,
  Col,
  Container,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  DropdownToggle,
} from 'reactstrap';
import NumberHyperparameter from '../../Hyperparameters/NumberHyperparameter';
import SelectionHyperparameter from '../../Hyperparameters/SelectionHyperparameter';

const SelectEvaluation = ({
  evaluation,
  onEvaluationChanged,
  setSelectedEval,
  footer,
}) => {
  console.log(evaluation);

  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(0);

  // useEffect(() => {
  //   const data = {
  //     name: evaluation[selectedEvaluation].name,
  //     parameters: evaluation[selectedEvaluation].parameters,
  //   };
  // }, [selectedEvaluation]);

  const handleHyperparameterChange = ({ parameter_name, state }) => {
    const newEval = [...evaluation];
    const idx = newEval[selectedEvaluation].parameters.findIndex(
      (elm) => elm.parameter_name == parameter_name
    );
    newEval[selectedEvaluation].parameters[idx].value = state;
    onEvaluationChanged(newEval);
    setSelectedEval(newEval[selectedEvaluation]);
  };

  console.log(evaluation.length);
  if (evaluation.length === 0) {
    return;
  }

  return (
    <Fragment>
      <h3>Select an evaluation strategy</h3>
      <Dropdown
        isOpen={dropDownOpen}
        toggle={() => setDropDownOpen(!dropDownOpen)}
      >
        <DropdownToggle caret size="lg">
          {evaluation[selectedEvaluation].name}
        </DropdownToggle>
        <DropdownMenu>
          {evaluation.map((evl, idx) => (
            <DropdownItem onClick={() => setSelectedEvaluation(idx)}>
              {evl.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      {evaluation[0] ? (
        <HyperparameterView
          handleHyperparameterChange={handleHyperparameterChange}
          hyperparameters={evaluation[selectedEvaluation].parameters}
        ></HyperparameterView>
      ) : null}
    </Fragment>
  );
};

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
}) => {
  return (
    <Container fluid>
      <Row>
        {hyperparameters.length > 0 &&
          hyperparameters.map((h) => {
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

export default SelectEvaluation;
