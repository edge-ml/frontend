import React from "react";
import EdgeMLBrandLogo from "../EdgeMLBrandLogo/EdgeMLBrandLogo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

import "./MobileHeader.css";

const MobileHeader = ({
  onMenuButton = () => {},
  mobileNavbarShown,
  projectAvailable,
}) => {
  const getProjectOwnerSlug = (admin) =>
    admin?.userName || admin?.username || admin?.email || "project";

  return (
    <div className="mobile-header-base w-100 bg-light pe-4">
      <div className="mobile-header-navbar-fitting d-flex justify-content-center align-items-center">
        <EdgeMLBrandLogo
          href={
            projectAvailable
              ? "/" +
                getProjectOwnerSlug(projectAvailable.admin) +
                "/" +
                projectAvailable.name +
                "/" +
                "datasets"
              : null
          }
        />
      </div>
      <FontAwesomeIcon
        icon={mobileNavbarShown ? faTimes : faBars}
        onClick={onMenuButton}
      />
    </div>
  );
};

export default MobileHeader;
