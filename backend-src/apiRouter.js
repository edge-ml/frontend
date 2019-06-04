const KoaRouter = require('koa-router');
const KoaMulter = require('koa-multer');

const sandboxRouter = new KoaRouter();

const { io, activeClients } = require('./server_singleton');

const multer = KoaMulter({
	storage: KoaMulter.memoryStorage(),
});

const assetAuthed = async (ctx, next) => {
	const { name } = ctx.params;

	ctx.client_name = name;

	if(activeClients.includes(name)){
		await next();
	} else {
		ctx.body = {success: false, msg: `no active client named ${name}`};
	}
};

sandboxRouter.put('/plot', assetAuthed, multer.fields([
	{ name: 'csv', maxCount: 10 }
]), (ctx) => {
	const { fuse } = ctx.query;

	const csvs = [];

	for(const csv of ctx.req.files.csv){
		csvs.push(csv.buffer.toString());
	}

	io.to(ctx.client_name).emit('plot', {
		action: 'add',
		fuse: fuse === undefined ? false : fuse,
		plots: csvs,
	});

	ctx.body = {success: true};
});

sandboxRouter.get('/dataset/plots', assetAuthed, (ctx) => {
	const plots = [];

	io.to(ctx.client_name).emit('plot', {
		action: 'getAll'
	});

	ctx.body = {success: true};
});

module.exports = sandboxRouter;
