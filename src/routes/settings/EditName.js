import React, { useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Container,
  Button,
} from 'reactstrap';

import './Settings.css';

const EditName = (props) => {
  const [projectName, setProjectName] = useState(props.projectName);

  return (
    <Container>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>{'Name'}</InputGroupText>
        </InputGroupAddon>
        <Input
          id="projectName"
          readOnly={props.readOnly}
          placeholder={'Name'}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="ml-2">
          <Button
            outline
            color="primary"
            onClick={() => props.onProjectNameSave(projectName)}
          >
            Save
          </Button>
        </div>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>{'Admin'}</InputGroupText>
        </InputGroupAddon>
        <Input value={props.adminUserName} readOnly />
      </InputGroup>
    </Container>
  );
};
export default EditName;
