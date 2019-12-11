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

const speakeasy = require('speakeasy');


const { uniqueNamesGenerator } = require('unique-names-generator');

const { io, app, server, activeClients } = require('./server_singleton');

const apiRouter = require('./apiRouter');

const authPath = path.join(__dirname, '../', 'config', 'auth.json');
//const labelingsPath = path.join(__dirname, '../', 'config', 'labelings.json');
const sourcesPath = path.join(__dirname, '../', 'config', 'sources.json');

const auth = require(authPath);

let sources = require(sourcesPath);
const jwt  = require('jsonwebtoken');
const tokenIssuer = 'AURA';
const tokenAudience = 'http://explorer.aura.rest';
const privateKeyPath = path.join(__dirname, '../', 'config', 'keys', 'private.key');
const privateKey  = fs.readFileSync(privateKeyPath, 'utf-8');

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

// import and configure middlware
const authenticationMiddleware = require('./Middleware/AuthenticationMiddleware')

authenticationMiddleware.applyTo(io)

// import and configure event components
const labelingEventComponent = require('./EventComponents/LabelEventComponent')
const userEventComponent = require('./EventComponents/UserEventComponent')

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




/**
 * TODO: use something like this to append all the different events to socket instead of listing them all in this file
 */
function appendSocketEventComponent(socket, eventComponent) {
	eventComponent.applyTo(io, socket);
}

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

	appendSocketEventComponent(socket, labelingEventComponent);
	appendSocketEventComponent(socket, userEventComponent);
	

	/***
	 * Datasets
	 */
	socket.on('datasets', () => {
		if (!socket.client.twoFactorAuthenticated) return;  //TODO: see above

		rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.DATASETS))
    	.then(datasets => socket.emit('datasets', datasets))
    	.catch(err => console.log(err)); // TODO: handle errors more meaningful e.g. reporting tool
	});

	socket.on('dataset', id => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.DATASETS + `/${id}`))
		.then(dataset => { socket.emit(`dataset_${id}`, dataset); })
		.catch(err => { console.log(err) }); // TODO: handle errors more meaningful
	});

	socket.on('update_dataset', dataset => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp(generateRequest(HTTP_METHODS.PUT, API_URI, ENDPOINTS.DATASETS + `/${dataset['_id']}`, dataset))
		.then(generateRequest(HTTP_METHODS.GET, API_URI, ENDPOINTS.datasets + `/${dataset['_id']}`))
		.then(dataset => socket.emit('err', false, dataset)) // TODO: this seems hacky I would rather like to have a dedicated event for it instead of using the error event?
		.catch(err => socket.emit('err', err));
	});

	socket.on('delete_dataset', id => {
		if (!socket.client.twoFactorAuthenticated) return;

		rp(generateRequest(HTTP_METHODS.DELETE, API_URI, ENDPOINTS.DATASETS + `/${id}`))
		.then(socket.emit('err', false))
		.catch(err => socket.emit('err', err));
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


app.use(KoaLogger());

const router = new KoaRouter();

router.use('/api/:name', apiRouter.routes(), apiRouter.allowedMethods());

app.use(KoaStatic(path.join(__dirname, '../', 'build'), {maxage: 1}));

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(process.env.BACKENDPORT || 3001);

console.log(`serving at 120.0.0.1:${process.env.BACKENDPORT || 3001}`);
