import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretRight,
  faDatabase,
  faCogs,
  faPen,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import { Stack, Text, UnstyledButton } from "@mantine/core";

import "./Navbar.css";
import useProjectRouter from "../../Hooks/ProjectRouter";
import useProjectStore from "../../stores/projectStore";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

const NavbarProject = ({ project }) => {
  const location = useLocation();
  const navigate = useProjectRouter();
  const { currentProject, setCurrentProject } = useProjectStore();

  const isActive = currentProject?._id === project._id;

  const getNavBarItemClasses = (location_data) => {
    const matchName = `/${currentProject.admin.userName}/${currentProject.name}/${location_data}`;
    const pathName = location.pathname.toLowerCase();
    return pathName.startsWith(matchName.toLowerCase());
  };

  const navItems = [
    ["Datasets", faDatabase],
    ["Labelings", faPen],
    ["Models", faMicrochip],
    ["Settings", faCogs],
  ];

  return (
    <Stack gap={0} key={project._id} className="w-100 text-left">
      <UnstyledButton
        className={classNames("d-flex align-items-center mt-1 pt-2 pb-2 ps-2", {
          "bg-primary text-white": isActive,
        })}
        onClick={() => {
          setCurrentProject(project);
          navigate("Datasets");
        }}
        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
      >
        <FontAwesomeIcon
          style={{ color: isActive ? "white" : "#8b8d8f", cursor: "pointer" }}
          icon={isActive ? faCaretDown : faCaretRight}
          className="me-2 fa-s"
        />
        <Text fw={700} truncate="end" style={{ cursor: "pointer" }}>
          {project.name}
        </Text>
      </UnstyledButton>
      {isActive && (
        <Stack gap={0}>
          {navItems.map(([name, icon]) => (
            <UnstyledButton
              key={name}
              onClick={() => navigate(name)}
              className={classNames("pt-2 pb-2 ps-4 small", {
                "navbar-project-item-active": getNavBarItemClasses(name),
                "navbar-project-item": !getNavBarItemClasses(name),
              })}
            >
              <FontAwesomeIcon className="me-2" icon={icon} />
              {name}
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default NavbarProject;
