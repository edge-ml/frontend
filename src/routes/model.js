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
      <div className="container">
        <div className="row">
          <div className="col-12 col-xl-5 mt-4">
            <div className="card h-100" style={{ border: '0px solid white' }}>
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
                <small className="mt-3">
                  <b>
                    <i>Note:</i>
                  </b>{' '}
                  Model will classify based on target labeling.
                </small>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-7 mt-4">
            <div className="card h-100" style={{ border: '0px solid white' }}>
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
                <div className="mt-3">
                  <small>
                    <b>
                      <i>Note:</i>
                    </b>{' '}
                    Datasets that do not have all selected sensor streams will
                    be dropped.
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 mt-4">
            <div className="card h-100" style={{ border: '0px solid white' }}>
              <div className="card-body h-100 d-flex flex-column align-items-start flex-column justify-content-between">
                <div>
                  <h4>Classifier</h4>
                </div>
                <select>
                  <option value="volvo">Random Forest Classifier</option>
                </select>
                <div
                  className="mt-3 mb-3"
                  style={{
                    width: '100%',
                    height: '0.5px',
                    backgroundColor: 'lightgray'
                  }}
                ></div>
                <h6>Hyperparameters</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPage;
