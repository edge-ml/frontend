import React, { Component } from 'react';
import {
	Container, Col, Form,
	FormGroup, Label, Input,
	InputGroup, InputGroupAddon, InputGroupText,
	Button,
	Alert,
} from 'reactstrap';

import Request from 'request-promise';

import update from 'immutability-helper';

class DatasetPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			result: '',
		};
	}

	componentDidMount(){
		const { id } = this.props.match.params;
		const options = {
			method: 'GET',
			url: `http://localhost:3000/dataset/get/${id}`,
			headers: {
				Authorization: `Bearer ${window.localStorage.getItem('id_token')}`
			},
		};

		Request(options).then((res) => {
			this.setState({result: res});
		});
	}

	render(){
		return(
			<a>
				{this.state.result}
			</a>
		)
	}
}

export default DatasetPage;
