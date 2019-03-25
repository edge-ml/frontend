import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
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
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged,
      onDeleteSelectedLabel: props.onDeleteSelectedLabel
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      id: props.id,
      from: props.from,
      to: props.to,
      labelTypes: props.labelTypes,
      selectedLabelTypeId: props.selectedLabelTypeId,
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged,
      onDeleteSelectedLabel: props.onDeleteSelectedLabel
    }));
  }

  handleLabelTypeClicked(e, id) {
    e.preventDefault();
    this.state.onSelectedLabelTypeIdChanged(id);
  }

  handleDeleteClicked(e) {
    e.preventDefault();
    this.state.onDeleteSelectedLabel();
  }

  render() {
    return (
      <Card className="LabelingPanel">
        <CardBody>
          <div className="informationBox">
            <InputGroup className="inputGroup m-1">
              <InputGroupAddon addonType="prepend" className="inputGroupAddon">
                <InputGroupText className="inputLabel">Id</InputGroupText>
              </InputGroupAddon>
              <Input
                value={this.state.id ? this.state.id : ''}
                readOnly
                className="idInput text-center"
              />
            </InputGroup>
            <InputGroup className="inputGroup m-1">
              <InputGroupAddon addonType="prepend" className="inputGroupAddon">
                <InputGroupText className="inputLabel">From</InputGroupText>
              </InputGroupAddon>
              <Input
                value={
                  this.state.from
                    ? new Date(this.state.from).toUTCString().split(' ')[4]
                    : ''
                }
                readOnly
                className="timeInput text-center"
              />
            </InputGroup>
            <InputGroup className="inputGroup m-1">
              <InputGroupAddon addonType="prepend" className="inputGroupAddon">
                <InputGroupText className="inputLabel">To</InputGroupText>
              </InputGroupAddon>
              <Input
                value={
                  this.state.to
                    ? new Date(this.state.to).toUTCString().split(' ')[4]
                    : ''
                }
                readOnly
                className="timeInput text-center"
              />
            </InputGroup>
            <Button
              disabled={this.state.selectedLabelTypeId === undefined}
              className="deleteButton m-1"
              outline
              color="danger"
              onClick={e => this.state.onDeleteSelectedLabel()}
            >
              Delete
            </Button>
          </div>

          <div className="labelingBox">
            <Button className="labelingButton m-1" color="secondary">
              + Add
            </Button>
            {this.state.labelTypes.map(label => (
              <Button
                className="btn-light m-1 labelingButton"
                style={{
                  backgroundColor:
                    label.id === this.state.selectedLabelTypeId
                      ? label.color
                      : null,
                  borderColor:
                    label.id === this.state.selectedLabelTypeId
                      ? null
                      : label.color,
                  color:
                    label.id === this.state.selectedLabelTypeId
                      ? null
                      : label.color
                }}
                onClick={e => this.handleLabelTypeClicked(e, label.id)}
              >
                {label.name}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default LabelingPanel;
