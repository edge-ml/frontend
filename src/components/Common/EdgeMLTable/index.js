import React from 'react';

const EdgeMLTable = ({ children }) => {
  const header = React.Children.toArray(children).find(
    (child) => child.type === EdgeMLTableHeader
  );

  const body = React.Children.toArray(children).filter(
    (child) => child.type === EdgeMLTableBody
  );

  return (
    <div style={{ borderRadius: 10 }}>
      <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row flex-column align-content-baseline">
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

const EdgeMLTableBody = ({ children }) => {
  return <>{children}</>;
};

export { EdgeMLTable, EdgeMLTableHeader, EdgeMLTableBody };
