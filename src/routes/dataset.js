import React, { Component } from 'react';
import {
	Col, Row,
} from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import { load } from 'protobufjs';
import { view } from 'react-easy-state';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import State from '../state';
import Loader from '../modules/loader';
import DatasetToolbar from '../modules/datasetToolbar';

class DatasetPage extends Component {
	constructor(props){
		super(props);
		this.state = {
			selectedBand: -1,
			dataset: {},
			chart: {
				xAxis: {     
					ordinal: false,
					type: "datetime",
					dateTimeLabelFormats: {
						day: '%a'
					},
					plotLines: [],
				},
				title: {
					text: '',
				},
				tooltip: {
					// trigger click event even if cursor is far from plot Y point
					snap: 100,
					enabled: false,
				},
				series : [
					{
						text: 'VOC',
						data : [],
						events:{
							click: this.labelingClickHandler,
							drag: (e) => console.log(e),
						}
					}
				]
			}
		};
		this.labelingClickHandler = this.labelingClickHandler.bind(this);
	}

	labelingClickHandler(e){
		function plotbandClickHandler(e) {
			State.datasetPage.edit.selectedBand = this;
			State.datasetPage.updateHighlight();
		}

		function plotbandHoverHandler(e){
			console.log(this);
		}

		if(this.firstclick === undefined){
			State.datasetPage.chart = this;
			this.firstclick = true;
		}

		const pos = e.point.x;

		if(this.firstclick){
			this.firstPos = pos;
			this.xAxis.addPlotLine({
				color: 'yellow',
				dashStyle: 'solid',
				value: pos,
				width: 2,
				zIndex: 4,
				className: 'datasetPlotLine',
				id: 'startline',
			});
			this.firstclick = false;
		}else{
			this.xAxis.removePlotLine('startline');
			// reorder
			State.datasetPage.reorder();
			const bandId = this.xAxis.plotLinesAndBands.length;
			this.xAxis.addPlotBand({
				color: State.datasetPage.states[State.datasetPage.initialIndex].color,
				borderWidth: 2,
				from: this.firstPos,
				to: pos,
				zIndex: 3,
				className: 'datasetPlotBand',
				id: bandId,
				events: {
					click: plotbandClickHandler,
				}
			});
			State.datasetPage.edit.selectedBand = State.datasetPage.chart.xAxis.plotLinesAndBands[bandId];
			State.datasetPage.updateHighlight();
			this.firstclick = true;
		}
	}

	componentDidMount(){
		State.datasetPage.self = this;
		const { id } = this.props.match.params;
		const options = {
			method: 'GET',
			url: `https://edge.aura.rest/dataset/${id}`,
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
				dataset: {$set: dataset},
				chart: {
					ready: {$set: true},
					title: {
						text: {$set: this.state.dataset.id},
					},
					series: [{
						data: {$set: values},
					}]
				}
			}));
		}).catch((err) => {
			console.error(err);
		});
	}

	render(){
		return (
			<Loader loading={!this.state.chart.ready}>
				<DatasetToolbar/>
				<Row>
					<Col>
						<HighchartsReact
							className="dataset-plot"
							highcharts={Highcharts}
							constructorType={'stockChart'}
							height="100%"
							options={this.state.chart}
						/>
					</Col>
				</Row>
			</Loader>
		)
	}
}

export default view(DatasetPage);
