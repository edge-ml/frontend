import React from 'react';
import { Container, Row, Col, Footer, Button } from 'reactstrap';

const DeleteProject = (props) => (
  <div className="align-space-between">
    {props.project.users ? ( // users exists only on admin?
      <Button
        outline
        id="buttonDeleteProject"
        onClick={props.onDeleteProject}
        color="danger"
      >
        Delete project
      </Button>
    ) : props.userName !== props.adminUserName ? (
      <Button
        outline
        id="buttonLeaveProject"
        onClick={props.onLeaveProject}
        color="danger"
      >
        Leave project
      </Button>
    ) : null}
  </div>
);

export default DeleteProject;
