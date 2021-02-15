import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import './CombineTimeSeriesModal.css';

class CombineTimeSeriesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTimeSeries: [],
      modalState: {
        isOpen: false
      }
    };

    this.onCloseModal = this.onCloseModal.bind(this);
    this.onFuse = this.onFuse.bind(this);
  }

  onCloseModal() {
    this.setState(state => ({
      timeSeries: this.props.timeSeries,
      selectedTimeSeries: [],
      modalState: {
        isOpen: false
      }
    }));
    this.props.onFuseCanceled();
  }

  onTimeSeriesSelectedChanged(isChecked, id) {
    this.setState(state => ({
      timeSeries: this.props.timeSeries,
      selectedTimeSeries: isChecked
        ? [...this.state.selectedTimeSeries, id]
        : this.state.selectedTimeSeries.filter(seriesId => seriesId !== id)
    }));
  }

  onFuse() {
    if (this.state.selectedTimeSeries.length < 2) return;
    this.props.onFuse(this.state.selectedTimeSeries);
    this.setState(state => ({
      timeSeries: this.props.timeSeries,
      selectedTimeSeries: [],
      modalState: {
        isOpen: false
      }
    }));
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>Fuse Multiple Time Series</ModalHeader>
        <ModalBody>
          {!this.props.timeSeries || this.props.timeSeries.length === 0 ? (
            <p className="text-muted m-1">No time series available.</p>
          ) : null}
          {this.props.timeSeries
            ? this.props.timeSeries.map((series, key) => (
                <InputGroup key={series['_id']} style={{ margin: '10px 0px' }}>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <Input
                        id="checkboxTimeSeries"
                        addon
                        type="checkbox"
                        checked={
                          this.state.selectedTimeSeries.filter(
                            filteredSeries => filteredSeries === series['_id']
                          ).length !== 0
                        }
                        onChange={e =>
                          this.onTimeSeriesSelectedChanged(
                            e.target.checked,
                            series['_id']
                          )
                        }
                      />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    defaultValue={series.name}
                    className={
                      this.state.selectedTimeSeries.filter(
                        filteredSeries => filteredSeries === series['_id']
                      ).length !== 0
                        ? 'inputChecked'
                        : 'inputNotChecked'
                    }
                  />
                </InputGroup>
              ))
            : null}
        </ModalBody>
        <ModalFooter>
          <Button
            id="buttonFuseTimeSeries"
            disabled={this.state.selectedTimeSeries.length <= 1}
            color="primary"
            className="m-1 mr-auto"
            onClick={this.onFuse}
          >
            Fuse
          </Button>{' '}
          <Button
            id="buttonCancelFuse"
            color="secondary"
            className="m-1"
            onClick={this.onCloseModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default CombineTimeSeriesModal;
