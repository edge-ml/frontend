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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

class LabelingPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      from: props.from,
      to: props.to,
      labeling: props.labeling,
      selectedLabelTypeId: props.selectedLabelTypeId,
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged,
      onDeleteSelectedLabel: props.onDeleteSelectedLabel,
      canEdit: props.canEdit,
      onCanEditChanged: props.onCanEditChanged
    };

    this.toggleEdit = this.toggleEdit.bind(this);
    this.onAddLabel = this.onAddLabel.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      id: props.id,
      from: props.from,
      to: props.to,
      labeling: props.labeling,
      selectedLabelTypeId: props.selectedLabelTypeId,
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged,
      onDeleteSelectedLabel: props.onDeleteSelectedLabel,
      canEdit: props.canEdit,
      onCanEditChanged: props.onCanEditChanged
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

  toggleEdit() {
    this.state.onCanEditChanged(!this.state.canEdit);
  }

  onAddLabel() {
    this.props.history.push({
      pathname: '/labelings',
      search: '?id=' + this.state.labeling.id
    });
  }

  render() {
    return (
      <Card className="LabelingPanel">
        <CardBody>
          <div className="informationBox">
            <Button
              className="m-1 btn-light"
              style={{ float: 'left' }}
              onClick={this.toggleEdit}
            >
              <FontAwesomeIcon
                style={{ color: !this.state.canEdit ? '#b71c1c' : '#43A047' }}
                icon={!this.state.canEdit ? faLock : faUnlock}
                className="mr-2"
              />
              <span
                style={{ color: !this.state.canEdit ? '#b71c1c' : '#43A047' }}
              >
                {!this.state.canEdit ? 'Locked' : 'Unlocked'}
              </span>
            </Button>
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
              disabled={
                this.state.selectedLabelTypeId === undefined ||
                !this.state.canEdit
              }
              className="deleteButton m-1"
              outline
              color="danger"
              onClick={e => this.state.onDeleteSelectedLabel()}
            >
              Delete
            </Button>
          </div>

          <div className="labelingBox">
            <Button
              className="labelingButton m-1"
              color="secondary"
              onClick={this.onAddLabel}
            >
              + Add
            </Button>
            {this.state.labeling.types.map((label, index) => (
              <Button
                className="btn-light m-1 labelingButton"
                disabled={
                  this.state.selectedLabelTypeId === undefined ||
                  !this.state.canEdit
                }
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
                {label.name} {index < 9 ? '(' + (index + 1) + ')' : ''}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default LabelingPanel;
