import React, { Component } from 'react';
import {
	Container, Col, Form,
	FormGroup, Label, Input,
	InputGroup, InputGroupAddon, InputGroupText,
	Button,
	Alert,
} from 'reactstrap';

import { PersonIcon, ShieldIcon } from 'react-octicons';

import { store, view } from 'react-easy-state';

//import Request from 'browser-request';

import Request from 'request-promise';

import update from 'immutability-helper';

class LoginPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			username: '',
			password: '',
			button: {
				color: 'secondary',
				disabled: false,
			},
		};
		this.userChange = this.userChange.bind(this);
		this.passChange = this.passChange.bind(this);
		this.submit = this.submit.bind(this);
	}

	userChange(event){
		this.setState(update(this.state, {
			$merge: {
				username: event.target.value,
			}
		}));
	}

	passChange(event){
		this.setState(update(this.state, {
			$merge: {
				password: event.target.value,
			}
		}));
	}

	submit(event){
		console.log(Request);
		this.setState(update(this.state, {
			$merge: {
				button:{
					disabled: true,
					color: 'primary',
				}
			}
		}));

		
		const options = {
			method: 'POST',
			url: 'https://aura-sleep-analysis.eu.auth0.com/oauth/token',
			form: {
				grant_type: 'password',
				client_id: '4uE1DwK5BtnyInN14LO0Lb42NXtr5MHC',
				username: this.state.username,
				password: this.state.password,
				scope: 'openid',
			}
		};

		Request(options).then((res) => {
			const response = JSON.parse(res);
			window.localStorage.setItem('id_token', response.id_token);
			// window.localStorage.getItem('id_token');
			//return Request()
		}).then((res) => {
			// test admin access
		});

		/*setTimeout(() => {
			this.setState(update(this.state, {
				$merge: {
					button:{
						disabled: true,
						color: 'success',
					}
				}
			}));

			this.props.history.push('/list')

		}, 500);*/
	}

	render(){
		return (
			<Container className="Page">
				<div className="login">
					<h2>Sign In</h2>
					<Col>
						<InputGroup>
							<InputGroupAddon addonType="prepend">
								<InputGroupText>
									<PersonIcon />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								type="username"
								name="username"
								id="username"
								placeholder="username"
								onChange={this.userChange}
							/>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<InputGroupAddon addonType="prepend">
								<InputGroupText>
									<ShieldIcon />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								type="password"
								name="password"
								id="password"
								placeholder="password"
								onChange={this.passChange}
							/>
						</InputGroup>
					</Col>
					<Col>
						<Button id="login-button" onClick={this.submit} disabled={this.state.button.disabled} color={this.state.button.color}>Login</Button>
					</Col>
				</div>
			</Container>
		);
	}
}

export default LoginPage;
