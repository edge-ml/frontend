import React, { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import useProjectSettings from "../../Hooks/useProjectSettings";
import useProjectStore from "../../stores/projectStore";

const EditName = () => {
  const { currentProject } = useProjectStore();
  const { changeProjectName } = useProjectSettings();
  const [projectName, setProjectName] = useState(currentProject.name);

  return (
    <Group gap="sm">
      <TextInput
        placeholder="Name"
        value={projectName}
        onChange={(e) => setProjectName(e.currentTarget.value)}
        style={{ flex: 1 }}
      />
      <Button onClick={() => changeProjectName(projectName)}>Save</Button>
    </Group>
  );
};

export default EditName;
