import React, { Component } from 'react';
import { BeatLoader as LoaderAnimation } from 'react-spinners';

class Loader extends Component {
  render() {
    if (this.props.loading === true) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'middle',
            justifyContent: 'center'
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
