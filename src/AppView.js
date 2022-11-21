import React, { Fragment } from 'react';
import { Container } from 'reactstrap';

import './AppView.css';

const AppView = ({
  navbar,
  content,
  mobileHeader,
  mobileNavbarShown,
  onMobileNavbarClose,
}) => {
  return (
    <div className="position-relative">
      <div className="position-fixed mobile-only" style={{ zIndex: 90 }}>
        {mobileHeader}
      </div>
      <div className={`d-flex` + (mobileNavbarShown ? ' navbar-shown' : '')}>
        <div className="mobile-exclude" style={{ minWidth: 160 }} />
        <div
          className="position-fixed mobile-navbar-slider"
          style={{ zIndex: 100 }}
        >
          {navbar}
        </div>
        <Container>
          <div className="mobile-only" style={{ minHeight: 50 }} />
          {content}
        </Container>
      </div>
    </div>
  );
};

export default AppView;
