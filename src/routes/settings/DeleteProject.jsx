import React, { useState, useCallback } from "react";
import { Button } from "@mantine/core";
import ConfirmationDialogueModal from "../../components/ConfirmationDilaogueModal/ConfirmationDialogueModal";
import useProjectSettings from "../../Hooks/useProjectSettings";
import useUserStore from "../../Hooks/useUser";
import useProjectStore from "../../stores/projectStore";

const DeleteProject = (props) => {
  const { currentProject } = useProjectStore();
  const { user } = useUserStore();
  const { deleteProject, leaveProject } = useProjectSettings();
  const isAdmin = user.id === currentProject.admin.id;

  const [modalOpen, setModalOpen] = useState(false);

  const onCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const onConfirmDelte = () => {
    isAdmin ? deleteProject() : leaveProject();
    onCloseModal();
  };

  return (
    <div className="align-space-between">
      {currentProject.users && isAdmin ? ( // users exists only on admin?
        <Button
          variant="outline"
          id="buttonDeleteProject"
          onClick={() => setModalOpen(true)}
          color="red"
        >
          Delete project
        </Button>
      ) : currentProject.users && !isAdmin ? (
        <Button
          variant="outline"
          id="buttonLeaveProject"
          onClick={() => setModalOpen(true)}
          color="red"
        >
          Leave project
        </Button>
      ) : null}
      {modalOpen ? (
        <ConfirmationDialogueModal
          isOpen={modalOpen}
          title={isAdmin ? "Delete Project" : "Leave Project"}
          confirmString={
            isAdmin
              ? "Do you want to delete this project?"
              : "Do you want to leave this project? If you change your mind, you will have to ask the project admin to add you again."
          }
          onConfirm={onConfirmDelte}
          onCancel={onCloseModal}
        />
      ) : null}
    </div>
  );
};

export default DeleteProject;
