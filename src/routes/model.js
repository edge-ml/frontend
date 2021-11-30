import React, { Component } from 'react';

import Loader from '../modules/loader';
import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';

import { getProjectSensorStreams } from '../services/ApiServices/ProjectService';

class ModelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true,
      inviteRequested: false,
      labelingNames: [],
      selectedLabeling: undefined,
      sensorStreams: [],
      selectedSensorStreams: []
    };

    this.initComponent = this.initComponent.bind(this);
  }

  componentDidMount() {
    this.initComponent();
  }

  initComponent() {
    Promise.all([
      subscribeLabelingsAndLabels(),
      getProjectSensorStreams(this.props.project)
    ]).then(result => {
      var labelingNames = result[0].labelings.map(x => x.name);
      this.setState({
        selectedLabeling: labelingNames[0],
        labelingNames: labelingNames,
        sensorStreams: result[1] ? result[1] : []
      });
    });
  }

  render() {
    if (!this.state.ready) {
      return <Loader loading={!this.state.ready}></Loader>;
    }
    return (
      <div className="w-100 h-100 d-flex flex-row justify-content-start pl-4 pr-4">
        <div className="card mt-5" style={{ border: '0px solid white' }}>
          <div className="card-body d-flex flex-column justify-content-between align-items-start">
            <h4>Target Labeling</h4>
            <fieldset>
              {this.state.labelingNames.map(x => {
                return (
                  <div className="d-flex flex-row align-items-center mt-2">
                    <input
                      id={x}
                      type="radio"
                      onClick={y => {
                        this.setState({ selectedLabeling: x });
                      }}
                      checked={this.state.selectedLabeling == x}
                    ></input>
                    <label className="mb-0 ml-1" for={x}>
                      {x}
                    </label>
                  </div>
                );
              })}
            </fieldset>
            <small className="mt-4">
              <b>
                <i>Note:</i>
              </b>{' '}
              Model will classify based on target labeling.
            </small>
          </div>
        </div>
        <div className="card mt-5 ml-4" style={{ border: '0px solid white' }}>
          <div className="card-body h-100 d-flex flex-column align-items-start flex-column justify-content-between">
            <div>
              <h4>Target Sensor Streams</h4>
            </div>
            <fieldset>
              {this.state.sensorStreams.map(x => {
                return (
                  <div className="d-flex flex-row align-items-center mt-2">
                    <input
                      id={x}
                      type="checkbox"
                      onClick={y => {
                        if (this.state.selectedSensorStreams.includes(x)) {
                          this.setState({
                            selectedSensorStreams: this.state.selectedSensorStreams.filter(
                              z => z !== x
                            )
                          });
                        } else {
                          var tmp = this.state.selectedSensorStreams;
                          tmp.push(x);
                          this.setState({
                            selectedSensorStreams: tmp
                          });
                        }
                      }}
                    ></input>
                    <label className="mb-0 ml-1" for={x}>
                      {x}
                    </label>
                  </div>
                );
              })}
            </fieldset>
            <div>
              <small>
                <b>
                  <i>Note:</i>
                </b>{' '}
                Datasets that do not have all data streams will be dropped.
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPage;
