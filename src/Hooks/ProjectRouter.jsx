import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import useProjectStore from "../stores/projectStore";

const useProjectRouter = () => {
  const navigate = useNavigate();
  const { currentProject } = useProjectStore();

  const getProjectOwnerSlug = (admin) =>
    admin?.userName || admin?.username || admin?.email || "project";

  const navigateTo = (path) => {
    // Ensure the context and required properties are available
    if (currentProject && currentProject.admin && currentProject.name) {
      const { admin, name } = currentProject;
      const ownerSlug = getProjectOwnerSlug(admin);
      const route = `/${ownerSlug}/${name}/${path}`;
      navigate(route);
    } else {
      console.warn("Project context or properties are missing");
    }
  };

  return navigateTo;
};

export default useProjectRouter;
