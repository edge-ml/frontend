import React from 'react';
import { Spinner } from 'reactstrap';

const Loader = (props) => {
  console.log(props.loading);
  
  if (props.loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'middle',
          justifyContent: 'center',
        }}
      >
        <Spinner className="loader" color="primary" loading={props.loading.toString()} />
      </div>
    );
  } else {
    return props.children;
  }
};

export default Loader;

export const withLoader = (pred, Wrapped) => (props) => (
  <Loader loading={!pred(props)}>
    {pred(props) ? <Wrapped {...props} /> : null}
  </Loader>
);
