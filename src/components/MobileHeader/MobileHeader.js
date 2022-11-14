import React, { Fragment } from 'react';
import EdgeMLBrandLogo from '../EdgeMLBrandLogo/EdgeMLBrandLogo';

import './MobileHeader.css';

const MobileHeader = ({}) => (
  <div className="mobile-header-base d-flex bg-light">
    <div className="mobile-header-navbar-fitting d-flex justify-content-center align-items-center">
      <EdgeMLBrandLogo />
    </div>
  </div>
);

export default MobileHeader;
