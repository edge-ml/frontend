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
      labelTypes: props.labelTypes,
      selectedLabelTypeId: props.selectedLabelTypeId,
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      id: props.id,
      from: props.from,
      to: props.to,
      labelTypes: props.labelTypes,
      selectedLabelTypeId: props.selectedLabelTypeId,
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged
    }));
  }

  handleLabelTypeClicked(e, id) {
    e.preventDefault();
    this.state.onSelectedLabelTypeIdChanged(id);
  }

  render() {
    return (
      <Card className="LabelingPanel">
        <div className="selection-panel">
          <div className="input">
            <InputGroup className="input m-1">
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Id
                </InputGroupText>
              </InputGroupAddon>
              <Input
                value={this.state.id ? this.state.id : ''}
                readOnly
                className="text-right"
              />
            </InputGroup>
            <InputGroup className="input">
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  From
                </InputGroupText>
              </InputGroupAddon>
              <Input
                readOnly
                className="text-right timeInput"
                value={
                  this.state.from
                    ? new Date(this.state.from).toTimeString().split(' ')[0]
                    : ''
                }
              />
            </InputGroup>

            <InputGroup className="input">
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  To
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-right timeInput"
                readOnly
                value={
                  this.state.to
                    ? new Date(this.state.to).toTimeString().split(' ')[0]
                    : ''
                }
              />
            </InputGroup>
          </div>
          <Button className="deleteButton m-1" outline color="danger">
            Delete
          </Button>
          <span className="labelingBox">
            {this.state.labelTypes.map(label => (
              <Button
                className="btn-light m-1"
                style={
                  label.id === this.state.selectedLabelTypeId
                    ? { backgroundColor: label.color }
                    : null
                }
                onClick={e => this.handleLabelTypeClicked(e, label.id)}
              >
                {label.name}
              </Button>
            ))}
            <Button className="m-1" color="secondary">
              + Add
            </Button>
          </span>
          <hr />
        </div>
      </Card>
    );
  }
}
export default LabelingPanel;
