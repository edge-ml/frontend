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
			stateRef: State,
			selectedBand: -1,
			dataset: {},
			chart: {
				rangeSelector:{
					enabled: false,
				},
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
			if((State.datasetPage.edit.selectedBand !== -1) && (this.id === State.datasetPage.edit.selectedBand.id)){
				State.datasetPage.edit.selectedBand = -1;
			}else{
				State.datasetPage.edit.selectedBand = this;
			}
			State.datasetPage.updateHighlight();
		}

		function startLineClickHandler(e) {
			console.log('startclick');
		}

		function endLineClickHandler(e) {
			console.log('endclick');
		}

		function plotbandHoverHandler(e){
			console.log(this);
		}

		if(this.firstclick === undefined){
			State.datasetPage.chart = this;
			this.firstclick = true;
		}

		const pos = e.point.x;
		const bands = this.xAxis.plotLinesAndBands.filter(elem => elem.id.split('_')[0] === 'band');

		const bandId = bands.length;

		const initialColor = State.datasetPage.states[State.datasetPage.initialIndex].color;
		const borderWidth = State.datasetPage.borderWidth;

		if(this.firstclick){
			this.firstPos = pos;
			this.xAxis.addPlotLine({
				color: initialColor,
				dashStyle: 'solid',
				value: pos,
				width: borderWidth,
				zIndex: 4,
				className: 'dataset-plotline',
				id: `start_${bandId}`,
				events: {
					click: startLineClickHandler,
				}
			});
			this.firstclick = false;
		}else{
			this.xAxis.addPlotLine({
				color: initialColor,
				dashStyle: 'solid',
				value: pos,
				width: borderWidth,
				zIndex: 4,
				className: 'dataset-plotline',
				id: `end_${bandId}`,
				events: {
					click: endLineClickHandler,
				}
			});
			this.xAxis.addPlotBand({
				color: initialColor,
				borderWidth: 0,
				from: this.firstPos,
				to: pos,
				zIndex: 3,
				className: 'datasetPlotBand',
				id: `band_${bandId}`,
				events: {
					click: plotbandClickHandler,
				}
			});

			let elems  = State.datasetPage.chart.xAxis.plotLinesAndBands;
			let band; // assign after creation, because js reference problems

			band       = elems.filter(elem => elem.id === `band_${bandId}`)[0];
			band.state = State.datasetPage.initialIndex;
			band.lines = {
				start: elems.filter(elem => elem.id === `start_${bandId}`)[0],
				end:   elems.filter(elem => elem.id === `end_${bandId}`)[0],
			};
			State.datasetPage.edit.selectedBand = band;
			State.datasetPage.sort();

			// Trigger react render update...
			const idd = band.id;
			State.datasetPage.edit.selectedBand.id = 'plsupdate';
			State.datasetPage.edit.selectedBand.id = idd;

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
