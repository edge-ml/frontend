import React, { Component } from 'react';
import { BeatLoader as LoaderAnimation } from 'react-spinners';

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
          <LoaderAnimation
            className="loader"
            sizeUnit={'px'}
            color={'rgba(100, 100, 100, 0.5)'}
            loading={true}
          />
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

export default Loader;

export const withLoader = (pred, Wrapped) => (props) =>
  (
    <Loader loading={!pred(props)}>
      {pred(props) ? <Wrapped {...props} /> : null}
    </Loader>
  );
