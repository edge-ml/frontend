var rp = require('request-promise');
var CONSTANTS = require('../constants')

// TODO: move this to a utility js file
function generateRequest(method = HTTP_METHODS.GET, baseUri = API_URI, endpoint = ENDPOINTS.DEFAULT, body = {}) {
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
    /**
     * GET Label Definitions and Label Types
     */
    socket.on('labelings_labels', () => {
        if (!socket.client.twoFactorAuthenticated) return; // TODO: can we handle this more elegantly instead of calling it on every request which can be easily forgotten

        Promise.all([
            rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS)),
            rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_TYPES))
        ])
        .then(results => socket.emit('labelings_labels', {labelings: results[0], labels: results[1]}))
        .catch(err => console.log(err)); // TODO: handle error more meaningful, also why are we not emitting any errors here?
    });

    /**
     * ADD Label Definition
     */
    socket.on('add_labeling', newLabeling => {
        if (!socket.client.twoFactorAuthenticated) return; //TODO: see above

        rp(generateRequest(CONSTANTS.HTTP_METHODS.POST, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS, newLabeling))
        .then(() => rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS))
            .then(labelings => {
                socket.emit('err', false);
            io.emit('labelings_labels', {labelings, labels: undefined});
            })
        )
        .catch(err => socket.emit('err', err));
    });

    /**
     * UPDATE Label Definition
     */
    socket.on('update_labeling', labeling => {
        if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

        rp(generateRequest(CONSTANTS.HTTP_METHODS.PUT, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS + `/${labeling['_id']}`, labeling))
        .then(() => rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS)))
        .then(labelings => {
            socket.emit('err', false);
            io.emit('labelings_labels', {labelings, labels: undefined});
        })
        .catch(err => socket.emit('err', err));
    });

    /**
     * DELETE Label Definition
     */
    socket.on('delete_labeling', labelingId => {
        if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above
        rp(generateRequest(CONSTANTS.HTTP_METHODS.DELETE, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS + `/${labelingId}`))
        .then(() => {
            Promise.all([
                rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS)),
                rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_TYPES))
            ])
            .then(results => socket.emit('labelings_labels', {labelings: results[0], labels: results[1]}))
        })
        .catch(err => socket.emit('err', err));
    });

    /**
     * UPDATE Label Types of a Labeling
     */
    socket.on('update_labeling_labels', (labeling, labels, deletedLabels) => {
        if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

        Promise.all(
            labels.filter(label => label.isNewLabel)
            .map(label => rp(generateRequest(CONSTANTS.HTTP_METHODS.POST, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_TYPES, label))))
            .then(newLabels => {
            let newLabelsId = newLabels.map(label => label['_id']);
            labeling.labels = [ ...labeling.labels, ...newLabelsId ];

            let promises = [];
            if (!labeling['_id']) {
                promises = [
                    ...promises,
                    rp({
                        method: 'POST',
                        uri: CONSTANTS.API_URI + '/labelDefinitions',
                        headers: {
                            'User-Agent': 'Explorer',
                            'Authorization': CONSTANTS.ACCESS_TOKEN
                        },
                        body: labeling,
                        json: true
                    })
                ];
            } else {
                let updatedLabels = labels.filter(label => label.updated);

                promises = [
                    ...promises,
                    rp({
                        method: 'PUT',
                        uri: CONSTANTS.API_URI + `/labelDefinitions/${labeling['_id']}`,
                        headers: {
                            'User-Agent': 'Explorer',
                            'Authorization': CONSTANTS.ACCESS_TOKEN
                        },
                        body: labeling,
                        json: true
                    }),
                    ...updatedLabels.map(label => rp({
                        method: 'PUT',
                        uri: CONSTANTS.API_URI + `/labelTypes/${label['_id']}`,
                        headers: {
                            'User-Agent': 'Explorer',
                            'Authorization': CONSTANTS.ACCESS_TOKEN
                        },
                        body: label,
                        json: true
                    })),
                    ...deletedLabels.map(labelId => rp({
                        method: 'DELETE',
                        uri: CONSTANTS.API_URI + `/labelTypes/${labelId}`,
                        headers: {
                            'User-Agent': 'Explorer',
                            'Authorization': CONSTANTS.ACCESS_TOKEN
                        },
                        json: true
                    }))
                ];
            }

            return Promise.all(promises);
        })
        .then(() =>{
            return Promise.all([
                rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_DEFINITIONS)),
                rp(generateRequest(CONSTANTS.HTTP_METHODS.GET, CONSTANTS.API_URI, CONSTANTS.ENDPOINTS.LABEL_TYPES))
            ]);
        })
        .then(results => {
            socket.emit('err', false);
            io.emit('labelings_labels', {labelings: results[0], labels: results[1]});
        })
        .catch(err => socket.emit('err', err));
    });
}

module.exports.applyTo = applyTo
