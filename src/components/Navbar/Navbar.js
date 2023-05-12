import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserSettingsModal from '../UserSettingsModal/UserSettingsModal';
import {
  faCaretDown,
  faCaretRight,
  faPlus,
  faUser,
  faDatabase,
  faCogs,
  faPen,
  faLightbulb,
  faMicrochip,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';

import { faGithub } from '@fortawesome/free-brands-svg-icons';

import './Navbar.css';
import EdgeMLBrandLogo from '../EdgeMLBrandLogo/EdgeMLBrandLogo';
import NotificationHandler from '../NotificationHandler';
import NotificationContext from '../NotificationHandler/NotificationProvider';

const navbarProjectId = (id) => `navbar-project-${id}`;

const Navbar = (props) => {
  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  const { activeNotifications } = useContext(NotificationContext);

  const getNavBarItemClasses = (location) => {
    const project = props.projects.filter(
      (x) => x._id === props.currentProjectId
    )[0];
    const isSelected =
      props.location.pathname.toLowerCase() ===
      (
        '/' +
        project.admin.userName +
        '/' +
        project.name +
        '/' +
        location
      ).toLowerCase();
    return (
      'pt-2 pb-2 pl-4 small ' +
      (isSelected ? 'navbar-project-item-active' : 'navbar-project-item')
    );
  };

  const scrollProjectIntoView = () => {
    const project = props.projects.find(
      (x) => x._id === props.currentProjectId
    );

    if (project) {
      const element = document.getElementById(navbarProjectId(project._id));
      if (element) {
        element.scrollIntoView({ inline: 'nearest', block: 'nearest' });
      }
    }
  };

  const toggleUserSettingsModal = () => {
    setUserSettingsModalOpen(!userSettingsModalOpen);
  };

  const toggleNotificationModal = () => {
    setNotificationModalOpen(!notificationModalOpen);
  };

  useEffect(() => {
    scrollProjectIntoView();
  }, [props.currentProjectId]);

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
            props.projectAvailable
              ? '/' +
                props.projectAvailable.admin.userName +
                '/' +
                props.projectAvailable.name +
                '/' +
                'datasets'
              : null
          }
        />
        <div className="w-100 mt-3 overflow-auto">
          {props.projects.map((project, index) => {
            return (
              <div
                className="w-100 text-left"
                key={project._id}
                id={navbarProjectId(project._id)}
              >
                <div
                  className="d-flex align-items-center mt-1 pt-2 pb-2 pl-2 navbar-project"
                  onClick={() => props.onProjectClick(project._id)}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <FontAwesomeIcon
                    style={{
                      color: '#8b8d8f',
                      float: 'left',
                      cursor: 'pointer',
                    }}
                    icon={
                      props.currentProjectId === project._id
                        ? faCaretDown
                        : faCaretRight
                    }
                    className="mr-2 fa-s"
                  ></FontAwesomeIcon>
                  <div
                    className="navbar-project pr-1"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                  >
                    <b>{project.name}</b>
                  </div>
                </div>
                {props.currentProjectId === project._id ? (
                  <div>
                    {[
                      ['Datasets', faDatabase],
                      ['Labelings', faPen],
                      // ['Model', faBrain],
                      ['Models', faMicrochip],
                      ['Settings', faCogs],
                    ].map((elm, indx) => (
                      <div
                        onClick={() => {
                          props.navigateTo(elm[0]);
                        }}
                        className={getNavBarItemClasses(elm[0])}
                      >
                        <FontAwesomeIcon
                          className="mr-2"
                          icon={elm[1]}
                        ></FontAwesomeIcon>
                        {elm[0]}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          onClick={() => props.onProjectEditModal(true)}
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
            className="fa-s mr-1"
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
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              {`${activeNotifications.length} ${
                activeNotifications.length > 1
                  ? 'Notifications'
                  : 'Notification'
              }`}
            </small>
          </div>
        ) : null}
        <div
          className="pt-3 pb-3 navbar-project-item w-100 text-center"
          onClick={() =>
            window.open('https://github.com/edge-ml/edge-ml/issues', '_blank')
          }
        >
          <small>
            <FontAwesomeIcon icon={faGithub} className="mr-2" />
            Report a bug
          </small>
        </div>
        <div
          className="pt-3 pb-3 navbar-project-item w-100 text-center"
          onClick={() =>
            window.open('https://github.com/edge-ml/edge-ml/wiki', '_blank')
          }
        >
          <small>
            <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
            Documentation
          </small>
        </div>
        <div
          style={{
            height: '1px',
            backgroundColor: 'darkgray',
            opacity: '0.3',
            width: '95%',
          }}
        ></div>
        <div
          id="userProfileSettings"
          className="d-flex flex-row justify-content-center navbar-project-item align-items-center pt-3 pb-3 w-100"
          onClick={toggleUserSettingsModal}
        >
          <div
            style={{
              backgroundColor: 'lightgray',
              border: '0px solid darkgray',
              width: '26px',
              height: '26px',
              borderRadius: '13px',
              overflow: 'hidden',
            }}
            className="mr-2 d-flex justify-content-center align-items-center"
          >
            <FontAwesomeIcon
              icon={faUser}
              style={{ fontSize: 'x-large', color: 'white' }}
              className="mt-2"
            />
          </div>
          {props.userName}
        </div>
      </div>
      <UserSettingsModal
        isOpen={userSettingsModalOpen}
        onClose={toggleUserSettingsModal}
        twoFAEnabled={props.twoFAEnabled}
        onLogout={() => props.onLogout(true)}
        enable2FA={props.enable2FA}
        userMail={props.userMail}
      ></UserSettingsModal>
      <NotificationHandler
        onClose={toggleNotificationModal}
        isOpen={notificationModalOpen}
      ></NotificationHandler>
    </div>
  );
};

export default Navbar;
