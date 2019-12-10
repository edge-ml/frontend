/**
 * GENERAL TODOS:
 * - move socket topics to a single file which is shared by the react client
 * - proxy authentications to the backend server to obtain a real api token 
 */

const path = require('path');
const fs = require('fs');
var rp = require('request-promise');

const KoaStatic = require('koa-static');
const KoaRouter = require('koa-router');
const KoaLogger = require('koa-logger');

const passwordHash = require('password-hash');
const SocketIoAuth = require('socketio-auth');
const jwt  = require('jsonwebtoken');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const { uniqueNamesGenerator } = require('unique-names-generator');

const { io, app, server, activeClients } = require('./server_singleton');

const apiRouter = require('./apiRouter');

const authPath = path.join(__dirname, '../', 'config', 'auth.json');
//const labelingsPath = path.join(__dirname, '../', 'config', 'labelings.json');
const sourcesPath = path.join(__dirname, '../', 'config', 'sources.json');

const auth = require(authPath);
//let labelings = require(labelingsPath);
let sources = require(sourcesPath);

// JWT
const privateKeyPath = path.join(__dirname, '../', 'config', 'keys', 'private.key');
const publicKeyPath = path.join(__dirname, '../', 'config', 'keys', 'public.key');

const privateKey  = fs.readFileSync(privateKeyPath, 'utf-8');
const publicKey  = fs.readFileSync(publicKeyPath, 'utf-8');

const tokenIssuer = 'AURA';
const tokenAudience = 'http://explorer.aura.rest';

// TODO: remove this HARDCODED AUTHENTICATION BETWEEN EXPLORER AND API
const access_token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZWZjYTU3YjJlODExMDAxMmZiMzhlZiIsImlhdCI6MTU3NTk5NTk5NywiZXhwIjoxNTc2MjU1MTk3fQ.898o3519E4AkGOPUfmNN_DFqBwDnk-MQfS-beFJ-YuI";

// TODO: move these constants to another file
const API_URI = 'http://aura.dmz.teco.edu/api';
const AUTH_URI = 'http://aura.dmz.teco.edu/auth';

// TODO: move this to a seperate file which contains constants
const HTTP_METHODS = {}
HTTP_METHODS.GET = 'GET'
HTTP_METHODS.POST = 'POST'
HTTP_METHODS.PUT = 'PUT'
HTTP_METHODS.DELETE = 'DELETE'

// TODO: move to constants
const ENDPOINTS = {}
ENDPOINTS.DEFAULT = '/'
ENDPOINTS.LABEL_DEFINITIONS = '/labelDefinitions'
ENDPOINTS.LABEL_TYPES = '/labelTypes'
ENDPOINTS.DATASETS = '/datasets'

/**
 * Generate request from method, endpoint and body. 
 * TODO: consider moving this to a utility class
 */
function generateRequest(method = HTTP_METHODS.GET, baseUri = API_URI, endpoint = ENDPOINTS.DEFAULT, body = {}) {
	return {
		method: method,
		uri: baseUri + endpoint,
		headers: {
			'User-Agent': 'Explorer', // TODO: move strings to constants
			'Authorization': access_token // TODO: move strings to constants && access token should be validated and also generated seperatly for each socket aka user
		},
		body: body,
		json: true
	}
}

SocketIoAuth(io, {
	authenticate: (socket, data, callback) => {
		if (data.jwtToken) {
			jwt.verify(data.jwtToken, publicKey, (err) => {
				socket.client.twoFactorAuthenticated = true;
				const username = jwt.decode(data.jwtToken).sub;
				socket.client.username = username;
				socket.client.isTwoFAClientConfigured  = auth[username].isTwoFAClientConfigured;
				socket.client.isAdmin = auth[username].isAdmin;
				if (err === null) callback(null, true);
			});
		} else {
			callback(null, (auth[data.username]
				&& passwordHash.verify(data.password, auth[data.username].passwordHash)));
		}
	},
	postAuthenticate: (socket, data) => {
		if (socket.client.twoFactorAuthenticated) {
			socket.client.authed = true;
			return;
		}

		socket.client.username = data.username;
		socket.client.isTwoFAClientConfigured = auth[data.username].isTwoFAClientConfigured;
		socket.client.isAdmin = auth[data.username].isAdmin;

		if (!socket.client.isTwoFAClientConfigured) {
			const secret = speakeasy.generateSecret();
			auth[data.username].twoFASecret = secret.base32;
			socket.client.twoFASecret = secret.base32;

			QRCode.toDataURL(secret.otpauth_url, (error, dataUrl) => {
				if (!error)	socket.emit('2FA', dataUrl);
			});
		} else {
			socket.client.isTwoFAClientConfigured = true;
			socket.client.twoFASecret = auth[data.username].twoFASecret;
			socket.emit('2FA');
		}

		socket.client.authed = true;
	},
});

io.on('connection', (socket) => {
	// generate unique-id
	const name = uniqueNamesGenerator('', true);

	socket.on('client_name', () => {
		// join room with client id name
		socket.join(name);

		socket.emit('client_name', name);

		activeClients.push(name);
	});

	socket.on('2FA', (userToken) => {
		const isValid = speakeasy.totp.verify({
			secret: socket.client.twoFASecret,
			encoding: 'base32',
			token: userToken
		});

		if (isValid) {
			socket.client.twoFactorAuthenticated = true;
			const signOptions = {
				issuer: tokenIssuer,
				subject: socket.client.username,
				audience: tokenAudience,
				expiresIn: '48h',
				algorithm: 'RS256'
			};

			const token = jwt.sign({}, privateKey, signOptions);

			socket.emit('verified', true, token);
		} else {
			socket.emit('verified', false);
		}

		if (isValid && !socket.twoFAConfigured) {
			auth[socket.client.username].twoFASecret = socket.client.twoFASecret;
			auth[socket.client.username].isTwoFAClientConfigured = true;

			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if(err){
					console.error(err);
				}
			});
		}
	});

	/***
	 * Labelings and labels
	 * TODO: move every aspect to a single file that hold the logic, in general still many duplications here
	 */
	socket.on('labelings_labels', () => {
		if (!socket.client.twoFactorAuthenticated) return; // TODO: can we handle this more elegantly instead of calling it on every request which can be easily forgotten

		Promise.all([
			rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.LABEL_DEFINITIONS)),
			rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.LABEL_TYPES))
		])
		.then(results => {
			socket.emit('labelings_labels', {labelings: results[0], labels: results[1]});
		})
		.catch(err => {
			console.log(err); // TODO: handle error more meaningful
		});
	});

	socket.on('add_labeling', newLabeling => {
		if (!socket.client.twoFactorAuthenticated) return; //TODO: see above

		rp(generateRequest(HTTP_METHODS.POST, API_URI, ENDPOINTS.LABEL_DEFINITIONS, newLabeling))
		.then(() => rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.LABEL_DEFINITIONS)))
		.then(labelings => {
			socket.emit('err', false); // TODO: why do we need this?
			io.emit('labelings_labels', {labelings, labels: undefined});
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	socket.on('update_labeling', labeling => {
		if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

		rp(generateRequest(HTTP_METHODS.PUT, API_URI, ENDPOINTS.LABEL_DEFINITIONS + `/${labeling['_id']}`, labeling))
		.then(() => rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.LABEL_DEFINITIONS)))
		.then(labelings => {
			socket.emit('err', false);
			io.emit('labelings_labels', {labelings, labels: undefined});
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	socket.on('delete_labeling', labelingId => {
		if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

		rp(generateRequest(HTTP_METHODS.DELETE, API_URI, ENDPOINTS.LABEL_DEFINITIONS + `/${labeling['_id']}`))
		.then(() => rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.LABEL_DEFINITIONS)))
		.then(labelings => {
			socket.emit('err', false);
			io.emit('labelings_labels', {labelings, labels: undefined});
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	socket.on('update_labeling_labels', (labeling, labels, deletedLabels) => {
		if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

		Promise.all(labels.filter(label => label.isNewLabel).map(label => rp({
			method: 'POST',
			uri: API_URI + '/labelTypes',
			headers: {
				'User-Agent': 'Explorer',
				'Authorization': access_token
			},
			body: label,
			json: true
		})))
		.then(newLabels => {
			let newLabelsId = newLabels.map(label => label['_id']);
			labeling.labels = [ ...labeling.labels, ...newLabelsId ];

			let promises = [];
			if (!labeling['_id']) {
				promises = [
					...promises,
					rp({
						method: 'POST',
						uri: API_URI + '/labelDefinitions',
						headers: {
							'User-Agent': 'Explorer',
							'Authorization': access_token
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
						uri: API_URI + `/labelDefinitions/${labeling['_id']}`,
						headers: {
							'User-Agent': 'Explorer',
							'Authorization': access_token
						},
						body: labeling,
						json: true
					}),
					...updatedLabels.map(label => rp({
						method: 'PUT',
						uri: API_URI + `/labelDefinitions/${label['_id']}`,
						headers: {
							'User-Agent': 'Explorer',
							'Authorization': access_token
						},
						body: label,
						json: true
					})),
					...deletedLabels.map(labelId => rp({
						method: 'DELETE',
						uri: API_URI + `/labelDefinitions/${labelId}`,
						headers: {
							'User-Agent': 'Explorer',
							'Authorization': access_token
						},
						json: true
					}))
				];
			}

			return Promise.all(promises);
		})
		.then(responses =>{
			return Promise.all([
				rp({
					uri: API_URI + '/labelDefinitions',
					headers: {
						'User-Agent': 'Explorer',
						'Authorization': access_token
					},
					json: true
				}),
				rp({
					uri: API_URI + '/labelTypes',
					headers: {
						'User-Agent': 'Explorer',
						'Authorization': access_token
					},
					json: true
				})
			]);
		})
		.then(results => {
			socket.emit('err', false);
			io.emit('labelings_labels', {labelings: results[0], labels: results[1]});
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	/***
	 * Datasets
	 */
	socket.on('datasets', () => {
		if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

		rp({
			uri: API_URI + '/datasets',
			headers: {
        'User-Agent': 'Explorer',
		'Authorization': access_token
    	},
			json: true
		})
    .then(datasets => {
      socket.emit('datasets', datasets);
    })
    .catch(err => {
      console.log(err)
    });
	});

	socket.on('dataset', id => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp({
			uri: API_URI + `/datasets/${id}`,
			headers: {
				'User-Agent': 'Explorer',
				'Authorization': access_token
			},
			json: true
		})
		.then(dataset => {
			socket.emit(`dataset_${id}`, dataset);
		})
		.catch(err => {
			console.log(err)
		});
	});

	socket.on('update_dataset', dataset => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp({
			method: 'PUT',
			uri: API_URI + `/datasets/${dataset['_id']}`,
			headers: {
				'User-Agent': 'Explorer',
				'Authorization': access_token
			},
			body: dataset,
			json: true
		})
		.then(response => {
			return rp({
				uri: API_URI + `/datasets/${dataset['_id']}`,
				headers: {
					'User-Agent': 'Explorer',
					'Authorization': access_token
				},
				json: true
			})
		})
		.then(dataset => {
			socket.emit('err', false, dataset);
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	socket.on('delete_dataset', id => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp({
			method: 'DELETE',
			uri: API_URI + `/datasets/${id}`,
			headers: {
				'User-Agent': 'Explorer',
				'Authorization': access_token
			},
			json: true
		})
		.then(response => {
			socket.emit('err', false);
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	/***
	 * DatasetLabelings
	 */
	socket.on('add_dataset_labeling', (datasetId, labeling) => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp({
			method: 'POST',
			uri: API_URI + `/datasets/${datasetId}/labelings`,
			headers: {
				'User-Agent': 'Explorer',
				'Authorization': access_token
			},
			body: labeling,
			json: true
		})
		.then(labeling => {
			socket.emit('err', false, labeling);
		})
		.catch(err => {
			socket.emit('err', err);
		});
	});

	socket.on('update_dataset_labeling', (datasetId, labeling) => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp({
			method: 'PUT',
			uri: API_URI + `/datasets/${datasetId}/labelings/${labeling['_id']}`,
			headers: {
				'User-Agent': 'Explorer',
				'Authorization': access_token
			},
			body: labeling,
			json: true
		})
		.then(response => {
			return rp({
				uri: API_URI + `/datasets/${datasetId}/labelings/${labeling['_id']}`,
				headers: {
					'User-Agent': 'Explorer',
					'Authorization': access_token
				},
				json: true
			});
		})
		.then(labeling => {
			socket.emit('update_dataset_labeling', false, labeling);
		})
		.catch(err => {
			socket.emit('update_dataset_labeling', err, null);
		});
	});

	socket.on('disconnect', () => {
		// TODO: remove client from activeClients
	});

	/***
	 * Users
	 */
	socket.on('users', () => {
		if (!socket.client.twoFactorAuthenticated) return;

		emitUsers(socket);
	});

	socket.on('user', () => {
		if (!socket.client.twoFactorAuthenticated) return;

		const user = auth[socket.client.username];
		socket.emit('user', {
			username: socket.client.username,
			isAdmin: user.isAdmin,
			isRegistered: user.isTwoFAClientConfigured
		});
	})

	socket.on('edit_user', (username, newName, newPassword, isAdmin, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin && username !== socket.client.username) return;

		const confirmationUsername = (socket.client.isAdmin) ? socket.client.username : username;

		if (passwordHash.verify(confirmationPassword, auth[confirmationUsername].passwordHash)) {
			if (username !== newName && newName in auth) {
				socket.emit('err', 'This user already exists.');
			} else {
				if (username !== newName) {
					auth[newName] = auth[username];
					delete auth[username];
				}

				auth[newName].isAdmin = isAdmin;

				if (newPassword) {
					auth[newName].passwordHash = passwordHash.generate(newPassword);
				}

				fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
					if (err) {
						console.error(err);
					}
				});

				socket.emit('err', false);
				for (socketId in io.sockets.sockets) {
					emitUsers(io.sockets.sockets[socketId]);
				}
			}
		} else {
			socket.emit('err', 'Current password is wrong.')
		}
	});

	socket.on('delete_user', (username, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin && username !== socket.client.username) return;

		if (passwordHash.verify(confirmationPassword, auth[socket.client.username].passwordHash)) {
			delete auth[username];
			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});

			socket.emit('err', false);
			for (socketId in io.sockets.sockets) {
				if (io.sockets.sockets[socketId].client.username !== username) {
					emitUsers(io.sockets.sockets[socketId]);
				}
			}
		} else {
			socket.emit('err', 'Current password is wrong.')
		}
	});

	socket.on('add_user', (username, password, isAdmin, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		if (passwordHash.verify(confirmationPassword, auth[socket.client.username].passwordHash)) {
			if (username in auth) {
				socket.emit('err', 'This user already exists.');
			} else {
				auth[username] = {
					passwordHash: passwordHash.generate(password),
					twoFactorAuthenticationSecret: null,
					isTwoFAClientConfigured: false,
					isAdmin: isAdmin,
				}

				fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
					if (err) {
						console.error(err);
					}
				});

				socket.emit('err', false);
				for (socketId in io.sockets.sockets) {
					emitUsers(io.sockets.sockets[socketId]);
				}
			}
		} else {
			socket.emit('err', 'Current password is wrong.')
		}
	});

	socket.on('reset2FA', (username, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		if (passwordHash.verify(confirmationPassword, auth[socket.client.username].passwordHash)) {
			auth[username].twoFactorAuthenticationSecret = null;
			auth[username].isTwoFAClientConfigured = false;
			auth[username].twoFASecret = undefined;

			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});

			socket.emit('err', false);
			for (socketId in io.sockets.sockets) {
				emitUsers(io.sockets.sockets[socketId]);
			}
		} else {
			socket.emit('err', 'Current password is wrong.')
		}
	});

	/***
	 * Sources
	 */
	socket.on('sources', () => {
		if (!socket.client.twoFactorAuthenticated) return;

		socket.emit('sources', sources);
	});

	socket.on('add_source', (name, url, enabled) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		if (sources.some(element => element.name === name || element.url === url)) {
			socket.emit('err', 'This source with the same name or URL already exists.');
		} else {
			sources.push({
				name: name,
				url: url,
				enabled: enabled
			});

			fs.writeFile(sourcesPath, JSON.stringify(sources, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});

			socket.emit('err', false);
			io.emit('sources', sources);
		}
	});

	socket.on('edit_source', (name, newName, newUrl, enabled) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		let editIndex = sources.findIndex(element => element.name === name);

		if (sources.some((element, index) => {
			return index !== editIndex && (element.name === newName || element.url === newUrl);
		})) {
			socket.emit('err', 'This source with the same name or URL already exists.');
		} else {
			sources[editIndex].name = newName;
			sources[editIndex].url = newUrl;
			sources[editIndex].enabled = enabled;

			fs.writeFile(sourcesPath, JSON.stringify(sources, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});

			socket.emit('err', false);
			io.emit('sources', sources);
		}
	});

	socket.on('delete_source', name => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		sources = sources.filter(element => element.name !== name);

		fs.writeFile(sourcesPath, JSON.stringify(sources, null, '\t'), (err) => {
			if (err) {
				console.error(err);
			}
		});

		io.emit('sources', sources);
	})

});

let emitUsers = (socket) => {
	if (socket.client.isAdmin) {
		socket.emit('users', Object.keys(auth).map(identifier => ({
			username: identifier,
			isAdmin: auth[identifier].isAdmin,
			isRegistered: auth[identifier].isTwoFAClientConfigured
		})));
	} else {
		const user = auth[socket.client.username];
		socket.emit('users', [{
			username: socket.client.username,
			isAdmin: user.isAdmin,
			isRegistered: user.isTwoFAClientConfigured
		}]);
	}
};

app.use(KoaLogger());

const router = new KoaRouter();

router.use('/api/:name', apiRouter.routes(), apiRouter.allowedMethods());

app.use(KoaStatic(path.join(__dirname, '../', 'build'), {maxage: 1}));

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(process.env.BACKENDPORT || 3001);

console.log(`serving at 120.0.0.1:${process.env.BACKENDPORT || 3001}`);
