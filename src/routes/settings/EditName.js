import React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Container,
} from 'reactstrap';

const EditName = (props) => (
  <Container>
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>{'Name'}</InputGroupText>
      </InputGroupAddon>
      <Input
        id="projectName"
        readOnly={props.readOnly}
        placeholder={'Name'}
        value={props.value}
        onChange={(e) => props.onNameChanged(e.target.value)}
      />
    </InputGroup>
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>{'Admin'}</InputGroupText>
      </InputGroupAddon>
      <Input value={props.adminUserName} readOnly />
    </InputGroup>
  </Container>
);
export default EditName;
