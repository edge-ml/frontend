import React, { useContext, useState } from "react";
import {
  InputGroup,
  InputGroupText,
  Input,
  Container,
  Button,
} from "reactstrap";

import "./Settings.css";
import useProjectSettings from "../../Hooks/useProjectSettings";
import useProjectStore from "../../stores/projectStore";

const EditName = () => {
  const { currentProject } = useProjectStore();
  const { changeProjectName } = useProjectSettings();
  const [projectName, setProjectName] = useState(currentProject.name);

  return (
    <Container>
      <InputGroup>
        <InputGroupText>{"Name"}</InputGroupText>
        <Input
          id="projectName"
          readOnly={false}
          placeholder={"Name"}
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
    </Container>
  );
};
export default EditName;
