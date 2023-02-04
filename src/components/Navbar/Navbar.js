import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserSettingsModal from '../UserSettingsModal/UserSettingsModal';
import { NavbarBrand } from 'reactstrap';
import {
  faCaretDown,
  faCaretRight,
  faPlus,
  faUser,
  faDatabase,
  faCogs,
  faPen,
  faBrain,
  faLightbulb,
  faCheck,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons';

import { faGithub } from '@fortawesome/free-brands-svg-icons';

import './Navbar.css';
import EdgeMLBrandLogo from '../EdgeMLBrandLogo/EdgeMLBrandLogo';

const navbarProjectId = (id) => `navbar-project-${id}`;

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { userSettingsModalOpen: false };
    this.getNavBarItemClasses = this.getNavBarItemClasses.bind(this);
    this.toggleUserSettingsModal = this.toggleUserSettingsModal.bind(this);
  }

  getNavBarItemClasses(location) {
    const project = this.props.projects.filter(
      (x) => x._id === this.props.currentProjectId
    )[0];
    const isSelected =
      this.props.location.pathname.toLowerCase() ===
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
  }

  scrollProjectIntoView() {
    const project = this.props.projects.find(
      (x) => x._id === this.props.currentProjectId
    );

    if (project) {
      const element = document.getElementById(navbarProjectId(project._id));
      if (element) {
        element.scrollIntoView({ inline: 'nearest', block: 'nearest' });
      }
    }
  }

  toggleUserSettingsModal() {
    this.setState({
      userSettingsModalOpen: !this.state.userSettingsModalOpen,
    });
  }

  componentDidUpdate() {
    this.scrollProjectIntoView();
  }

  render() {
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
              this.props.projectAvailable
                ? '/' +
                  this.props.projectAvailable.admin.userName +
                  '/' +
                  this.props.projectAvailable.name +
                  '/' +
                  'datasets'
                : null
            }
          />
          <div className="w-100 mt-3 overflow-auto">
            {this.props.projects.map((project, index) => {
              return (
                <div
                  className="w-100 text-left"
                  key={project._id}
                  id={navbarProjectId(project._id)}
                >
                  <div
                    className="d-flex align-items-center mt-1 pt-2 pb-2 pl-2 navbar-project"
                    onClick={() => this.props.onProjectClick(project._id)}
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
                        this.props.currentProjectId === project._id
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
                  {this.props.currentProjectId === project._id ? (
                    <div>
                      {[
                        ['Datasets', faDatabase],
                        ['Labelings', faPen],
                        ['Model', faBrain],
                        ['Validation', faCheck],
                        ['Deploy', faFileExport],
                        ['Settings', faCogs],
                      ].map((elm, indx) => (
                        <div
                          onClick={() => {
                            this.props.navigateTo(elm[0]);
                          }}
                          className={this.getNavBarItemClasses(elm[0])}
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
            onClick={() => this.props.onProjectEditModal(true)}
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
            onClick={this.toggleUserSettingsModal}
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
            {this.props.userName}
          </div>
        </div>
        <UserSettingsModal
          isOpen={this.state.userSettingsModalOpen}
          onClose={this.toggleUserSettingsModal}
          twoFAEnabled={this.props.twoFAEnabled}
          onLogout={() => this.props.onLogout(true)}
          enable2FA={this.props.enable2FA}
          userMail={this.props.userMail}
        ></UserSettingsModal>
      </div>
    );
  }
}

export default Navbar;
