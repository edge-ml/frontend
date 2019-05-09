import React, { Component } from 'react';
import { Button, Input, Table } from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import './TimeSeriesPanel.css';

class DropdownPanel extends Component {
  constructor(props) {
    super(props);

    const time = new Date(props.startTime);

    this.state = {
      isOpen: false,
      year: time.getFullYear(),
      month: time.getMonth() + 1,
      date: time.getDate(),
      hour: time.getHours(),
      min: time.getMinutes(),
      sec: time.getSeconds(),
      millisec: time.getMilliseconds()
    };
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClick);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      const time = new Date(nextProps.startTime);

      this.setState({
        year: time.getFullYear(),
        month: time.getMonth() + 1,
        date: time.getDate(),
        hour: time.getHours(),
        min: time.getMinutes(),
        sec: time.getSeconds(),
        millisec: time.getMilliseconds()
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick);
  }

  handleClick = e => {
    if (this.node.contains(e.target)) {
      return;
    }

    // outside the component
    this.setState({ isOpen: false });
  };

  toggleDropdown = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return (
      <div className="dropdownWrapper" ref={node => (this.node = node)}>
        <button className="dropdownBtn" onClick={this.toggleDropdown}>
          <FontAwesomeIcon icon={faEllipsisV} size="xs" color="#999999" />
        </button>

        {this.state.isOpen ? (
          <div className="dropdown">
            {!this.props.fused ? (
              <div>
                <Table borderless>
                  <tr>
                    <td>Y</td>
                    <td>M</td>
                    <td>D</td>
                    <td>H</td>
                    <td>Min</td>
                    <td>Sec</td>
                    <td>MSec</td>
                  </tr>

                  <tr>
                    <td>
                      <Input
                        value={this.state.year}
                        min={0}
                        max={10000}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td>
                      <Input
                        value={this.state.month}
                        min={1}
                        max={12}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td>
                      <Input
                        value={this.state.date}
                        min={1}
                        max={31}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td>
                      <Input
                        value={this.state.hour}
                        min={0}
                        max={24}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td>
                      <Input
                        value={this.state.min}
                        min={0}
                        max={60}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td>
                      <Input
                        value={this.state.sec}
                        min={0}
                        max={60}
                        type="number"
                        step="1"
                      />
                    </td>
                    <td>
                      <Input
                        value={this.state.millisec}
                        min={0}
                        max={999}
                        type="number"
                        step="1"
                      />
                    </td>
                  </tr>
                </Table>
                <hr />
              </div>
            ) : null}
            <Button color="danger" block className="m-0" outline>
              Delete
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}
export default DropdownPanel;
