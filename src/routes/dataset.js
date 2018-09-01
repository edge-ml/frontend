import React, { Component } from 'react';
import {
	Container, Col, Row, Form,
	FormGroup, Label, Input,
	InputGroup, InputGroupAddon, InputGroupText,
	Button,
	Alert,
} from 'reactstrap';

import Request from 'request-promise';

import update from 'immutability-helper';

import { load } from 'protobufjs';

import { PacmanLoader as Loader } from 'react-spinners';

import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

class DatasetPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			dataset: {},
			chart: {
				xAxis: {     
					ordinal: false,
					type: 'datetime',
					type: "datetime",
					dateTimeLabelFormats: {
						day: '%a'
					}
				},
				title: {
					text: () => `${this.state.dataset.id}`,
				},
				series : [
					{
						text: 'VOC',
						data : []
					}
				]
			}
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
			encoding: null,
		};

		let proto = {};

		load("/protocol/Dataset.proto").then((res) => {
			proto = res.Aura.Model.Analysis.Generated;
			return Request(options);
		}).catch((err) => {
			throw err;
		}).then((res) => {
			const dataset = proto.DatasetGetResponse.decode(res);
			dataset.data = proto.SensorDataset_t.decode(dataset.data);

			const values = [];

			let DeltaCounter = 0;

			for(let i=0; i < dataset.data.samples.length; i++){
				DeltaCounter += dataset.data.samples[i].delta;
				values.push([
					dataset.startTime + DeltaCounter,
					dataset.data.samples[i].voc.voc,
				]);
			}

			this.setState(update(this.state, {
				$merge: {
					dataset: dataset,
					chart: {
						ready: true,
						title: {
							text: this.state.dataset.id,
						},
						series: [{
							data: values,
						}]
					}
				}
			}));
			console.log(this.state.chart);
		}).catch((err) => {
			console.error(err);
		});
	}

	render(){
		return(
			<Container className="Page">
				<Row>
					{this.state.chart.ready ? (
						<Col>
							<HighchartsReact
								highcharts={Highcharts}
								constructorType={'stockChart'}
								options={this.state.chart}
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

export default DatasetPage;
