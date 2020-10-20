import React, { Component } from 'react';
import { Container, Col, Row, Button, Table, Badge } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import EditInstructionModal from '../components/EditInstructionModal/EditInstructionModal';

import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';
import {
  deleteExperiment,
  addExperiment,
  updateExperiment,
  subscribeExperiments
} from '../services/ApiServices/ExperimentService';

class ExperimentsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      experiments: [],
      selectedExperimentId: undefined,
      labelings: [],
      labelTypes: [],
      isReady: false,
      modal: {
        experiment: undefined,
        isOpen: false,
        isNewExperiment: false
      }
    };
  }

  componentDidMount() {
    subscribeLabelingsAndLabels().then(result =>
      this.onLabelingsAndLabelsChanged(result.labelings, result.labels)
    );
  }

  onLabelingsAndLabelsChanged = (labelings, labels) => {
    this.setState(
      {
        labelings: labelings || [],
        labelTypes: labels || []
      },
      () => {
        subscribeExperiments(experiments => {
          this.onExperimentsChanged(experiments);
        });
      }
    );
  };

  onExperimentsChanged = experiments => {
    if (experiments === undefined) experiments = this.state.experiments;
    this.setState({
      experiments: experiments,
      selectedExperimentId: experiments[0] ? experiments[0]['_id'] : undefined,
      isReady: true
    });

    if (this.props.location.pathname === '/experiments/new') {
      this.onModalAddExperiment();
    } else {
      const searchParams = new URLSearchParams(this.props.location.search);
      const id = searchParams.get('id');

      if (id) {
        let experiment = this.state.experiments.filter(
          experiment => experiment['_id'] === id
        )[0];

        this.toggleModal(experiment, false);
      }
    }
  };

  toggleModal = (experiment, isNewExperiment) => {
    if (isNewExperiment) {
      this.props.history.replace({
        pathname: '/experiments/new',
        search: null
      });
    } else {
      this.props.history.replace({
        pathname: '/experiments',
        search: '?id=' + experiment['_id']
      });
    }

    this.setState({
      modal: {
        experiment: experiment,
        isOpen: true,
        isNewExperiment: isNewExperiment
      }
    });
  };

  onModalAddExperiment = () => {
    this.toggleModal(
      {
        name: '',
        instructions: []
      },
      true
    );
  };

  onCloseModal = () => {
    this.resetURL();

    this.setState({
      modal: {
        experiment: undefined,
        isOpen: false,
        isNewExperiment: false
      }
    });
  };

  onDeleteExperiment = experimentId => {
    this.onCloseModal();

    /*
    let experiments = this.state.experiments.filter(
      experiment => experiment['_id'] !== experimentId
    );
    this.setState({
      experiments,
      selectedExperimentId: experiments[0]['_id']
    });
    */
    deleteExperiment(experimentId, this.onExperimentsChanged);
  };

  onSave = experiment => {
    if (!experiment) return;

    if (!experiment.name || experiment.name === '') {
      window.alert('Please enter a valid name.');
      return;
    }

    if (
      !experiment.instructions ||
      experiment.instructions.length === 0 ||
      experiment.instructions.some(instruction => !instruction.labelType) ||
      experiment.instructions.some(instruction => !instruction.duration) ||
      experiment.instructions.some(instruction => instruction.duration <= 0)
    ) {
      window.alert('Please enter valid instructions.');
      return;
    }

    if (this.state.modal.isNewExperiment) {
      addExperiment(experiment, this.onExperimentsChanged);
      //this.setState({
      //  experiments: [...this.state.experiments, experiment]
      //});
    } else {
      updateExperiment(experiment, this.onExperimentsChanged);
      //this.setState({
      //  experiments: this.state.experiments.map(exp =>
      //    exp['_id'] === experiment['_id'] ? experiment : exp
      //  )
      //});
    }

    this.onCloseModal();
  };

  resetURL = () => {
    this.props.history.replace({
      pathname: '/experiments',
      search: null
    });
  };

  onSelectedExperimentIdChanged = selectedExperimentId => {
    this.setState({ selectedExperimentId });
  };

  // in case a label definition no longer exists
  filterInvalidInstructions = instructions => {
    let labelings = this.state.labelings.map(labeling => {
      let labels = this.state.labelTypes.filter(label =>
        labeling.labels.includes(label['_id'])
      );
      return Object.assign({}, labeling, { labels });
    });

    return instructions.filter(instruction => {
      if (!instruction.labelingId && !instruction.labelType) return true;

      if (instruction.labelingId && !instruction.labelType) {
        return labelings.some(
          labeling => labeling['_id'] === instruction.labelingId
        );
      } else {
        return labelings.some(
          labeling =>
            labeling['_id'] === instruction.labelingId &&
            labeling.labels.some(
              label => label['_id'] === instruction.labelType
            )
        );
      }
    });
  };

  render() {
    let experiment = this.state.experiments.filter(
      experiment => experiment['_id'] === this.state.selectedExperimentId
    )[0];

    let modalExperiment = this.state.modal.experiment;
    if (modalExperiment) {
      modalExperiment.instructions = this.filterInvalidInstructions(
        modalExperiment.instructions
      );
    }

    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <Row className="mt-3 text-left">
            <Col>
              <LabelingSelectionPanel
                objectType={'experiments'}
                history={this.props.history}
                labelings={this.state.experiments}
                selectedLabelingId={this.state.selectedExperimentId}
                onSelectedLabelingIdChanged={this.onSelectedExperimentIdChanged}
              />
            </Col>
          </Row>

          <Table responsive className="mt-4">
            <thead>
              <tr className={'bg-light'}>
                <th>Label Type</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {experiment &&
                experiment.instructions.map((instruction, index) => {
                  let types = this.state.labelTypes.filter(
                    type => type['_id'] === instruction.labelType
                  );
                  if (!types || !types.length > 0) return null;

                  let label = types[0];
                  return (
                    <tr key={'tr' + index + label['_id']}>
                      <td>
                        <Badge
                          key={'badge' + index + label['_id']}
                          className="m-1"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </Badge>
                      </td>
                      <td>
                        {instruction.duration} {'ms'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>

          <Button
            block
            className="mb-5"
            color="secondary"
            outline
            onClick={e => this.toggleModal(experiment, false)}
          >
            Edit Experiment
          </Button>
        </Container>
        <EditInstructionModal
          experiment={modalExperiment}
          labelTypes={this.state.labelTypes}
          labelings={this.state.labelings}
          isOpen={this.state.modal.isOpen}
          onCloseModal={this.onCloseModal}
          onDeleteExperiment={this.onDeleteExperiment}
          onSave={this.onSave}
          isNewExperiment={this.state.modal.isNewExperiment}
        />
      </Loader>
    );
  }
}

export default view(ExperimentsPage);
