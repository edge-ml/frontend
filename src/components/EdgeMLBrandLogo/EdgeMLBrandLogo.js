import React, { Fragment } from 'react';
import { NavbarBrand } from 'reactstrap';
import logoSvg from '../../logo.svg';

const EdgeMLBrandLogo = ({ href }) => {
  console.log(window.location.host);
  if (window.location.host === 'edge-ml-beta.dmz.teco.edu') {
    return (
      <NavbarBrand
        style={{ marginRight: '8px' }}
        className="dark-hover mt-2"
        href={href}
      >
        <div className="home-link">
          <img style={{ marginRight: '8px', width: '32px' }} src={logoSvg} />
          <div style={{ transform: 'translate(0px, 0.75rem)' }}>
            <b>
              <div style={{ color: 'black' }}>edge-ml</div>
              <div
                style={{ textAlign: 'end', transform: 'translate(0px, -10px)' }}
                className="font-size-small text-danger small font-weight-bold"
              >
                Beta
              </div>
            </b>
          </div>
        </div>
      </NavbarBrand>
    );
  }

  return (
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
};

export default EdgeMLBrandLogo;
