import React, { Fragment } from 'react';

const EdgeMLTable = ({ children, className, style }) => {
  const header = React.Children.toArray(children).find(
    (child) => child.type === EdgeMLTableHeader
  );
  console.log(React.Children.toArray(children));
  const body = React.Children.toArray(children)
    .filter((elm) => elm.type === EdgeMLTableEntry)
    .map((child, index) => {
      return React.cloneElement(child, { index });
    });

  return (
    <div style={{ borderRadius: 10, ...style }} className={className}>
      <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row flex-column align-content-baseline align-items-center font-weight-bold fs-medium">
        {header}
      </div>
      <div
        className="w-100 position-relative"
        style={{
          border: '2px solid rgb(230, 230, 234)',
          borderRadius: '0px 0px 10px 10px',
          overflow: 'hidden',
        }}
      >
        {body}
      </div>
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
        className={'datasetCard ' + className}
        style={{
          background: index % 2 === 1 ? 'rgb(249, 251, 252)' : '',
        }}
      >
        {children}
      </div>
    </Fragment>
  );
};

export { EdgeMLTable, EdgeMLTableHeader, EdgeMLTableEntry };
