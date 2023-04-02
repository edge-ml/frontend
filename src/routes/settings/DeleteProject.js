import React, { useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import ConfirmationDialogueModal from '../../components/ConfirmationDilaogueModal/ConfirmationDialogueModal';

const DeleteProject = (props) => {
  const [isAdmin, setIsAdmin] = useState(
    props.userName === props.project.admin.userName
  );
  const [modalOpen, setModalOpen] = useState(false);

  const onCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div className="align-space-between">
      {props.project.users && isAdmin ? ( // users exists only on admin?
        <Button
          outline
          id="buttonDeleteProject"
          onClick={() => setModalOpen(true)}
          color="danger"
        >
          Delete project
        </Button>
      ) : props.project.users && !isAdmin ? (
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
          onConfirm={isAdmin ? props.onDeleteProject : props.onLeaveProject}
          onCancel={onCloseModal}
        />
      ) : null}
    </div>
  );
};

export default DeleteProject;
