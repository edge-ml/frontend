const path = require('path');
const http = require('http');
const fs   = require('fs');

const Koa = require('koa');
const socketio = require('socket.io');
const KoaStaticServer = require('koa-static-server');
const SocketIoAuth = require('socketio-auth');

const app = new Koa();

const server = http.createServer(app.callback());

const io = socketio(server);

const labelingsPath = path.join(__dirname, '../', 'config', 'labelings.json');

const auth = require(path.join(__dirname, '../', 'config', 'auth.json'));
let labelings = require(labelingsPath);

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

	socket.on('labelings', (newLabelings) => {
		if(!newLabelings){
			console.log('labeling request');
			socket.emit('labelings', labelings);
		}else{
			console.log('got new labelings');
			labelings = newLabelings;

			fs.writeFile(labelingsPath, JSON.stringify(labelings, null, '\t'), (err) => {
				if(err){
					console.error(err);
				}
			});

			io.emit('labelings', newLabelings);
		}
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


