import React, { useState } from "react";
import { Button, Group, TextInput } from "@mantine/core";

import useProjectSettings from "../../Hooks/useProjectSettings";
import useProjectStore from "../../stores/projectStore";

const EditName = () => {
  const { currentProject } = useProjectStore();
  const { changeProjectName } = useProjectSettings();
  const [projectName, setProjectName] = useState(currentProject.name);

  return (
    <Group align="flex-end" wrap="nowrap">
      <TextInput
        id="projectName"
        label="Name"
        placeholder="Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        style={{ flex: 1 }}
      />
      <Button onClick={() => changeProjectName(projectName)}>Save</Button>
    </Group>
  );
};
export default EditName;
