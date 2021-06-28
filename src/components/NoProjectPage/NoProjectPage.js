import React, { Component } from 'react';
import './NoProjectPage.css';

class NoProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="center">
        <h2>
          {this.props.text ? (
            this.props.text
          ) : (
            <div id="noProjectPageStandardText">
              Join or{' '}
              <a onClick={this.props.onCreateProject} href="">
                create
              </a>{' '}
              a project to get started!
            </div>
          )}
        </h2>
      </div>
    );
  }
}

export default NoProjectPage;
