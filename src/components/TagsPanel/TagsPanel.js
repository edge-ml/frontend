import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Badge } from 'reactstrap';
import './TagsPanel.css';

class TagsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      tags: props.tags
    }));
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>Tags</b>
        </CardHeader>
        <CardBody>
          <div className="tagsContainer">
            {this.state.tags.map(tag => (
              <span className="m-1">
                <Badge color="secondary">{tag}</Badge>
              </span>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default TagsPanel;
