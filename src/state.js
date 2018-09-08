import { store } from 'react-easy-state';

const datastore = store({
	datasetPage: {
		self: undefined,
		chart: null,
		edit: {
			enabled: false,
			selectedBand: -1,
		},
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
	},
});

export default datastore;
