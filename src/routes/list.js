import React, { Component } from 'react';
import {
	Container, Col, Form,
	FormGroup, Label, Input,
	InputGroup, InputGroupAddon, InputGroupText,
	Button,
	Alert,
	Table, TableRow,
} from 'reactstrap';

import { PersonIcon, ShieldIcon } from 'react-octicons';

import { store, view } from 'react-easy-state';

import Request from 'request-promise';

import update from 'immutability-helper';

class ListPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			rows: [/*{startTime, user, numSamples, id}*/],
		};
	}

	componentDidMount(){
		const options = {
			method: 'GET',
			url: 'http://localhost:3000/dataset/list',
			headers: {
				Authorization: `Bearer ${window.localStorage.getItem('id_token')}`
			},
		};

		Request(options).then((res) => {
			res = JSON.parse(res);
			this.setState({rows: res});
		});
	}

	render(){
		return (
			<Container className="Page">
				<Table hover>
					<thead>
						<tr>
							<th>date</th>
							<th>user</th>
							<th>sample count</th>
							<th>id</th>
						</tr>
					</thead>
					<tbody>
						{this.state.rows.map((r) => (
							<tr>
								<td>{r.startTime}</td>
								<td>{r.user}</td>
								<td>{r.numSamples}</td>
								<td><a href={`/dataset/${r.id}`}>{r.id}</a></td>
							</tr>
						))}
					</tbody>
				</Table>
			</Container>
		)
	}
}

export default ListPage;
