const path = require('path');
const http = require('http');
const fs   = require('fs');

const Koa = require('koa');
const socketio = require('socket.io');
const KoaStaticServer = require('koa-static-server');

const passwordHash = require('password-hash');
const SocketIoAuth = require('socketio-auth');
const jwt  = require('jsonwebtoken');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const app = new Koa();

const server = http.createServer(app.callback());

const io = socketio(server);

const authPath = path.join(__dirname, '../', 'config', 'auth.json');
const labelingsPath = path.join(__dirname, '../', 'config', 'labelings.json');

const auth = require(authPath);
let labelings = require(labelingsPath);

// JWT
const privateKeyPath = path.join(__dirname, '../', 'config', 'keys', 'private.key');
const publicKeyPath = path.join(__dirname, '../', 'config', 'keys', 'public.key');

const privateKey  = fs.readFileSync(privateKeyPath, 'utf-8');
const publicKey  = fs.readFileSync(publicKeyPath, 'utf-8');

const tokenIssuer = 'AURA';
const tokenAudience = 'http://explorer.aura.rest';


SocketIoAuth(io, {
	authenticate: (socket, data, callback) => {
		if (data.jwtToken) {
			jwt.verify(data.jwtToken, publicKey, (err, decoded) => {
				socket.client.twoFactorAuthenticated = true;
				if (err === null) callback(null, true);
			});
		} else {
			callback(null, (auth[data.username]
				&& passwordHash.verify(data.password, auth[data.username].passwordHash)));
		}
	},
	postAuthenticate: (socket, data) => {
		if (socket.client.twoFactorAuthenticated) {
			socket.client.authed = true;
			return;
		}

		socket.client.username = data.username;
		socket.client.isTwoFAClientConfigured = auth[data.username].isTwoFAClientConfigured;

		if (!socket.client.isTwoFAClientConfigured) {
			const secret = speakeasy.generateSecret();
			auth[data.username].twoFASecret = secret.base32;
			socket.client.twoFASecret = secret.base32;

			QRCode.toDataURL(secret.otpauth_url, (error, dataUrl) => {
				if (!error)	socket.emit('2FA', dataUrl);
			});
		} else {
			socket.client.isTwoFAClientConfigured = true;
			socket.client.twoFASecret = auth[data.username].twoFASecret;
			socket.emit('2FA');
		}

		socket.client.authed = true;
	},
});

io.on('connection', (socket) => {
	socket.on('2FA', (userToken) => {
		const isValid = speakeasy.totp.verify({
			secret: socket.client.twoFASecret,
			encoding: 'base32',
			token: userToken
		});

		if (isValid) {
			socket.client.twoFactorAuthenticated = true;
			const signOptions = {
				issuer: tokenIssuer,
				subject: socket.client.username,
				audience: tokenAudience,
				expiresIn: '48h',
				algorithm: 'RS256'
			};

			const token = jwt.sign({}, privateKey, signOptions);

			socket.emit('verified', true, token);
		} else {
			socket.emit('verified', false);
		}

		if (isValid && !socket.twoFAConfigured) {
			auth[socket.client.username].twoFASecret = socket.client.twoFASecret;
			auth[socket.client.username].isTwoFAClientConfigured = true;

			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if(err){
					console.error(err);
				}
			});
		}
	});

	socket.on('labelings', (newLabelings) => {
		if (!socket.client.twoFactorAuthenticated) return;

		if (!newLabelings) {
			console.log('labeling request');
			socket.emit('labelings', labelings);
		} else {
			console.log('got new labelings');
			labelings = newLabelings;

			fs.writeFile(labelingsPath, JSON.stringify(labelings, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});

			io.emit('labelings', newLabelings);
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
