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
		this.mouseUpHandler = this.mouseUpHandler.bind(this);
	}

	labelingClickHandler(e){
		function plotbandClickHandler(e) {
			const line = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.moving === true)[0];
			if(line !== undefined){
				return;
			}
			if((State.datasetPage.edit.selectedBand !== -1) && (this.id === State.datasetPage.edit.selectedBand.id)){
				State.datasetPage.edit.selectedBand = -1;
			}else{
				State.datasetPage.edit.selectedBand = this;
			}
			State.datasetPage.updateHighlight();
		}

		function lineMoveHandler(e){
			const [type, id] = this.id.split('_');
			const band = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.id === `band_${id}`)[0];
			if(!band){
				return;
			}
			const line = band.lines[type];
			switch(e.type){
			case 'mousedown':
				this.moving = true;
				
				const {chartX} = Highcharts.charts[0].pointer.normalize(e);

				if(line.svgElem.translateX === undefined){
					this.originX = chartX;
				}else{
					this.originX = chartX - line.svgElem.translateX;
				}

				State.datasetPage.chart.panning = false;
				break;
			}
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
				className: 'dataset-plotline-selected',
				id: `start_${bandId}`,
				events: {
					mousedown: lineMoveHandler,
					mousemove: lineMoveHandler,
					mouseup: lineMoveHandler,
					mouseleave: lineMoveHandler,
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
				className: 'dataset-plotline-selected',
				id: `end_${bandId}`,
				events: {
					mousedown: lineMoveHandler,
					mousemove: lineMoveHandler,
					mouseup: lineMoveHandler,
					mouseleave: lineMoveHandler,
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

		function mouseMoveHandler(original, e){
			if(State.datasetPage.chart === null){
				original.apply(this, Array.prototype.slice.call(arguments, 1));
				return;
			}

			const line = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.moving === true)[0];

			if(!line){
				original.apply(this, Array.prototype.slice.call(arguments, 1));
				return;
			}

			const [type, id] = line.id.split('_');
			const elems = State.datasetPage.chart.xAxis.plotLinesAndBands;
			const band = elems.filter(elem => elem.id === `band_${id}`)[0];

			switch(e.type){
			case 'mousemove':
				const {chartX} = Highcharts.charts[0].pointer.normalize(e);
				const delta = chartX - line.originX;
				const newPos = line.svgElem.translate(delta, false);
				const point_x = State.datasetPage.chart.xAxis.toValue(chartX, 0);

				line.svgElem.attr({
					stroke: State.datasetPage.states[band.state].color,
					value: point_x,
				});

				line.options.value = point_x;

				const oldBand = Object.assign({}, band);

				State.datasetPage.chart.xAxis.removePlotBand(band.id);

				switch(type){
				case 'start':
					oldBand.options.from = point_x;
					break;
				case 'end':
					oldBand.options.to = point_x;
					break;
				}

				State.datasetPage.chart.xAxis.addPlotBand(oldBand.options);

				const newBand = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.id === `band_${id}`)[0];

				newBand.state = oldBand.state;

				newBand.svgElem.attr({
					fill: State.datasetPage.states[newBand.state].color,
				});

				newBand.lines = {
					start: elems.filter(elem => elem.id === `start_${id}`)[0],
					end:   elems.filter(elem => elem.id === `end_${id}`)[0],
				};

				break;
			}
		}

		
		Highcharts.wrap(Highcharts.Pointer.prototype, 'onContainerMouseMove', mouseMoveHandler);
	}

	mouseUpHandler(e){
		if(State.datasetPage.chart === null){
			return;
		}

		const line = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.moving === true)[0];

		if(!line){
			return;
		}

		const [type, id] = line.id.split('_');

		const band = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.id === `band_${id}`)[0];

		line.moving = false;

		// update selected reference
		if(line.svgElem.element.className.baseVal.includes('selected')){
			State.datasetPage.selectedBand = 0;
			State.datasetPage.selectedBand = band;
		}

		console.log(State.datasetPage.selectedBand);
	}

	render(){
		return (
			<Loader loading={!this.state.chart.ready}>
				<DatasetToolbar/>
				<Row>
					<Col
						onMouseUp={this.mouseUpHandler}
					>
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
