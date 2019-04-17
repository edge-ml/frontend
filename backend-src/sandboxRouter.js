const KoaRouter = require('koa-router');

const sandboxRouter = new KoaRouter();

sandboxRouter.get('/test', (ctx) => {
	ctx.body = {id: 'test'};
});

module.exports = sandboxRouter;
