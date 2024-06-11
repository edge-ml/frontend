import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDownload } from '@fortawesome/free-solid-svg-icons';

import './Navbar.css';
import EdgeMLBrandLogo from '../EdgeMLBrandLogo/EdgeMLBrandLogo';
import NotificationHandler from '../NotificationHandler';
import NotificationContext from '../NotificationHandler/NotificationProvider';
import { ProjectContext } from '../../ProjectProvider';
import NavbarUserSettings from './NavbarUserSettings';
import NavbarInfo from './NavbarInfo';
import NavbarProject from './NavbarProject';
import EditProjectModal from '../EditProjectModal/EditProjectModal';

const Navbar = () => {
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const { activeNotifications } = useContext(NotificationContext);
  const { projects, currentProject, onProjectClick } =
    useContext(ProjectContext);

  const onProjectEditModal = () => {
    setProjectModalOpen(true);
  };

  const toggleNotificationModal = () => {
    setNotificationModalOpen(!notificationModalOpen);
  };

  return (
    <div
      className="d-flex flex-column bg-light align-items-center justify-content-between navbar-base user-select-none"
      color="light"
    >
      <div
        className="w-100 d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: 0 }}
      >
        <EdgeMLBrandLogo
          href={
            currentProject
              ? '/' +
                currentProject.admin.userName +
                '/' +
                currentProject.name +
                '/' +
                'datasets'
              : null
          }
        />
        <div className="w-100 mt-3 overflow-auto">
          {projects.map((project, index) => {
            return (
              <NavbarProject
                project={project}
                key={'navbarItem' + project._id}
              ></NavbarProject>
            );
          })}
        </div>

        <div
          onClick={() => onProjectEditModal(true)}
          id="btn-add-project"
          className="w-100 mt-3 pt-2 pb-2 navbar-project text-center"
          style={{
            backgroundColor: '#eee',
            border: '0px solid transparent',
            color: '#666',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon
            id="btnAddProject"
            icon={faPlus}
            className="fa-s me-1"
          />
          Add Project
        </div>
      </div>
      <div></div>

      <div className="d-flex flex-column footer w-100 text-light justify-content-center align-items-center">
        {activeNotifications.length > 0 ? (
          <div
            className="pt-3 pb-3 navbar-project-item w-100 text-center"
            onClick={toggleNotificationModal}
          >
            <small>
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              {`${activeNotifications.length} ${
                activeNotifications.length > 1
                  ? 'Notifications'
                  : 'Notification'
              }`}
            </small>
          </div>
        ) : null}
        <NavbarInfo></NavbarInfo>
        <div
          style={{
            height: '1px',
            backgroundColor: 'darkgray',
            opacity: '0.3',
            width: '95%',
          }}
        ></div>
        <NavbarUserSettings></NavbarUserSettings>
      </div>
      <NotificationHandler
        onClose={() => setNotificationModalOpen(false)}
        isOpen={notificationModalOpen}
      ></NotificationHandler>
      <EditProjectModal
        isOpen={projectModalOpen}
        isNewProject={true}
        onClose={() => setProjectModalOpen(false)}
      ></EditProjectModal>
    </div>
  );
};

export default Navbar;
