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

import Request from 'browser-request';

import update from 'immutability-helper';

class ListPage extends Component {
	render(){
		return (
			<Container className="Page">
				<h1>LIST</h1>
			</Container>
		)
	}
}

export default ListPage;
