import React, { Component } from 'react';

import Loader from '../modules/loader';
import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';

import { getProjectSensorStreams } from '../services/ApiServices/ProjectService';

import { getModels } from '../services/ApiServices/MlService';

class ModelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true,
      inviteRequested: false,
      labelings: [],
      selectedLabeling: undefined,
      sensorStreams: [],
      selectedSensorStreams: [],
      models: [],
      selectedModelId: undefined
    };

    this.initComponent = this.initComponent.bind(this);
  }

  componentDidMount() {
    this.initComponent();
  }

  initComponent() {
    Promise.all([
      subscribeLabelingsAndLabels(),
      getProjectSensorStreams(this.props.project),
      getModels()
    ]).then(result => {
      console.log(result[0]);
      this.setState({
        selectedLabeling: result[0].labelings[0]
          ? result[0].labelings[0]._id
          : '',
        labelings: result[0].labelings,
        sensorStreams: result[1] ? result[1] : [],
        models: result[2],
        selectedModelId: result[2][0] ? result[2][0].id : ''
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
                  {this.state.labelings.map(x => {
                    return (
                      <div className="d-flex flex-row align-items-center mt-2">
                        <input
                          id={x._id}
                          type="radio"
                          onClick={y => {
                            this.setState({ selectedLabeling: x._id });
                          }}
                          checked={this.state.selectedLabeling === x._id}
                        ></input>
                        <label
                          className="mb-0 ml-1"
                          for={x._id}
                          onClick={y => {
                            this.setState({ selectedLabeling: x._id });
                          }}
                        >
                          {x.name}
                        </label>
                      </div>
                    );
                  })}
                </fieldset>
                <small className="mt-3 text-left">
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
                <div className="mt-3 text-left">
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
                <div className="d-flex flex-row justify-content-between w-100">
                  <h4>Classifier</h4>
                  <select
                    onChange={e => {
                      this.setState({ selectedModelId: e.target.value });
                    }}
                    value={this.state.selectedModelId}
                  >
                    {this.state.models.map(m => {
                      return <option value={m.id}>{m.name}</option>;
                    })}
                  </select>
                </div>

                <div
                  className="mt-3 mb-3"
                  style={{
                    width: '100%',
                    height: '0.5px',
                    backgroundColor: 'lightgray'
                  }}
                ></div>
                <h6>Hyperparameters</h6>
                {this.state.models
                  .filter(
                    m => m.id === parseInt(this.state.selectedModelId, 10)
                  )
                  .map(m => {
                    return Object.keys(m.hyperparameters).map(h => {
                      if (m.hyperparameters[h].parameter_type === 'number') {
                        return (
                          <div>
                            <i>Number Hyperparameter</i>
                          </div>
                        );
                      } else if (
                        m.hyperparameters[h].parameter_type === 'selection'
                      ) {
                        return (
                          <div>
                            <i>Selection Hyperparameter</i>
                          </div>
                        );
                      } else if (
                        m.hyperparameters[h].parameter_type === 'boolean'
                      ) {
                        return (
                          <div>
                            <i>Boolean Hyperparameter</i>
                          </div>
                        );
                      }
                    });
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPage;
