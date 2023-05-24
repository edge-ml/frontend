import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
} from 'reactstrap';
import './LabelingPanel.css';

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
    };

    this.toggleEdit = this.toggleEdit.bind(this);
    this.onAddLabel = this.onAddLabel.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState((state) => ({
      id: props.id,
      from: props.from,
      to: props.to,
      labeling: props.labeling,
      selectedLabelTypeId: props.selectedLabelTypeId,
      onSelectedLabelTypeIdChanged: props.onSelectedLabelTypeIdChanged,
      onDeleteSelectedLabel: props.onDeleteSelectedLabel,
      canEdit: props.canEdit,
    }));
  }

  handleLabelTypeClicked(e, id) {
    e.preventDefault();
    console.log(id);
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
    const newHistory = this.props.history.location.pathname.split('/');
    newHistory.length -= 2;
    this.props.history.push({
      pathname: newHistory.join('/') + '/labelings',
      search: '?id=' + this.state.labeling['_id'],
      state: this.props.history.location.pathname,
    });
  }

  render() {
    return (
      <Card className="LabelingPanel edgeml-border edgeml-fade-one">
        <CardBody className="p-1 d-flex flex-wrap">
          <div className="labelingBox d-flex flex-wrap">
            <Button
              className="labelingButton m-1"
              color="secondary"
              onClick={this.onAddLabel}
            >
              + Add Label
            </Button>
            {this.state.labeling
              ? this.state.labeling.labels
                  .slice(0)
                  .map((label, index, array) => {
                    return (
                      <Button
                        className="m-1 labelingButton"
                        disabled={
                          this.state.selectedLabelTypeId === undefined ||
                          !this.state.canEdit
                        }
                        style={{
                          backgroundColor:
                            label._id === this.state.selectedLabelTypeId
                              ? label.color
                              : 'white',
                          borderColor:
                            label._id === this.state.selectedLabelTypeId
                              ? null
                              : label.color,
                          color:
                            label._id === this.state.selectedLabelTypeId
                              ? null
                              : label.color,
                        }}
                        onClick={(e) =>
                          this.handleLabelTypeClicked(e, label._id)
                        }
                        key={index}
                      >
                        {label.name} {'(' + (index + 1) + ')'}
                      </Button>
                    );
                  })
              : null}
          </div>
          <div className="informationBox">
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
              onClick={(e) => this.state.onDeleteSelectedLabel()}
            >
              Delete
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default LabelingPanel;
