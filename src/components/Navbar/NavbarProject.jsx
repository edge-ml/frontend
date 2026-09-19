import React, { useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faCogs,
  faPen,
  faMicrochip,
  faFolder,
  faFolderOpen,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  getTreeExpandedState,
  Group,
  Text,
  Tree,
  useTree,
} from "@mantine/core";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

import useProjectRouter from "../../Hooks/ProjectRouter";
import useProjectStore from "../../stores/projectStore";
import classes from "./NavbarProject.module.css";

const navItems = [
  ["Datasets", faDatabase],
  ["Labelings", faPen],
  ["Models", faMicrochip],
  ["Settings", faCogs],
];

const NavbarProject = ({ project }) => {
  const location = useLocation();
  const navigate = useProjectRouter();
  const { currentProject, setCurrentProject } = useProjectStore();

  const isActive = currentProject?._id === project._id;

  // Stable reference required by the Tree component
  const treeData = useMemo(
    () => [
      {
        value: project._id,
        label: project.name,
        children: navItems.map(([name]) => ({
          value: `${project._id}:${name}`,
          label: name,
        })),
      },
    ],
    [project._id, project.name]
  );

  const tree = useTree({
    initialExpandedState: getTreeExpandedState(
      treeData,
      isActive ? [project._id] : []
    ),
  });

  // Keep at most one project expanded: expand this one when it becomes
  // active, collapse it whenever another project takes over
  useEffect(() => {
    if (isActive) {
      tree.expand(project._id);
    } else {
      tree.collapse(project._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, project._id]);

  const isPageActive = (page) => {
    if (!isActive || !currentProject?.admin) return false;
    const matchName = `/${currentProject.admin.userName}/${currentProject.name}/${page}`;
    return location.pathname.toLowerCase().startsWith(matchName.toLowerCase());
  };

  const renderNode = ({ node, expanded, hasChildren, elementProps }) => {
    const active = hasChildren ? isActive : isPageActive(node.label);
    const icon = hasChildren
      ? expanded
        ? faFolderOpen
        : faFolder
      : navItems.find(([name]) => name === node.label)?.[1];
    const activeColor = "var(--mantine-color-brand-7)";

    if (!hasChildren) {
      // Submenu entries: bubble hugs the icon+text on the left,
      // then stretches to the right edge of the navbar
      return (
        <div
          {...elementProps}
          className={classNames(elementProps.className, classes.row)}
          onClick={(event) => {
            // Keeps the Tree's built-in expand/collapse behaviour working
            elementProps.onClick?.(event);
            navigate(node.label);
          }}
        >
          <Group
            wrap="nowrap"
            gap={6}
            className={classNames(classes.chip, {
              [classes.active]: active,
            })}
          >
            <FontAwesomeIcon
              icon={icon}
              fontSize={13}
              color={active ? activeColor : "#8b8d8f"}
            />
            <Text size="sm" c={active ? activeColor : undefined}>
              {node.label}
            </Text>
          </Group>
        </div>
      );
    }

    return (
      <Group
        wrap="nowrap"
        gap={7}
        {...elementProps}
        className={classNames(elementProps.className, classes.row, {
          [classes.active]: active,
        })}
        onClick={(event) => {
          // Keeps the Tree's built-in expand/collapse behaviour working.
          // The active project is skipped so it can never be collapsed
          // manually - it stays open until another project becomes active.
          if (!isActive) {
            elementProps.onClick?.(event);
          }
          setCurrentProject(project);
          navigate("Datasets");
        }}
      >
        <FontAwesomeIcon
          icon={faCaretRight}
          fontSize={10}
          style={{ marginLeft: 6 }}
          className={
            expanded ? classes.caretExpanded : classes.caretCollapsed
          }
        />
        <FontAwesomeIcon
          icon={icon}
          fontSize={13}
          color={active ? activeColor : "#8b8d8f"}
        />
        <Text
          size="sm"
          fw={700}
          c={active ? activeColor : undefined}
          style={{ flex: 1 }}
          truncate="end"
        >
          {node.label}
        </Text>
      </Group>
    );
  };

  return (
    <Tree
      className={classes.tree}
      data={treeData}
      tree={tree}
      levelOffset={20}
      expandOnClick
      allowRangeSelection={false}
      renderNode={renderNode}
    />
  );
};

export default NavbarProject;
