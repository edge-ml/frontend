import React, { Component } from 'react';
import {
	Container, Col, Row, Form,
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

import BootstrapTable from 'react-bootstrap-table-next';

import { PacmanLoader as Loader } from 'react-spinners';

class ListPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			ready: false,
			rows: [],
			columns: [
				{
					dataField: 'startTime',
					text: 'Start Time',
					sort: true,
				},
				{
					dataField: 'user',
					text: 'User Nickname',
				},
				{
					dataField: 'numSamples',
					text: 'Sample Count',
					sort: true,
				},
				{
					dataField: 'id',
					text: 'Document ID',
				}
			],
			defaultSorted: [{
				dataField: 'startTime',
				order: 'desc'
			}],
			loading: true,
		};
	}

	componentDidMount(){
		const options = {
			method: 'GET',
			url: 'http://edge.aura.rest/dataset',
			headers: {
				Authorization: `Bearer ${window.localStorage.getItem('id_token')}`
			},
		};

		Request(options).then((res) => {
			res = JSON.parse(res);
			let i=0;
			res.forEach((elem) => {
				elem.key = i;
				i++;
			});
			this.setState(update(this.state, {
				$merge: {
					ready: true,
					rows: res,
				}
			}));
		});
	}

	render(){
		return (
			<Container className="Page">
				<Row>
					{this.state.ready ? (
						<Col>
							<BootstrapTable
								className="ListTable"
								bootstrap4={true}
								loading={this.state.loading}
								keyField='key'
								defaultSorted={this.state.defaultSorted}
								data={ this.state.rows }
								columns={ this.state.columns }
								hover={true}
								rowEvents={{
									onClick: (e, row, rowIndex) => this.props.history.push(`/dataset/${row.id}`)
								}}
							/>
						</Col>
					):(
						<Col sm={{ size: 2, offset: 4 }}>
							<Loader
								className="loader"
								sizeUnit={"px"}
								size={50}
								color={'rgba(0, 0, 255, 0.5)'}
								loading={true}
							/>
						</Col>
					)}
				</Row>
			</Container>
		)
	}
}

export default ListPage;
