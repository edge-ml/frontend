const Koa = require('koa');
const http = require('http');

const socketio = require('socket.io');

const app = new Koa();

const server = http.createServer(app.callback());

const io = socketio(server);

module.exports = {
	app: app,
	io: io,
	server: server,
};
