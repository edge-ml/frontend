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
              <Input
                value={this.state.id ? this.state.id : ''}
                readOnly
                className="text-right"
              />
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
                readOnly
                className="text-right"
                value={
                  this.state.from
                    ? new Date(this.state.from).toTimeString().split(' ')[0]
                    : ''
                }
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
                className="text-right"
                readOnly
                value={
                  this.state.to
                    ? new Date(this.state.to).toTimeString().split(' ')[0]
                    : ''
                }
              />
            </InputGroup>
          </div>
          <hr />
          <div>
            {this.state.labelTypes.map(label => (
              <Button
                className={'btn-light'}
                style={
                  label.id === this.state.selectedLabelTypeId
                    ? { backgroundColor: label.color }
                    : null
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
