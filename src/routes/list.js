import React, { Component } from 'react';
import {
	Container, Col, Row, Form,
	FormGroup, Label, Input,
	InputGroup, InputGroupAddon, InputGroupText,
	Button,
	Alert,
	Table, TableRow,
	Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { PersonIcon, ShieldIcon } from 'react-octicons';

import { store, view } from 'react-easy-state';

import Request from 'request-promise';

import update from 'immutability-helper';

import BootstrapTable from 'react-bootstrap-table-next';

import { PacmanLoader as Loader } from 'react-spinners';

import { TrashcanIcon } from 'react-octicons';

class ListPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			modalID: null,
			modal: false,
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
					formatter: (cell, row) => (
						<div>
							<a href="" onClick={(e) => {
								this.deleteHandler(row.id)
								e.preventDefault();
							}}><TrashcanIcon /></a>
							{'  '}
							<a href="" onClick={(e) => {
								this.props.history.push(`dataset/${row.id}`)
								e.preventDefault();
							}}>{cell}</a>
						</div>
					),
				}
			],
			defaultSorted: [{
				dataField: 'startTime',
				order: 'desc'
			}],
			loading: true,
		};
		this.deleteHandler = this.deleteHandler.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
		this.modalDeleteHandler = this.modalDeleteHandler.bind(this);
	}

	deleteHandler(id){
		this.setState(update(this.state, {
			modalID: {$set: id},
			modal: {$set: !this.state.modal},
		}));
	}

	modalDeleteHandler(){
		if(this.state.modalID === null){
			this.toggleModal();
			return;
		}

		const options = {
			method: 'DELETE',
			url: `https://edge.aura.rest/dataset/${this.state.modalID}`,
			headers: {
				Authorization: `Bearer ${window.localStorage.getItem('id_token')}`
			},
		};

		Request(options).then((res) => {
			const index = this.state.rows.findIndex(row => row.id === this.state.modalID);
			this.setState(update(this.state, {
				modalID: {$set: null},
				modal: {$set: false},
				rows: {$splice: [[index, 1]]},
			}));
		});
	}

	toggleModal(){
		this.setState(update(this.state, {
			modal: {$set: !this.state.modal},
		}));
	}

	componentDidMount(){
		const options = {
			method: 'GET',
			url: 'https://edge.aura.rest/dataset',
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
				ready: {$set: true},
				rows: {$set: res},
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
								loading={ this.state.loading }
								keyField='key'
								defaultSorted={ this.state.defaultSorted }
								data={ this.state.rows }
								columns={ this.state.columns }
								hover={ false }
							/>
							<Modal isOpen={this.state.modal} toggle={this.toggleModal} className={this.props.className}>
								<ModalHeader toggle={this.toggleModal}>O RLY?</ModalHeader>
								<ModalBody>
									delete {this.state.modalID}?
								</ModalBody>
								<ModalFooter>
									<Button color="danger" onClick={this.modalDeleteHandler}>Yes</Button>{' '}
									<Button color="secondary" onClick={this.toggleModal}>No</Button>
								</ModalFooter>
							</Modal>
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
