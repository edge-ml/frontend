import React, { Component } from "react";
import { Box, Button, Card, Group, Stack, TextInput } from "@mantine/core";
import "./LabelingPanel.css";

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
    const newHistory = this.props.history.location.pathname.split("/");
    newHistory.length -= 2;
    this.props.history.push({
      pathname: newHistory.join("/") + "/labelings",
      search: "?id=" + this.state.labeling["_id"],
      state: this.props.history.location.pathname,
    });
  }

  render() {
    return (
      <Card className="LabelingPanel edgeml-border edgeml-fade-one">
        <Group p="xs" wrap="wrap" align="flex-start">
          <Group className="labelingBox" wrap="wrap">
            <Button
              className="labelingButton"
              m="xs"
              color="gray"
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
                        className="labelingButton"
                        m="xs"
                        disabled={
                          this.state.selectedLabelTypeId === undefined ||
                          !this.state.canEdit
                        }
                        style={{
                          backgroundColor:
                            label.id === this.state.selectedLabelTypeId
                              ? label.color
                              : "white",
                          borderColor:
                            label.id === this.state.selectedLabelTypeId
                              ? null
                              : label.color,
                          color:
                            label.id === this.state.selectedLabelTypeId
                              ? null
                              : label.color,
                          borderColor: "#000",
                        }}
                        onClick={(e) =>
                          this.handleLabelTypeClicked(e, label.id)
                        }
                        key={index}
                      >
                        {label.name} {"(" + (index + 1) + ")"}
                      </Button>
                    );
                  })
              : null}
          </Group>
          <Stack className="informationBox" gap="xs">
            <TextInput
              label="From"
              value={
                this.state.from
                  ? new Date(this.state.from).toUTCString().split(" ")[4]
                  : ""
              }
              readOnly
              className="timeInput"
            />
            <TextInput
              label="To"
              value={
                this.state.to
                  ? new Date(this.state.to).toUTCString().split(" ")[4]
                  : ""
              }
              readOnly
              className="timeInput"
            />
            <Button
              disabled={
                this.state.selectedLabelTypeId === undefined ||
                !this.state.canEdit
              }
              className="deleteButton"
              variant="outline"
              color="red"
              onClick={(e) => this.state.onDeleteSelectedLabel()}
            >
              Delete
            </Button>
          </Stack>
        </Group>
      </Card>
    );
  }
}
export default LabelingPanel;
