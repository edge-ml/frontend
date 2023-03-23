import {
  Input,
  ModalBody,
  Button,
  ModalFooter,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';

const Select_Name = ({ onBack, onNext, onTrain, modelName, setModelName }) => {
  return (
    <div>
      <ModalBody>
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
      </ModalBody>
      <ModalFooter className="fotter">
        <Button onClick={onBack}>Back</Button>
        <div>2/3</div>
        <Button onClick={onTrain}>Next</Button>
      </ModalFooter>
    </div>
  );
};

export default Select_Name;
