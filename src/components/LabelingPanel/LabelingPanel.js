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
                  Id
                </InputGroupText>
              </InputGroupAddon>
              <Input />
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
                  To
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
              <Button className="typeSelectionButton btn-light" block>
                {i}
              </Button>
            ))}
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
