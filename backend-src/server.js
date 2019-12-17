/**
 * GENERAL TODOS:
 * - move socket topics to a single file which is shared by the react client
 * - proxy authentications to the backend server to obtain a real api token
 */

const path = require('path');
const fs = require('fs');


const KoaStatic = require('koa-static');
const KoaRouter = require('koa-router');
const KoaLogger = require('koa-logger');

const { uniqueNamesGenerator } = require('unique-names-generator');

const { io, app, server, activeClients } = require('./server_singleton');

const apiRouter = require('./apiRouter');

//const labelingsPath = path.join(__dirname, '../', 'config', 'labelings.json');

const authPath = path.join(__dirname, '../', 'config', 'auth.json');
const sourcesPath = path.join(__dirname, '../', 'config', 'sources.json');

const auth = require(authPath);
let sources = require(sourcesPath);

// JWT
const privateKeyPath = path.join(__dirname, '../', 'config', 'keys', 'private.key');
const publicKeyPath = path.join(__dirname, '../', 'config', 'keys', 'public.key');



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

// import and configure authentication middlware first to enforce event protection
const authenticationMiddleware = require('./Middleware/AuthenticationMiddleware')
authenticationMiddleware.applyTo(io)

// import event components
const labelingEventComponent = require('./EventComponents/LabelEventComponent')
const userEventComponent = require('./EventComponents/UserEventComponent')
const datasetEventComponent = require('./EventComponents/DatasetEventComponent')
const experimentEventComponent = require('./EventComponents/ExperimentEventComponent')

io.on('connection', (socket) => {
	// apply event components to socket
	labelingEventComponent.applyTo(io, socket)
	userEventComponent.applyTo(io, socket)
	datasetEventComponent.applyTo(io, socket)
  experimentEventComponent.applyTo(io, socket)

	// generate unique-id
	const name = uniqueNamesGenerator('', true);

	socket.on('client_name', () => {
		// join room with client id name
		socket.join(name);

		socket.emit('client_name', name);

		activeClients.push(name);
	});

	socket.on('disconnect', () => {
		// TODO: remove client from activeClients
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


app.use(KoaLogger());

const router = new KoaRouter();

router.use('/api/:name', apiRouter.routes(), apiRouter.allowedMethods());

app.use(KoaStatic(path.join(__dirname, '../', 'build'), {maxage: 1}));

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(process.env.BACKENDPORT || 3001);

console.log(`serving at 120.0.0.1:${process.env.BACKENDPORT || 3001}`);
