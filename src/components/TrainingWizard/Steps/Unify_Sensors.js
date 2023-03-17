import { Container, ModalBody, ModalFooter, Button } from 'reactstrap';

const UnifySensors = ({ onNext, onBack, datasets }) => {
  const selectedDatasets = datasets.filter((elm) => elm.selected);

  return (
    <div>
      <ModalBody>
        <h3>Unify Sensors</h3>
      </ModalBody>
      <ModalFooter className="fotter">
        <Button onClick={onBack}>Back</Button>
        <div>3/4</div>
        <Button onClick={onNext}>Next</Button>
      </ModalFooter>
    </div>
  );
};

export default UnifySensors;
