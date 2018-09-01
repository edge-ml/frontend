import React, { Component } from 'react';
import {
	Container
} from 'reactstrap';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import { store, view } from 'react-easy-state';

import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import LoginPage from './routes/login';

import ListPage from './routes/list'

import DatasetPage from './routes/dataset';

class App extends Component {
	render() {
		return (
			<Router>
				<Container className="App">
					<Route exact path="/login" component={LoginPage} />
					<Route exact path="/list" component={ListPage} />
					<Route path="/dataset/:id" component={DatasetPage} />
				</Container>
			</Router>
		);
	}
}

export default App;
