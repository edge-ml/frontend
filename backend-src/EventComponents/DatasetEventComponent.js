var rp = require('request-promise');
var CONSTANTS = require('../constants')

function generateRequest(method = CONSTANTS.HTTP_METHODS.GET, baseUri = CONSTANTS.API_URI, endpoint = CONSTANTS.ENDPOINTS.DEFAULT, body = {}) {
	return {
		method: method,
		uri: baseUri + endpoint,
		headers: {
			'User-Agent': 'Explorer', // TODO: move strings to constants
			'Authorization': CONSTANTS.ACCESS_TOKEN // TODO: move strings to constants && access token should be validated and also generated seperatly for each socket aka user
		},
		body: body,
		json: true
	}
}

function applyTo(io, socket) {
    /***
	 * Datasets
	 */
	socket.on('datasets', () => {
		rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS))
    	.then(datasets => socket.emit('datasets', datasets))
    	.catch(err => console.log(err)); // TODO: handle errors more meaningful e.g. reporting tool
	});

	socket.on('dataset', id => {
		rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS + `/${id}`))
		.then(dataset => { socket.emit(`dataset_${id}`, dataset); })
		.catch(err => { console.log(err) }); // TODO: handle errors more meaningful
	});

	socket.on('update_dataset', dataset => {
console.log("updating" + JSON.stringify(dataset))

		rp(generateRequest(CONSTANTS.HTTP_METHODS.PUT, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS + `/${dataset['_id']}`, dataset))
		.then(rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS + `/${dataset['_id']}`))
		    .then(updatedDataset => {
				console.log("success with updating" + JSON.stringify(updatedDataset))
                socket.emit('dataset_updated', dataset)
                // TODO: error handling
            }))
		.catch(err => socket.emit('err', err));
	});

	socket.on('delete_dataset', id => {
		rp(generateRequest(CONSTANTS.HTTP_METHODS.DELETE, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS + `/${id}`))
		.then(socket.emit('err', false))
		.catch(err => socket.emit('err', err));
	});

	/***
	 * DatasetLabelings
	 */
	socket.on('add_dataset_labeling', (datasetId, labeling) => {
        rp(generateRequest(CONSTANTS.HTTP_METHODS.POST, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS + `/${datasetId}/labelings`, labeling)) // move labelings string to constant
		.then(labeling => socket.emit('err', false, labeling))
		.catch(err => socket.emit('err', err));
	});

	socket.on('update_dataset_labeling', (datasetId, labeling) => {
		rp(generateRequest(CONSTANTS.HTTP_METHODS.PUT, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.DATASETS + `/datasets/${datasetId}/labelings/${labeling['_id']}`, labeling)) // move strings to constants
        .then(() => rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, `/datasets/${datasetId}/labelings/${labeling['_id']}`)))
		.then(labeling => socket.emit('update_dataset_labeling', false, labeling))
		.catch(err => socket.emit('update_dataset_labeling', err, null))
	});
}

module.exports.applyTo = applyTo
