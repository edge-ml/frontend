import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faDatabase,
  faCogs,
  faPen,
  faMicrochip,
} from '@fortawesome/free-solid-svg-icons';

import './Navbar.css';
import useProjectRouter from '../../Hooks/ProjectRouter';
import { useLocation } from 'react-router-dom';

const NavbarProject = ({ project, projects, currentProject, onProjectClick }) => {
  const location = useLocation();
  const navigate = useProjectRouter();

  const getNavBarItemClasses = (location_data) => {
    const project = currentProject;
    const isSelected =
      location.pathname.toLowerCase() ===
      (
        '/' +
        project.admin.userName +
        '/' +
        project.name +
        '/' +
        location_data
      ).toLowerCase();
    return (
      'pt-2 pb-2 ps-4 small ' +
      (isSelected ? 'navbar-project-item-active' : 'navbar-project-item')
    );
  };

  return (
    <div className="w-100 text-left" key={project._id} id={project._id}>
      <div
        className="d-flex align-items-center mt-1 pt-2 pb-2 ps-2 navbar-project"
        onClick={() => onProjectClick(project)}
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
          icon={currentProject._id === project._id ? faCaretDown : faCaretRight}
          className="me-2 fa-s"
        ></FontAwesomeIcon>
        <div
          className="navbar-project pe-1"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer',
          }}
        >
          <b>{project.name}</b>
        </div>
      </div>
      {currentProject._id === project._id ? (
        <div>
          {[
            ['Datasets', faDatabase],
            ['Labelings', faPen],
            ['Models', faMicrochip],
            ['Settings', faCogs],
          ].map((elm, index) => (
            <div
              key={elm + index}
              onClick={() => {
                navigate(elm[0]);
              }}
              className={getNavBarItemClasses(elm[0])}
            >
              <FontAwesomeIcon className="me-2" icon={elm[1]}></FontAwesomeIcon>
              {elm[0]}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default NavbarProject;
