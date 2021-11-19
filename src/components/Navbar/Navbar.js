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
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

import { faGithub } from '@fortawesome/free-brands-svg-icons';

import './Navbar.css';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { userSettingsModalOpen: false };
    this.getNavBarItemClasses = this.getNavBarItemClasses.bind(this);
    this.toggleUserSettingsModal = this.toggleUserSettingsModal.bind(this);
  }

  getNavBarItemClasses(location) {
    const project = this.props.projects.filter(
      x => x._id === this.props.currentProjectId
    )[0];
    const isSelected =
      this.props.location.pathname ===
      '/' + project.admin.userName + '/' + project.name + '/' + location;
    return (
      'pt-2 pb-2 pl-4 small ' +
      (isSelected ? 'navbar-project-item-active' : 'navbar-project-item')
    );
  }

  toggleUserSettingsModal() {
    this.setState({
      userSettingsModalOpen: !this.state.userSettingsModalOpen
    });
  }

  render() {
    return (
      <div
        className="d-flex flex-column bg-light align-items-center justify-content-between shadow navbar-base"
        color="light"
      >
        <div className="w-100 d-flex flex-column justify-content-center align-items-center">
          <NavbarBrand
            style={{ marginRight: '8px' }}
            className="dark-hover mt-2"
          >
            <a
              className="home-link"
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
            >
              <img
                style={{ marginRight: '8px', width: '32px' }}
                src={require('../../logo.svg')}
              />
              <b>
                <div style={{ color: 'black' }}>edge-ml</div>
              </b>
            </a>
          </NavbarBrand>
          <div className="w-100 mt-3">
            {this.props.projects.map((project, index) => {
              return (
                <div className="w-100 text-left" key={project._id}>
                  <div
                    className="d-flex align-items-center mt-1 pt-2 pb-2 pl-2 navbar-project"
                    onClick={() => this.props.onProjectClick(project._id)}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    <FontAwesomeIcon
                      style={{
                        color: '#8b8d8f',
                        float: 'left',
                        cursor: 'pointer'
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
                        cursor: 'pointer'
                      }}
                    >
                      <b>{project.name}</b>
                    </div>
                  </div>
                  {this.props.currentProjectId === project._id ? (
                    <div>
                      {[
                        ['datasets', faDatabase],
                        ['labelings', faPen],
                        ['model', faBrain],
                        ['settings', faCogs]
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
                          Datasets
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
            style={{}}
            className="w-100 mt-3 pt-2 pb-2 navbar-project text-center"
            style={{
              backgroundColor: '#eee',
              border: '0px solid transparent',
              color: '#666',
              fontSize: '0.9rem',
              cursor: 'pointer'
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
              width: '95%'
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
                overflow: 'hidden'
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
