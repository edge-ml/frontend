import React, { Component } from 'react';

import Loader from '../../modules/loader';
import { Alert } from 'reactstrap';
import { subscribeLabelingsAndLabels } from '../../services/ApiServices/LabelingServices';

import { getProjectSensorStreams } from '../../services/ApiServices/ProjectService';

import { getModels, train } from '../../services/ApiServices/MlService';
import { LabelingView } from './LabelingView';
import { TargetSensorsView } from './TargetSensorsView';
import { ClassifierView } from './ClassifierView';

class ModelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true,
      inviteRequested: false,
      labelings: undefined,
      labels: undefined,
      selectedLabeling: undefined,
      selectedLabelsFor: undefined,
      sensorStreams: undefined,
      selectedSensorStreams: [],
      models: [],
      selectedModelId: undefined,
      hyperparameters: [],
      modelName: '',
      alertText: undefined,
      trainSuccess: undefined,
      useUnlabelledFor: {},
      unlabelledNameFor: {},
      showAdvanced: false,
      requestInProgress: false,
    };

    this.initComponent = this.initComponent.bind(this);
    this.handleHyperparameterChange =
      this.handleHyperparameterChange.bind(this);
  }

  formatHyperparameters(hyperparameters) {
    return Object.entries(hyperparameters).map((e) => {
      return {
        parameter_name: e[0],
        state:
          e[1].parameter_type === 'number'
            ? e[1].default
            : e[1].multi_select
            ? e[1].default.map((x) => {
                return { value: x, label: x };
              })
            : { value: e[1].default, label: e[1].default },
      };
    });
  }

  handleHyperparameterChange(hyperparameter) {
    const newState = hyperparameter.state;
    const parameter_name = hyperparameter.parameter_name;
    this.setState((prevState) => {
      const params = prevState.hyperparameters;
      params.find((e) => e.parameter_name === parameter_name).state = newState;
      return {
        hyperparameters: params,
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
      getModels(),
    ])
      .then((result) => {
        this.setState({
          selectedLabeling: result[0].labelings[0]
            ? result[0].labelings[0]._id
            : '',
          selectedLabelsFor: result[0].labelings.reduce(
            (acc, labeling) => ({
              ...acc,
              [labeling._id]: labeling.labels.reduce(
                (c, label) => ({ ...c, [label]: true }),
                {}
              ),
            }),
            {}
          ),
          labelings: result[0].labelings,
          labels: result[0].labels,
          useUnlabelledFor: result[0].labelings.reduce(
            (acc, labeling) => ({ ...acc, [labeling._id]: false }),
            {}
          ),
          unlabelledNameFor: result[0].labelings.reduce(
            (acc, labeling) => ({ ...acc, [labeling._id]: 'Other' }),
            {}
          ),
          sensorStreams: result[1] ? result[1] : [],
          models: result[2],
          selectedModelId: result[2][0] ? result[2][0].id : '',
          modelSelection: result[2][0]
            ? { value: result[2][0].id, label: result[2][0].name }
            : {},
          hyperparameters: result[2][0]
            ? this.formatHyperparameters(result[2][0].hyperparameters)
            : [],
        });
      })
      .catch((err) => console.log(err));
  }

  handleTrainButton = (e) => {
    const resetAlert = () => {
      setTimeout(() => {
        this.setState({
          alertText: undefined,
        });
      }, 2000);
    };

    this.setState({ requestInProgress: true });
    const hyperparameterConfig = this.state.hyperparameters.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.parameter_name]: cur.state,
      }),
      {}
    );
    const hyperparameterRestrictions = Object.values(
      this.state.models[this.state.selectedModelId].hyperparameters
    ).reduce((acc, cur) => {
      if (cur.parameter_type === 'number') {
        return {
          ...acc,
          [cur.parameter_name]: {
            min: cur.number_min,
            max: cur.number_max,
          },
        };
      }
      return { ...acc };
    }, {});
    const violatingHyperparams = Object.entries(
      hyperparameterRestrictions
    ).filter(
      ([name, restriction]) =>
        hyperparameterConfig[name] !== null &&
        (restriction.min > hyperparameterConfig[name] ||
          restriction.max < hyperparameterConfig[name])
    );
    if (violatingHyperparams.length > 0) {
      this.setState({
        alertText: 'Invalid Hyperparameter Configuration',
        trainSuccess: false,
      });
      resetAlert();
      return;
    }

    const selectedLabels = Object.keys(
      this.state.selectedLabelsFor[this.state.selectedLabeling]
    ).filter(
      (x) => this.state.selectedLabelsFor[this.state.selectedLabeling][x]
    );
    if (!selectedLabels.length) {
      this.setState({
        alertText: 'Please select at least one label in target labeling',
        trainSuccess: false,
      });
      resetAlert();
      return;
    }

    train({
      model_id: this.state.selectedModelId,
      selected_timeseries: this.state.selectedSensorStreams,
      target_labeling: this.state.selectedLabeling,
      labels: selectedLabels,
      hyperparameters: this.state.hyperparameters,
      model_name: this.state.modelName,
      use_unlabelled: this.state.useUnlabelledFor[this.state.selectedLabeling],
      unlabelled_name:
        this.state.unlabelledNameFor[this.state.selectedLabeling],
    })
      .then(() => {
        this.setState({
          alertText: 'Training started successfully',
          trainSuccess: true,
          requestInProgress: false,
        });
        resetAlert();
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          alertText: err.data.detail, // breaks if err is undefined
          trainSuccess: false,
          requestInProgress: false,
        });
        resetAlert();
      });
  };

  handleLabelSelection = (labelingId, labelId) => {
    this.setState((prevState) => ({
      selectedLabelsFor: {
        ...prevState.selectedLabelsFor,
        [labelingId]: {
          ...prevState.selectedLabelsFor[labelingId],
          [labelId]: !prevState.selectedLabelsFor[labelingId][labelId],
        },
      },
    }));
  };

  handleLabelingChange = (labelingId) => {
    this.setState({ selectedLabeling: labelingId });
  };

  handleUseUnlabelledChange = (checked, id) => {
    this.setState((prevState) => ({
      useUnlabelledFor: {
        ...prevState.useUnlabelledFor,
        [id]: checked,
      },
    }));
  };

  handleUnlabelledNameChange = (name, id) => {
    this.setState((prevState) => ({
      unlabelledNameFor: {
        ...prevState.unlabelledNameFor,
        [id]: name,
      },
    }));
  };

  handleSelectedSensorStreamToggle = (sensor) => {
    if (this.state.selectedSensorStreams.includes(sensor)) {
      this.setState({
        selectedSensorStreams: this.state.selectedSensorStreams.filter(
          (z) => z !== sensor
        ),
      });
      return;
    }
    this.setState({
      selectedSensorStreams: [...this.state.selectedSensorStreams, sensor],
    });
  };

  handleSelectedSensorStreamSelectAll = (selectAll) => {
    if (selectAll) {
      this.setState({ selectedSensorStreams: this.state.sensorStreams });
    } else {
      // deselect all
      this.setState({ selectedSensorStreams: [] });
    }
  };

  handleModelSelectionChange = (modelSelection) => {
    this.setState({ modelSelection });
    this.setState({
      selectedModelId: modelSelection.value,
    });
    this.setState({
      hyperparameters: this.formatHyperparameters(
        this.state.models.find(
          (m) => m.id === parseInt(modelSelection.value, 10)
        ).hyperparameters
      ),
    });
  };

  handleModelNameChange = (e) => {
    this.setState({ modelName: e.target.value });
  };

  toggleShowAdvanced = (e) => {
    this.setState({ showAdvanced: !this.state.showAdvanced });
  };

  render() {
    return (
      <Loader loading={!this.state.ready}>
        <div>
          <div>
            {this.state.alertText ? (
              <Alert
                color={this.state.trainSuccess ? 'success' : 'danger'}
                style={{
                  marginBottom: 0,
                  position: 'fixed',
                  zIndex: 100,
                  bottom: '40px',
                  left: '50%',
                  marginLeft: '-100px',
                }}
              >
                {this.state.alertText}
              </Alert>
            ) : null}
          </div>
          <div className="container">
            <div className="row">
              <div className="col-12 col-xl-5 mt-4">
                <LabelingView
                  labelings={this.state.labelings}
                  selectedLabeling={this.state.selectedLabeling}
                  labels={this.state.labels}
                  changeSelectedLabeling={this.handleLabelingChange}
                  useUnlabelledFor={this.state.useUnlabelledFor}
                  changeUnlabelledFor={this.handleUseUnlabelledChange}
                  unlabelledNameFor={this.state.unlabelledNameFor}
                  changeUnlabelledName={this.handleUnlabelledNameChange}
                  selectedLabelsFor={this.state.selectedLabelsFor}
                  changeLabelSelection={this.handleLabelSelection}
                />
              </div>
              <div className="col-12 col-xl-7 mt-4">
                <TargetSensorsView
                  sensorStreams={this.state.sensorStreams}
                  selectedSensorStreams={this.state.selectedSensorStreams}
                  toggleSelectedSensorStreams={
                    this.handleSelectedSensorStreamToggle
                  }
                  changeAllSelectedSensorStreams={
                    this.handleSelectedSensorStreamSelectAll
                  }
                />
              </div>
              <div className="col-12 mt-4">
                <ClassifierView
                  models={this.state.models}
                  modelSelection={this.state.modelSelection}
                  changeModelSelection={this.handleModelSelectionChange}
                  modelName={this.state.modelName}
                  changeModelName={this.handleModelNameChange}
                  hyperparameters={this.state.hyperparameters}
                  selectedModelId={this.state.selectedModelId}
                  handleHyperparameterChange={this.handleHyperparameterChange}
                  handleTrainButton={this.handleTrainButton}
                  project={this.props.project}
                  showAdvanced={this.state.showAdvanced}
                  toggleShowAdvanced={this.toggleShowAdvanced}
                  requestInProgress={this.state.requestInProgress}
                />
              </div>
            </div>
          </div>
        </div>
      </Loader>
    );
  }
}

export default ModelPage;
