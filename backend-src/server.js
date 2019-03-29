const path = require('path');
const http = require('http');

const Koa = require('koa');
const socketio = require('socket.io');
const KoaStaticServer = require('koa-static-server');
const SocketIoAuth = require('socketio-auth');

const app = new Koa();

const server = http.createServer(app.callback());

const io = socketio(server);

const auth = require(path.join(__dirname, '../', 'config', 'auth.json'));
const labelings = require(path.join(__dirname, '../', 'config', 'labelings.json'));

SocketIoAuth(io, {
	authenticate: (socket, data, callback) => callback(null, (auth[data.username] === data.password)),
	postAuthenticate: (socket, data) => {
		console.log('authed');
		// maybe store user info?
		socket.client.authed = true;
	},
});

io.on('connection', (socket) => {
	console.log('client connected');

	socket.on('labelings', (msg) => {
		console.log(`client: labelings >>> ${msg}`);
		socket.emit('labelings', labelings);
	});

	socket.on('disconnect', () => {
		console.log('client disconnected');
	});
});

app.use(KoaStaticServer({
	rootDir: path.join(__dirname, '../', 'build'),
	index: 'index.html',
}));

server.listen(3001);


