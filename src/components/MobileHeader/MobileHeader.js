import React from 'react';
import EdgeMLBrandLogo from '../EdgeMLBrandLogo/EdgeMLBrandLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

import './MobileHeader.css';

const MobileHeader = ({ onMenuButton = () => {}, mobileNavbarShown }) => (
  <div className="mobile-header-base w-100 bg-light pr-4">
    <div className="mobile-header-navbar-fitting d-flex justify-content-center align-items-center">
      <EdgeMLBrandLogo />
    </div>
    <FontAwesomeIcon
      icon={mobileNavbarShown ? faTimes : faBars}
      onClick={onMenuButton}
    />
  </div>
);

export default MobileHeader;
