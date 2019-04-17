const Koa = require('koa');
const http = require('http');

const socketio = require('socket.io');

const app = new Koa();

const server = http.createServer(app.callback());

const io = socketio(server);

let activeClients = [];

module.exports = {
	activeClients: activeClients,
	app: app,
	io: io,
	server: server,
};
