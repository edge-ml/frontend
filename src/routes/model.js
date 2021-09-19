import React, { Component } from 'react';

import Loader from '../modules/loader';

class ModelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true,
      inviteRequested: false
    };
  }

  render() {
    if (!this.state.ready) {
      return <Loader loading={!this.state.ready}></Loader>;
    }
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <div className="card mt-5" style={{ border: '0px solid white' }}>
          <div className="card-body d-flex justify-content-center align-items-center flex-column">
            <h4>Closed Beta</h4>
            <div>edge-ml model generation is currently invite only.</div>
            <button
              className="btn btn-secondary mt-3"
              style={
                !this.state.inviteRequested
                  ? { display: 'block' }
                  : { display: 'none' }
              }
              onClick={() => {
                this.setState({
                  inviteRequested: true
                });
              }}
            >
              Request Access
            </button>
            <div
              className="mt-4 w-20 text-success"
              style={
                this.state.inviteRequested
                  ? { display: 'block' }
                  : { display: 'none' }
              }
            >
              <small>
                <i>Request sent! We'll let you know when you get access.</i>
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPage;
