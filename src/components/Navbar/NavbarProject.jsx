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
import { Stack, Text, UnstyledButton, Paper } from "@mantine/core";

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
        <Paper
          withBorder
          radius="sm"
          mx={6}
          my={4}
          style={{
            borderColor: "rgba(71, 187, 120, 0.3)",
            overflow: "hidden",
          }}
        >
          <Stack gap={0}>
            {navItems.map(([name, icon]) => {
              const isPageActive = getNavBarItemClasses(name);
              return (
                <UnstyledButton
                  key={name}
                  onClick={() => navigate(name)}
                  className="pt-2 pb-2 ps-3 pe-2 small"
                  style={{
                    cursor: "pointer",
                    color: isPageActive
                      ? "var(--mantine-color-brand-7)"
                      : "#666",
                    backgroundColor: isPageActive
                      ? "var(--mantine-color-brand-1)"
                      : "transparent",
                    userSelect: "none",
                  }}
                >
                  <FontAwesomeIcon className="me-2" icon={icon} />
                  {name}
                </UnstyledButton>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default NavbarProject;
