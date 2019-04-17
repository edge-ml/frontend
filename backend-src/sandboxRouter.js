const KoaRouter = require('koa-router');

const sandboxRouter = new KoaRouter();

const { io } = require('./server_singleton');

sandboxRouter.get('/', (ctx) => {
	const { name } = ctx.params;
	io.sockets.to[name].emit('test');
	console.log(name);
});

module.exports = sandboxRouter;
