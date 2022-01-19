import React, { Component } from 'react';

import Loader from '../modules/loader';
import Select from 'react-select';
import { Button } from 'reactstrap';
import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';
import { getAccessToken } from '../services/LocalStorageService';

import { getProjectSensorStreams } from '../services/ApiServices/ProjectService';

import { getModels } from '../services/ApiServices/MlService';

import NumberHyperparameter from '../components/Hyperparameters/NumberHyperparameter';
import SelectionHyperparameter from '../components/Hyperparameters/SelectionHyperparameter';
import axios from 'axios';

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
      selectedModelId: undefined,
      hyperparameters: []
    };

    this.initComponent = this.initComponent.bind(this);
    this.handleHyperparameterChange = this.handleHyperparameterChange.bind(
      this
    );
  }

  formatHyperparameters(hyperparameters) {
    return Object.entries(hyperparameters).map(e => {
      return {
        parameter_name: e[0],
        state:
          e[1].parameter_type === 'number'
            ? e[1].default
            : e[1].multi_select
            ? e[1].default.map(x => {
                return { value: x, label: x };
              })
            : { value: e[1].default, label: e[1].default }
      };
    });
  }

  handleHyperparameterChange(hyperparameter) {
    const newState = hyperparameter.state;
    const parameter_name = hyperparameter.parameter_name;
    this.setState(prevState => {
      const params = prevState.hyperparameters;
      params.find(e => e.parameter_name === parameter_name).state = newState;
      return {
        hyperparameters: params
      };
    });
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
      this.setState({
        selectedLabeling: result[0].labelings[0]
          ? result[0].labelings[0]._id
          : '',
        labelings: result[0].labelings,
        sensorStreams: result[1] ? result[1] : [],
        models: result[2],
        selectedModelId: result[2][0] ? result[2][0].id : '',
        modelSelection: result[2][0]
          ? { value: result[2][0].id, label: result[2][0].name }
          : {},
        hyperparameters: result[2][0]
          ? this.formatHyperparameters(result[2][0].hyperparameters)
          : []
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
                  {this.state.labelings.length
                    ? this.state.labelings.map(x => {
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
                      })
                    : 'There are no labelings defined'}
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
                  {this.state.sensorStreams.length
                    ? this.state.sensorStreams.map(x => {
                        return (
                          <div className="d-flex flex-row align-items-center mt-2">
                            <input
                              id={x}
                              type="checkbox"
                              onClick={y => {
                                if (
                                  this.state.selectedSensorStreams.includes(x)
                                ) {
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
                      })
                    : 'There are no sensor streams defined'}
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
                  <Select
                    options={this.state.models.map(m => {
                      return { value: m.id, label: m.name };
                    })}
                    value={this.state.modelSelection}
                    onChange={modelSelection => {
                      this.setState({ modelSelection });
                      this.setState({ selectedModelId: modelSelection.value });
                      this.setState({
                        hyperparameters: this.formatHyperparameters(
                          this.state.models.find(
                            m => m.id === parseInt(modelSelection.value, 10)
                          ).hyperparameters
                        )
                      });
                    }}
                    isSearchable={false}
                    styles={{
                      valueContainer: () => ({
                        width: 200,
                        height: 25
                      })
                    }}
                  ></Select>
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
                {console.log('rendering')}
                {console.log(this.state.hyperparameters)}
                {this.state.models
                  .filter(
                    m => m.id === parseInt(this.state.selectedModelId, 10)
                  )
                  .map(m => {
                    return Object.keys(m.hyperparameters).map((h, index) => {
                      if (m.hyperparameters[h].parameter_type === 'number') {
                        {
                          console.log(
                            this.state.hyperparameters.find(
                              e =>
                                e.parameter_name ===
                                m.hyperparameters[h].parameter_name
                            )
                          );
                        }
                        return (
                          <NumberHyperparameter
                            {...m.hyperparameters[h]}
                            id={index}
                            handleChange={this.handleHyperparameterChange}
                            value={
                              this.state.hyperparameters.find(
                                e =>
                                  e.parameter_name ===
                                  m.hyperparameters[h].parameter_name
                              ).state
                            }
                          />
                        );
                      } else if (
                        m.hyperparameters[h].parameter_type === 'selection'
                      ) {
                        return (
                          <SelectionHyperparameter
                            {...m.hyperparameters[h]}
                            id={index}
                            handleChange={this.handleHyperparameterChange}
                            value={
                              this.state.hyperparameters.find(
                                e =>
                                  e.parameter_name ===
                                  m.hyperparameters[h].parameter_name
                              ).state
                            }
                          />
                        );
                      }
                    });
                  })}
                <Button
                  onClick={e => {
                    console.log(this.state.modelSelection);
                    console.log(this.state.hyperparameters);
                    const config = {
                      method: 'post',
                      url: 'http://localhost:3003/ml/train',
                      headers: {
                        Authorization: getAccessToken(),
                        project: this.props.project._id,
                        'Content-Type': 'application/json'
                      },
                      data: {
                        model_id: this.state.selectedModelId,
                        selected_timeseries: this.state.selectedSensorStreams,
                        target_labeling: this.state.selectedLabeling,
                        hyperparameters: this.state.hyperparameters
                      }
                    };
                    axios(config)
                      .then(res => console.log(res))
                      .catch(err => console.log(err));
                  }}
                  project={this.props.project}
                >
                  Train Model
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPage;
