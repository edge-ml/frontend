import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';

import ListPage from './routes/list';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labelings';
import ExperimentsPage from './routes/experiments';
import ErrorPage from './components/ErrorPage/ErrorPage';
import ProjectSettings from './routes/projectSettings';
import ProjectRefresh from './components/ProjectRefresh/ProjectRefresh';

class AppContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container>
        <div>{this.state.ctr}</div>
        <Switch>
          <Route
            exact
            forceRefresh
            path={[
              this.props.match.path + '/list',
              this.props.match.path + '/'
            ]}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ListPage {...props} />
              </ProjectRefresh>
            )}
          />
          <Route
            path={[
              this.props.match.path + '/labelings'
              /*this.props.match.path + "/labelings/new",*/
            ]}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <LabelingsPage {...props} />
              </ProjectRefresh>
            )}
          />
          <Route
            path={this.props.match.path + '/datasets/:id'}
            render={props => (
              <DatasetPage {...props} getVideoOptions={this.getVideoOptions} />
            )}
          />
          <Route
            exact
            path={[
              this.props.match.path + '/experiments',
              this.props.match.path + '/experiments/new'
            ]}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ExperimentsPage {...props} />
              </ProjectRefresh>
            )}
          />
          <Route
            exact
            path={this.props.match.path + '/settings'}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ProjectSettings onProjectsChanged={this.onProjectsChanged} />
              </ProjectRefresh>
            )}
          />
          <Route
            exact
            path={
              this.props.match.path + '/errorpage/:error/:errorText/:statusText'
            }
            render={props => <ErrorPage {...props} />}
          />
        </Switch>
      </Container>
    );
  }
}

export default AppContent;
