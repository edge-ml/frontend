const path = require('path');
const http = require('http');
const fs   = require('fs');

const Koa = require('koa');
const socketio = require('socket.io');
const KoaStaticServer = require('koa-static-server');
const SocketIoAuth = require('socketio-auth');

var passwordHash = require('password-hash');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const app = new Koa();

const server = http.createServer(app.callback());

const io = socketio(server);

const labelingsPath = path.join(__dirname, '../', 'config', 'labelings.json');

const auth = require(path.join(__dirname, '../', 'config', 'auth.json'));
let labelings = require(labelingsPath);

SocketIoAuth(io, {
	authenticate: (socket, data, callback) => {
		//TODO
		callback(null, passwordHash.verify(data.password, auth[data.username].passwordHash))
	},
	postAuthenticate: (socket, data) => {
		socket.client.username = data.username;
		socket.client.isTwoFAClientConfigured = auth[data.username].isTwoFAClientConfigured;

		if (!socket.client.isTwoFAClientConfigured){
			var secret = speakeasy.generateSecret();
			auth[data.username].twoFactorAuthenticationSecret = secret.base32;
			socket.client.twoFactorAuthenticationSecret = secret.base32;
			
			QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
				socket.emit('2FA', data_url)
			});
		} else {
			socket.client.isTwoFAClientConfigured = true;
			socket.client.twoFactorAuthenticationSecret = auth[data.username].twoFactorAuthenticationSecret;
			socket.emit('2FA')
		}

		socket.client.authed = true;
	},
});

io.on('connection', (socket) => {
	socket.on('2FA', (userToken) => {
		var isValid = speakeasy.totp.verify({ secret: socket.client.twoFactorAuthenticationSecret,
			encoding: 'base32',
			token: userToken });
			
		if (isValid) {
			socket.client.twoFactorAuthenticated = true;
			socket.emit('verified', true)
		} else {
			socket.emit('verified', false)
		}
		
		if (isValid && !socket.twoFAConfigured) {
			auth[socket.client.username].twoFactorAuthenticationSecret = socket.client.twoFactorAuthenticationSecret;
			auth[socket.client.username].isTwoFAClientConfigured = true;
		}
	});

	socket.on('labelings', (newLabelings) => {
<<<<<<< HEAD
		console.log("labelings", socket.client.twoFactorAuthenticated)

		if (!socket.client.twoFactorAuthenticated) return; // TODO: this should happen somwhere consistent

		if (!newLabelings){
			socket.emit('labelings', labelings)
		} else {
			labelings = newLabelings
			socket.emit('labelings', newLabelings)
=======
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
>>>>>>> f58f5709fefd550527021acb1c0b4a97975a894b
		}
	});

	socket.on('disconnect', () => {
	});

	socket.on('user', (user) => {
		// TODO: add or update user config
	});
});

app.use(KoaStaticServer({
	rootDir: path.join(__dirname, '../', 'build'),
	index: 'index.html',
}));

server.listen(3001);


