import React, { useContext, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Container,
  Button,
} from 'reactstrap';
import { ProjectContext } from '../../ProjectProvider';

import './Settings.css';
import useProjectSettings from '../../Hooks/useProjectSettings';

const EditName = () => {
  const { currentProject } = useContext(ProjectContext);
  const { changeProjectName } = useProjectSettings();
  const [projectName, setProjectName] = useState();

  return (
    <Container>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>{'Name'}</InputGroupText>
        </InputGroupAddon>
        <Input
          id="projectName"
          readOnly={false}
          placeholder={'Name'}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="ml-2">
          <Button
            outline
            color="primary"
            onClick={() => changeProjectName(projectName)}
          >
            Save
          </Button>
        </div>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>{'Admin'}</InputGroupText>
        </InputGroupAddon>
        <Input value={currentProject.admin.userName} readOnly />
      </InputGroup>
    </Container>
  );
};
export default EditName;
