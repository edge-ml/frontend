import { store } from 'react-easy-state';

const datastore = store({
	datasetPage: {
		self: undefined,
		chart: null,
		edit: {
			enabled: false,
			selectedBand: -1,
		},
		highlightColor: 'orange',
		initialIndex: 0,
		bands: [
		],
		states: [
			{
				name: 'apnea',
				buttonColor: 'success',
				color: 'green',
			},
			{
				name: 'hypopnea',
				buttonColor: 'info',
				color: 'blue',
			},
			{
				name: 'whatever',
				buttonColor: 'warning',
				color: 'yellow',
			},
			{
				name: 'lol',
				buttonColor: 'danger',
				color: 'red',
			},
		],
		reorder: () => {
			let i=0;
			for(let band of datastore.datasetPage.chart.xAxis.plotLinesAndBands){
				band.id = i++;
			}
		},
		updateHighlight: () => {
			for(let band of datastore.datasetPage.chart.xAxis.plotLinesAndBands){
				band.svgElem.attr({
					stroke: 'none',
				});
			}
			datastore.datasetPage.edit.selectedBand.svgElem.attr({
				stroke: datastore.datasetPage.highlightColor,
			});
		}
	},
});

export default datastore;
