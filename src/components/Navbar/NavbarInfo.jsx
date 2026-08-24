import React from "react";
import "./Navbar.css";
import { KITLogo, TECOLogo } from "../Common/logos";

const NavbarInfo = () => {
  return (
    <>
      <div className="navbar-project-item-color navbar-logos pt-2 px-2 pb-1">
        <div style={{ whiteSpace: "nowrap", textAlign: "center" }}>
          <small>Open source from</small>
        </div>
        <div className="my-1 d-flex justify-content-between">
          <div>
            <a href="https://www.teco.edu" target="_blank" rel="noreferrer">
              <TECOLogo style={{ width: "50px" }}></TECOLogo>
            </a>
          </div>
          <div>
            <a href="https://www.kit.edu" target="_blank" rel="noreferrer">
              <KITLogo style={{ width: "50px" }}></KITLogo>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarInfo;
