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
          {this.props.text
            ? this.props.text
            : 'Join or create a project to get started!'}
        </h2>
      </div>
    );
  }
}

export default NoProjectPage;
