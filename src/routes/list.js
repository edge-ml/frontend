import React, { Component } from 'react';
import {
	Col, Row,
	Button, ButtonGroup,
	UncontrolledTooltip,
	Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import BootstrapTable from 'react-bootstrap-table-next';
import { TrashcanIcon, BookIcon } from 'react-octicons';
import { view } from 'react-easy-state';

import State from '../state';

import Loader from '../modules/loader';

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
					formatter: (cell, row) => {
						const date = new Date(row.startTime);
						return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
					}
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
					text: 'Action',
					formatter: (cell, row) => (
						<ButtonGroup className="list-buttongroup">
							<Button
								outline
								className="button-toolbar-delete"
								color="danger"
								onClick={(e) => {
									this.deleteHandler(row.id)
									e.preventDefault();
								}}
							>
								<TrashcanIcon className="svg-red"/> Delete
							</Button>
							<Button
								outline
								className="button-toolbar-delete"
								color="info"
								id={`button-view-${row.id}`}
								onClick={(e) => {
									this.props.history.push(`dataset/${row.id}`)
									e.preventDefault();
								}}
							>
								<BookIcon className="svg-teal"/> View
							</Button>
							<UncontrolledTooltip
								delay={{show: 200, hide: 200}}
								className="list-tooltip"
								placement="right"
								autohide={false}
								target={`button-view-${row.id}`}
							>
								{cell}
							</UncontrolledTooltip>
						</ButtonGroup>
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
			url: `${State.edge}/dataset/${this.state.modalID}`,
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
			url: `${State.edge}/dataset`,
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
			<Loader loading={!this.state.ready}>
				<Col>
					<br/>
					<Row>
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
								<Button outline color="danger" onClick={this.modalDeleteHandler}>Yes</Button>{' '}
								<Button outline color="secondary" onClick={this.toggleModal}>No</Button>
							</ModalFooter>
						</Modal>
					</Row>
				</Col>
			</Loader>
		)
	}
}

export default view(ListPage);
