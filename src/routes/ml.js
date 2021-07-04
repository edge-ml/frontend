import React, { Component } from 'react';

import Loader from '../modules/loader';

class MlPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true
    };
  }

  render() {
    if (!this.state.ready) {
      return <Loader loading={!this.state.ready}></Loader>;
    }
    return (
      <h2
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '500px'
        }}
      >
        Machine learning comming soon...
      </h2>
    );
  }
}

export default MlPage;
