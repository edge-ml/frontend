import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  AppShell,
  Divider,
  Loader,
  ScrollArea,
  UnstyledButton,
} from "@mantine/core";

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
    <>
      <AppShell.Section
        pt={4}
        px={6}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <EdgeMLBrandLogo
          href={
            currentProject
              ? `/${currentProject.admin.userName}/${currentProject.name}/datasets`
              : null
          }
        />
      </AppShell.Section>

      <AppShell.Section grow mt={4} px={6} component={ScrollArea}>
        {projects.map((project) => (
          <NavbarProject key={project._id} project={project} />
        ))}

        <UnstyledButton
          id="btn-add-project"
          onClick={() => setProjectModalOpen(true)}
          className="w-100"
          style={{
            backgroundColor: "#eee",
            color: "#666",
            fontSize: "0.9rem",
            padding: "8px 12px",
            marginTop: "8px",
            borderRadius: "var(--mantine-radius-sm)",
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
          Add Project
        </UnstyledButton>
      </AppShell.Section>

      <AppShell.Section px={6} pb={4} style={{ color: "#666" }}>
        <Divider w="95%" mx="auto" />
        {activeNotifications.length > 0 && (
          <UnstyledButton
            className="w-100 text-center"
            onClick={() => setNotificationModalOpen(true)}
            style={{
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "8px 12px",
            }}
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            {`${activeNotifications.length} ${activeNotifications.length > 1 ? "Notifications" : "Notification"}`}
          </UnstyledButton>
        )}
        <Divider w="95%" mx="auto" />
        <div
          className="pt-2 pb-2 w-100 text-center"
          style={{ cursor: "pointer", fontSize: "0.8rem" }}
          onClick={() =>
            window.open("https://github.com/edge-ml/edge-ml/issues", "_blank")
          }
        >
          <FontAwesomeIcon icon={faGithub} className="me-2" />
          Report a bug
        </div>
        <Divider w="95%" mx="auto" />
        <NavbarInfo />
        <Divider w="95%" mx="auto" />
        <NavbarUserSettings />
      </AppShell.Section>

      <NotificationHandler
        onClose={() => setNotificationModalOpen(false)}
        isOpen={notificationModalOpen}
      />
      <EditProjectModal
        isOpen={projectModalOpen}
        isNewProject={true}
        onClose={() => setProjectModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
