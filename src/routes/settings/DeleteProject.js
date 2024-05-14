import React, { useState, useCallback, useContext } from 'react';
import { Button } from 'reactstrap';
import ConfirmationDialogueModal from '../../components/ConfirmationDilaogueModal/ConfirmationDialogueModal';
import { ProjectContext } from '../../ProjectProvider';
import { AuthContext } from '../../AuthProvider';
import useProjectSettings from '../../Hooks/useProjectSettings';
import useAuth from '../../Hooks/useAuth';

const DeleteProject = (props) => {
  const { currentProject } = useContext(ProjectContext);
  const { user } = useAuth();
  const { deleteProject, leaveProject } = useProjectSettings();
  const isAdmin = user._id === currentProject.admin._id;

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
          outline
          id="buttonDeleteProject"
          onClick={() => setModalOpen(true)}
          color="danger"
        >
          Delete project
        </Button>
      ) : currentProject.users && !isAdmin ? (
        <Button
          outline
          id="buttonLeaveProject"
          onClick={() => setModalOpen(true)}
          color="danger"
        >
          Leave project
        </Button>
      ) : null}
      {modalOpen ? (
        <ConfirmationDialogueModal
          isOpen={modalOpen}
          title={isAdmin ? 'Delete Project' : 'Leave Project'}
          confirmString={
            isAdmin
              ? 'Do you want to delete this project?'
              : 'Do you want to leave this project? If you change your mind, you will have to ask the project admin to add you again.'
          }
          onConfirm={onConfirmDelte}
          onCancel={onCloseModal}
        />
      ) : null}
    </div>
  );
};

export default DeleteProject;
