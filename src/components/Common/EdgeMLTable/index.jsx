import React, { Fragment } from "react";

import "./index.css";

const EdgeMLTable = ({ children, className, style }) => {
  const header = React.Children.toArray(children).find(
    (child) => child.type === EdgeMLTableHeader
  );
  const body = React.Children.toArray(children)
    .filter((elm) => elm.type !== EdgeMLTableHeader)
    .map((child, index) => {
      return React.cloneElement(child, { index: index });
    });

  return (
    <div style={{ ...style }} className={className}>
      <div className="table-header-wrapper d-flex mt-3 flex-md-row flex-column">
        {header}
      </div>
      <div className="table-body-wrapper">{body}</div>
    </div>
  );
};

const EdgeMLTableHeader = ({ children }) => {
  return <>{children}</>;
};

const EdgeMLTableEntry = ({ children, index, className }) => {
  return (
    <Fragment>
      <div
        className={"datasetCard " + className}
        style={{
          background: index % 2 === 1 ? "rgb(249, 251, 252)" : "",
        }}
      >
        {children}
      </div>
    </Fragment>
  );
};

export { EdgeMLTable, EdgeMLTableHeader, EdgeMLTableEntry };
