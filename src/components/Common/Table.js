import { Fragment } from 'react';

export const Table = ({ children, header }) => {
  return (
    <div style={{ borderRadius: 10 }}>
      <div className="datasets-header-wrapper mt-3 d-flex justify-content-between flex-md-row flex-column align-content-baseline">
        <div className="d-flex flex-row align-items-center p-1">{header}</div>
      </div>
      <div
        className="w-100 position-relative"
        style={{
          border: '2px solid rgb(230, 230, 234)',
          borderRadius: '0px 0px 10px 10px',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const TableEntry = ({ index, children }) => {
  console.log(children);
  return (
    <Fragment>
      <div
        className="datasetCard"
        style={{
          background: index % 2 === 1 ? 'rgb(249, 251, 252)' : '',
        }}
      >
        {children}
      </div>
    </Fragment>
  );
};
