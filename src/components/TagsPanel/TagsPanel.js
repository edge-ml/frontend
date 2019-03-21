import React, { Component } from 'react';
import { Card, Badge } from 'reactstrap';
import './TagsPanel.css';

class TagsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags
    };
  }

  render() {
    return (
      <Card>
        <div className="selection-panel">
          <h5>Tags</h5>
          <div className="tagsContainer">
            {this.state.tags.map(tag => (
              <span className="m-1">
                <Badge color="secondary">{tag}</Badge>
              </span>
            ))}
          </div>
        </div>
      </Card>
    );
  }
}
export default TagsPanel;
