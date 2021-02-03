import React, { Component } from 'react';
import { getProject } from '../../services/LocalStorageService';
import NoProjectPage from './../NoProjectPage/NoProjectPage';

class ProjectRefresh extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: props.project
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.project) return;
    if (prevProps.project && prevProps.project._id === this.props.project._id)
      return;
    this.setState({
      project: this.props.project
    });
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children, child => {
      if (!this.props.project || this.props.project.length === 0) {
        return <NoProjectPage></NoProjectPage>;
      }
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          key: this.props.project._id,
          project: this.props.project
        });
      }
      return child;
    });
    return childrenWithProps;
  }
}

export default ProjectRefresh;
