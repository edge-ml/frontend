import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

import { faGithub } from '@fortawesome/free-brands-svg-icons';

import './Navbar.css';
import { KITLogo, TECOLogo } from '../Common/logos';

const NavbarInfo = () => {
  return (
    <>
      <div
        className="pt-3 pb-3 navbar-project-item w-100 text-center"
        onClick={() =>
          window.open('https://github.com/edge-ml/edge-ml/issues', '_blank')
        }
      >
        <small>
          <FontAwesomeIcon icon={faGithub} className="me-2" />
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
          <FontAwesomeIcon icon={faLightbulb} className="me-2" />
          Documentation
        </small>
      </div>
      <div className="navbar-project-item-color navbar-logos pt-3 px-3 pb-1">
        <div>
          <small>Open source from</small>
        </div>
        <div className="my-1 d-flex justify-content-between">
          <div>
            <a href="https://www.teco.edu" target="_blank">
              <TECOLogo style={{ width: '50px' }}></TECOLogo>
            </a>
          </div>
          <div>
            <a href="https://www.kit.edu" target="_blank">
              <KITLogo style={{ width: '50px' }}></KITLogo>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarInfo;
