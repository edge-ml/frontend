var rp = require('request-promise');
var CONSTANTS = require('../constants')

// TODO: move this to a utility js file
function generateRequest(socket, method = HTTP_METHODS.GET, baseUri = API_URI, endpoint = ENDPOINTS.DEFAULT, body = {}) {
	return {
		method: method,
		uri: baseUri + endpoint,
		headers: {
			'User-Agent': 'Explorer', // TODO: move strings to constants
			'Authorization': socket.client.access_token // TODO: move strings to constants && access token should be validated and also generated seperatly for each socket aka user
		},
		body: body,
		json: true
	}
}

function applyTo(io, socket) {
    /**
     * GET Experiments
     */
    socket.on('experiments', () => {
        if (!socket.client.twoFactorAuthenticated) return; // TODO: can we handle this more elegantly instead of calling it on every request which can be easily forgotten

        rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS))
        .then(experiments => socket.emit('experiments', experiments))
        .catch(err => console.log(err)); // TODO: handle error more meaningful, also why are we not emitting any errors here?
    });

    /**
     * ADD Experiment
     */
    socket.on('add_experiment', newExperiment => {
        if (!socket.client.twoFactorAuthenticated) return; //TODO: see above

        rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.POST, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS, newExperiment))
        .then(() => rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS))
            .then(experiments => {
                socket.emit('err', false);
            io.emit('experiments', experiments);
            })
        )
        .catch(err => socket.emit('err', err));
    });

    /**
     * UPDATE Experiment
     */
    socket.on('update_experiment', experiment => {
        if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

        rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.PUT, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS + `/${experiment['_id']}`, experiment))
        .then(() => rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS)))
        .then(experiments => {
            socket.emit('err', false);
            io.emit('experiments', experiments);
        })
        .catch(err => socket.emit('err', err));
    });

    /**
     * DELETE Experiment
     */
    socket.on('delete_experiment', experimentId => {
        if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

        rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.DELETE, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS + `/${experimentId}`))
        .then(() => {
            rp(generateRequest(socket, CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.EXPERIMENTS))
            .then(experiments => socket.emit('experiments', experiments))
        })
        .catch(err => socket.emit('err', err));
    });
}

module.exports.applyTo = applyTo
