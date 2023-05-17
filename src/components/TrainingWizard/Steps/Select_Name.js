import { Input, ModalBody, InputGroup, InputGroupAddon } from 'reactstrap';
import { Fragment } from 'react';

const Select_Name = ({ modelName, setModelName, footer }) => {
  return (
    <Fragment>
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        <div className="font-weight-bold h4 justify-self-start">
          8. Model Metadata
        </div>
      </div>
      <InputGroup style={{ maxWidth: '350px' }}>
        <InputGroupAddon addonType="prepend">Model Name</InputGroupAddon>
        <Input
          type={'text'}
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          invalid={!modelName}
        ></Input>
      </InputGroup>
    </Fragment>
  );
};

export default Select_Name;
