import React, { Component } from 'react';
import {
  Button,
  Card,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input
} from 'reactstrap';
import './SelectionPanel.css'; // Tell Webpack that Button.js uses these styles

class SelectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.from,
      to: props.to,
      labelTypes: props.labelTypes
    };
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
                  Id:
                </InputGroupText>
              </InputGroupAddon>
              <Input />
            </InputGroup>
          </div>

          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  From:
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-center"
                placeholder="hh"
                type="number"
                step="1"
              />
              <Input
                className="text-center"
                placeholder="mm"
                type="number"
                step="1"
              />
              <Input
                className="text-center"
                placeholder="ss"
                type="number"
                step="1"
              />
            </InputGroup>
          </div>

          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  To:
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-center"
                placeholder="hh"
                type="number"
                step="1"
              />
              <Input
                className="text-center"
                placeholder="mm"
                type="number"
                step="1"
              />
              <Input
                className="text-center"
                placeholder="ss"
                type="number"
                step="1"
              />
            </InputGroup>
          </div>

          <hr />
          <div>
            {this.state.labelTypes.map(i => (
              <Button
                className="typeSelectionButton"
                outline
                block
                color="success"
              >
                {i}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    );
  }
}
export default SelectionPanel;
