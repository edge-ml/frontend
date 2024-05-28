import { Col, Row, Container } from 'reactstrap';
import NumberHyperparameter from './NumberHyperparameter';
import SelectionHyperparameter from './SelectionHyperparameter';
import TextHyperparameter from './TextHyperparameter';

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
              } else if (h.parameter_type === 'text') {
                return (
                  <Col className="col-md-6 col-12 pl-0">
                    <TextHyperparameter
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
