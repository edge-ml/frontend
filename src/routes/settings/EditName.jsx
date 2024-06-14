import React, { useContext, useState } from 'react';
import {
  InputGroup,
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
  const [projectName, setProjectName] = useState(currentProject.name);

  return (
    <Container>
      <InputGroup>
        <InputGroupText>{'Name'}</InputGroupText>
        <Input
          id="projectName"
          readOnly={false}
          placeholder={'Name'}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="ms-2">
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
        <InputGroupText>{'Admin'}</InputGroupText>
        <Input value={currentProject.admin.userName} readOnly />
      </InputGroup>
    </Container>
  );
};
export default EditName;
