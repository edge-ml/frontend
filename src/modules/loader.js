import React from 'react';
import { Spinner } from 'reactstrap';
import EdgeMLBrandLogo from '../components/EdgeMLBrandLogo/EdgeMLBrandLogo';

import './loader.css';

const Loader = (props) => {
  if (props.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center v-100 h-100">
        <Spinner
          className="loader"
          color="primary"
          loading={props.loading.toString()}
        />
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
