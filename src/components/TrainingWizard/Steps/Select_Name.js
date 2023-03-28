import { Input, ModalBody, InputGroup, InputGroupAddon } from 'reactstrap';

const Select_Name = ({ modelName, setModelName, footer }) => {
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
      {footer}
    </div>
  );
};

export default Select_Name;
