import { useNavigate } from "react-router-dom";
import useProjectStore from "../stores/projectStore";

const useProjectRouter = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    const { currentProject } = useProjectStore.getState();
    if (currentProject && currentProject.admin && currentProject.name) {
      const { admin, name } = currentProject;
      const route = `/${admin.userName}/${name}/${path}`;
      navigate(route);
    } else {
      console.warn("Project context or properties are missing");
    }
  };

  return navigateTo;
};

export default useProjectRouter;
