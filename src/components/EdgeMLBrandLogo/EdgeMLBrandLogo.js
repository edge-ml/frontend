import React, { Fragment } from 'react';
import { NavbarBrand } from 'reactstrap';
import logoSvg from '../../logo.svg';

const EdgeMLBrandLogo = ({ href }) => (
  <NavbarBrand
    style={{ marginRight: '8px' }}
    className="dark-hover mt-2"
    href={href}
  >
    <div className="home-link">
      <img style={{ marginRight: '8px', width: '32px' }} src={logoSvg} />
      <b>
        <div style={{ color: 'black' }}>edge-ml</div>
      </b>
    </div>
  </NavbarBrand>
);

export default EdgeMLBrandLogo;
