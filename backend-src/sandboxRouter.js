const KoaRouter = require('koa-router');
const KoaMulter = require('koa-multer');

const sandboxRouter = new KoaRouter();

const { io, activeClients } = require('./server_singleton');

const multer = KoaMulter({
	storage: KoaMulter.memoryStorage(),
});

sandboxRouter.put('/plot', multer.fields([
	{ name: 'csv', maxCount: 10 }
]), (ctx) => {
	const { name } = ctx.params;

	// assert client exists
	if(activeClients.includes(name)){
		const csvs = [];

		for(const csv of ctx.req.files.csv){
			csvs.push(csv.buffer.toString());
		}

		io.to(name).emit('plot', csvs);

		ctx.body = {success: true};
	} else {
		ctx.body = {success: false, msg: `no active client named ${name}`};
	}
});

module.exports = sandboxRouter;
