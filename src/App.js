import React, { Component } from 'react';
import {
	Container,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
	Row,
	Col
} from 'reactstrap';

import { BrowserRouter as Router, Route, Link, withRouter } from 'react-router-dom';

import { store, view } from 'react-easy-state';

import Request from 'request-promise';

import update from 'immutability-helper';

import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';

import LoginPage from './routes/login';

import ListPage from './routes/list'

import DatasetPage from './routes/dataset';

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			authed: false,
		};
		this.logoutHandler = this.logoutHandler.bind(this);
		this.listHandler = this.listHandler.bind(this);
		this.setAuth = this.setAuth.bind(this);
	}

	setAuth(authed){
		this.setState(update(this.state, {
			$merge: {
				authed: authed,
			}
		}));
	}

	logoutHandler(){
		window.localStorage.clear();
		this.setState(update(this.state, {
			$merge: {
				authed: false,
			}
		}));
	}

	listHandler(){
		this.props.history.push('/list');
	}

	componentWillMount(){
		// check if token exsists
		if(window.localStorage.getItem('id_token')){
			const options = {
				method: 'GET',
				url: 'https://edge.aura.rest/dataset/get',
				headers: {
					Authorization: `Bearer ${window.localStorage.getItem('id_token')}`,
				}
			};

			Request(options).then((res) => {
				console.log(res)
			}).catch((err) => {
				if(err.statusCode === 404){
					this.setState(update(this.state, {
						$merge: {
							authed: true,
						}
					}));
				}else{
					this.setState(update(this.state, {
						$merge: {
							authed: false,
						}
					}));
					window.localStorage.clear();
				}
			});
		}
	}

	render() {
		if(this.state.authed){
			return (
				<Container className="App">
					<Row>
						<Col>
							<Navbar color="light" light expand="md">
								<NavbarBrand>AURA Explorer</NavbarBrand>
								<Nav className="ml-auto" navbar>
									<NavItem>
										<NavLink href="#" onClick={this.listHandler}>List Datasets</NavLink>
									</NavItem>
									<NavItem>
										<NavLink href="#" onClick={this.logoutHandler}>Logout</NavLink>
									</NavItem>
								</Nav>
							</Navbar>
						</Col>
					</Row>
					<br />
					<Row>
						<Col>
							<Route exact path="/list" component={ListPage} />
							<Route exact path="/" component={ListPage} />
							<Route path="/dataset/:id" component={DatasetPage} />
						</Col>
					
					</Row>
				</Container>
			);
		}else{
			return (
				<LoginPage setAuth={this.setAuth} />
			)
		}
	}
}

export default App;
