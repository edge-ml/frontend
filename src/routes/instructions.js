import React, { Component } from 'react';
import { Container, Col, Row, Button, Table, Badge } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import EditInstructionModal from '../components/EditInstructionModal/EditInstructionModal';

class InstructionsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      experiments: [
        {
          _id: '0',
          name: 'experiment 1',
          instructions: [
            {
              labelType: '000',
              duration: 10
            },
            {
              labelType: '111',
              duration: 20
            }
          ]
        },
        {
          _id: '1',
          name: 'experiment 2',
          instructions: [
            {
              labelType: '111',
              duration: 10
            },
            {
              labelType: '000',
              duration: 20
            }
          ]
        }
      ],
      selectedExperimentId: undefined,
      labelings: [
        {
          _id: '0000',
          labels: ['000', '111'],
          name: 'some labeling'
        },
        {
          _id: '1111',
          labels: ['222', '333'],
          name: 'another labeling'
        }
      ],
      labelTypes: [
        {
          _id: '000',
          name: 'aaa',
          color: '#ff6677'
        },
        {
          _id: '111',
          name: 'bbb',
          color: '#9900aa'
        },
        {
          _id: '222',
          name: 'ccc',
          color: '#445566'
        },
        {
          _id: '333',
          name: 'ddd',
          color: '#335599'
        }
      ],
      isReady: false,
      modal: {
        experiment: undefined,
        isOpen: false,
        isNewExperiment: false
      }
    };
  }

  componentDidMount() {
    this.onExperimentsChanged(this.state.experiments);

    if (this.props.location.pathname === '/instructions/new') {
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
    /*
    subscribeExperiments(experiments => {
      this.onExperimentsChanged(experiments);

      if (this.props.location.pathname === '/instructions/new') {
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
    });
    */
  }

  componentWillUnmount() {
    //unsubscribeExperiments();
  }

  onExperimentsChanged = experiments => {
    if (experiments === undefined) experiments = this.state.experiments;

    this.setState({
      experiments: experiments,
      selectedExperimentId: experiments[0]['_id'],
      isReady: true
    });
  };

  toggleModal = (experiment, isNewExperiment) => {
    if (isNewExperiment) {
      this.props.history.replace({
        pathname: '/instructions/new',
        search: null
      });
    } else {
      this.props.history.replace({
        pathname: '/instructions',
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

    let experiments = this.state.experiments.filter(
      experiment => experiment['_id'] !== experimentId
    );
    this.setState({
      experiments,
      selectedExperimentId: experiments[0]['_id']
    });
    //deleteExperiment(experimentId);
  };

  onSave = experiment => {
    if (!experiment) return;

    if (!experiment.name || experiment.name == '') {
      window.alert('Please enter a valid name.');
      return;
    }

    if (
      !experiment.instructions ||
      experiment.instructions.length === 0 ||
      experiment.instructions.some(instruction => !instruction.labelType) ||
      experiment.instructions.some(instruction => !instruction.duration)
    ) {
      window.alert('Please enter valid instructions.');
      return;
    }

    if (this.state.modal.isNewExperiment) {
      //addExperiment(experiment);
      this.setState({
        experiments: [...this.state.experiments, experiment]
      });
    } else {
      //updateExperiment(experiment);
      this.setState({
        experiments: this.state.experiments.map(exp =>
          exp['_id'] === experiment['_id'] ? experiment : exp
        )
      });
    }

    this.onCloseModal();
  };

  resetURL = () => {
    this.props.history.replace({
      pathname: '/instructions',
      search: null
    });
  };

  onSelectedExperimentIdChanged = selectedExperimentId => {
    this.setState({ selectedExperimentId });
  };

  render() {
    let experiment = this.state.experiments.filter(
      experiment => experiment['_id'] === this.state.selectedExperimentId
    )[0];

    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <Row className="mt-3 text-left">
            <Col>
              <LabelingSelectionPanel
                objectType={'instructions'}
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
                  let label = this.state.labelTypes.filter(
                    type => type['_id'] === instruction.labelType
                  )[0];
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
          experiment={this.state.modal.experiment}
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

export default view(InstructionsPage);
