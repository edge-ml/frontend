import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import { Stack, UnstyledButton, Text, Tooltip, Loader } from "@mantine/core";

import "./Navbar.css";
import EdgeMLBrandLogo from "../EdgeMLBrandLogo/EdgeMLBrandLogo";
import NotificationHandler from "../NotificationHandler";
import NotificationContext from "../NotificationHandler/NotificationProvider";
import NavbarUserSettings from "./NavbarUserSettings";
import NavbarInfo from "./NavbarInfo";
import NavbarProject from "./NavbarProject";
import EditProjectModal from "../EditProjectModal/EditProjectModal";
import useProjectStore from "../../stores/projectStore";

const Navbar = () => {
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const { activeNotifications } = useContext(NotificationContext);
  const { projects, currentProject } = useProjectStore();

  if (!projects) {
    return <Loader />;
  }

  return (
    <Stack
      className="navbar-base"
      justify="space-between"
      align="center"
      gap={0}
    >
      <Stack gap={0} align="center" style={{ width: "100%", minHeight: 0 }}>
        <EdgeMLBrandLogo
          href={
            currentProject
              ? `/${currentProject.admin.userName}/${currentProject.name}/datasets`
              : null
          }
        />
        <div className="w-100 mt-3 overflow-auto">
          {projects.map((project) => (
            <NavbarProject
              key={project._id}
              project={project}
            />
          ))}
        </div>

        <UnstyledButton
          id="btn-add-project"
          onClick={() => setProjectModalOpen(true)}
          className="w-100"
          style={{
            backgroundColor: "#eee",
            color: "#666",
            fontSize: "0.9rem",
            padding: "10px 16px",
            marginTop: "12px",
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
          Add Project
        </UnstyledButton>
      </Stack>

      <Stack gap={0} align="center" className="w-100" style={{ color: "white" }}>
        {activeNotifications.length > 0 && (
          <UnstyledButton
            className="pt-3 pb-3 w-100 text-center"
            onClick={() => setNotificationModalOpen(true)}
            style={{ color: "#666", cursor: "pointer" }}
          >
            <Text size="xs">
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              {`${activeNotifications.length} ${activeNotifications.length > 1 ? "Notifications" : "Notification"}`}
            </Text>
          </UnstyledButton>
        )}
        <NavbarInfo />
        <div
          style={{
            height: "1px",
            backgroundColor: "darkgray",
            opacity: 0.3,
            width: "95%",
          }}
        />
        <NavbarUserSettings />
      </Stack>

      <NotificationHandler
        onClose={() => setNotificationModalOpen(false)}
        isOpen={notificationModalOpen}
      />
      <EditProjectModal
        isOpen={projectModalOpen}
        isNewProject={true}
        onClose={() => setProjectModalOpen(false)}
      />
    </Stack>
  );
};

export default Navbar;
