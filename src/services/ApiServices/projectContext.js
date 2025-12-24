import useProjectStore from "../../stores/projectStore";

export const getCurrentProjectId = () => {
  const { currentProject } = useProjectStore.getState();
  return currentProject?.id ?? currentProject;
};
