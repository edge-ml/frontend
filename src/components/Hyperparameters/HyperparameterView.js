import { Col, Row, Container } from 'reactstrap';
import NumberHyperparameter from './NumberHyperparameter';
import SelectionHyperparameter from './SelectionHyperparameter';

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
              {
                console.log(h);
              }
              if (h.parameter_type === 'number') {
                console.log(h);
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
