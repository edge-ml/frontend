import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

class Loader extends Component {
  render() {
    {
      console.log(this.props.loading);
    }
    if (this.props.loading) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'middle',
            justifyContent: 'center',
          }}
        >
          <Spinner className="loader" color="primary" loading={true} />
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

export default Loader;

export const withLoader = (pred, Wrapped) => (props) => (
  <Loader loading={!pred(props)}>
    {pred(props) ? <Wrapped {...props} /> : null}
  </Loader>
);
