import {
  Input,
  ModalBody,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import { Fragment } from 'react';

const Select_Name = ({ modelName, setModelName, screen }) => {
  return (
    <div className="m-2">
      <h3 className="font-weight-bold">{screen + 1 + '. Model Metadata'}</h3>
      <InputGroup style={{ maxWidth: '350px' }}>
        <InputGroupText addonType="prepend">Model Name</InputGroupText>
        <Input
          type={'text'}
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          invalid={!modelName}
        ></Input>
      </InputGroup>
    </div>
  );
};

Select_Name.validate = ({ modelName }) => {
  if (!modelName) {
    return 'Model name cannot be blank';
  }
};

export default Select_Name;
