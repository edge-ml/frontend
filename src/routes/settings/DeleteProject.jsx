import React, { useState } from "react";
import { Button } from "@mantine/core";
import ConfirmationDialogueModal from "../../components/ConfirmationDilaogueModal/ConfirmationDialogueModal";
import useProjectSettings from "../../Hooks/useProjectSettings";
import useUserStore from "../../Hooks/useUser";
import useProjectStore from "../../stores/projectStore";

const DeleteProject = () => {
  const { currentProject } = useProjectStore();
  const { user } = useUserStore();
  const { deleteProject, leaveProject } = useProjectSettings();
  const isAdmin = user._id === currentProject.admin._id;
  const [modalOpen, setModalOpen] = useState(false);

  const onCloseModal = () => setModalOpen(false);

  const onConfirmDelete = () => {
    isAdmin ? deleteProject() : leaveProject();
    onCloseModal();
  };

  if (!currentProject.users) return null;

  return (
    <>
      <Button variant="outline" color="red" onClick={() => setModalOpen(true)}>
        {isAdmin ? "Delete project" : "Leave project"}
      </Button>
      <ConfirmationDialogueModal
        isOpen={modalOpen}
        title={isAdmin ? "Delete Project" : "Leave Project"}
        confirmString={
          isAdmin
            ? "Do you want to delete this project?"
            : "Do you want to leave this project? If you change your mind, you will have to ask the project admin to add you again."
        }
        onConfirm={onConfirmDelete}
        onCancel={onCloseModal}
      />
    </>
  );
};

export default DeleteProject;
