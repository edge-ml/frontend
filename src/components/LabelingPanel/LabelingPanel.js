import React, { Component } from 'react';
import {
  Button,
  Card,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input
} from 'reactstrap';
import './LabelingPanel.css';

class LabelingPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      from: props.from,
      to: props.to,
      labeling: props.labelings,
      selectedLabelTypeId: '0x1483' // Test
    };
  }

  handleLabelTypeClicked(e, id) {
    e.preventDefault();
    this.setState(state => ({
      selectedLabelId: id
    }));
  }

  render() {
    return (
      <Card>
        <div className="selection-panel">
          <h5>Selected Label</h5>

          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Id
                </InputGroupText>
              </InputGroupAddon>
              <Input value={this.state.id} readOnly />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  From
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-center"
                placeholder="hh"
                type="number"
                step="1"
                value={this.state.from}
              />
              <Input
                className="text-center"
                placeholder="mm"
                type="number"
                step="1"
                value={this.state.from}
              />
              <Input
                className="text-center"
                placeholder="ss"
                type="number"
                step="1"
                value={this.state.from}
              />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  To
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-center"
                placeholder="hh"
                type="number"
                step="1"
                value={this.state.to}
              />
              <Input
                className="text-center"
                placeholder="mm"
                type="number"
                step="1"
                value={this.state.to}
              />
              <Input
                className="text-center"
                placeholder="ss"
                type="number"
                step="1"
                value={this.state.to}
              />
            </InputGroup>
          </div>
          <hr />
          <div>
            {this.state.labeling.map(label => (
              <Button
                className={'btn-light'}
                style={
                  label.id === this.state.selectedLabelId
                    ? { backgroundColor: label.color }
                    : {}
                }
                block
                onClick={e => this.handleLabelTypeClicked(e, label.id)}
              >
                {label.name}
              </Button>
            ))}
            <Button block color="secondary">
              + Add
            </Button>
          </div>
          <hr />
          <Button block outline color="danger">
            Delete
          </Button>
        </div>
      </Card>
    );
  }
}
export default LabelingPanel;
