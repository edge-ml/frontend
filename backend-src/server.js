const path = require('path');
const fs   = require('fs');

const KoaStatic = require('koa-static');
const KoaRouter = require('koa-router');
const KoaLogger = require('koa-logger');

const passwordHash = require('password-hash');
const SocketIoAuth = require('socketio-auth');
const jwt  = require('jsonwebtoken');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const { uniqueNamesGenerator } = require('unique-names-generator');

const { io, app, server, activeClients } = require('./server_singleton');

const apiRouter = require('./apiRouter');

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
			jwt.verify(data.jwtToken, publicKey, (err) => {
				socket.client.twoFactorAuthenticated = true;
				const username = jwt.decode(data.jwtToken).sub;
				socket.client.username = username;
				socket.client.isTwoFAClientConfigured  = auth[username].isTwoFAClientConfigured;
				socket.client.isAdmin = auth[username].isAdmin;
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
		socket.client.isAdmin = auth[data.username].isAdmin;

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
	// generate unique-id
	const name = uniqueNamesGenerator('', true);

	socket.on('client_name', () => {
		// join room with client id name
		socket.join(name);

		socket.emit('client_name', name);

		activeClients.push(name);
	});

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
			socket.emit('labelings', labelings);
		} else {
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
		// TODO: remove client from activeClients
	});

	socket.on('users', () => {
		if (!socket.client.twoFactorAuthenticated) return;

		if (socket.client.isAdmin) {
			socket.emit('users', Object.keys(auth).map(identifier => ({
				username: identifier,
				isAdmin: auth[identifier].isAdmin,
				isRegistered: auth[identifier].isTwoFAClientConfigured
			})));
		} else {
			const user = auth[socket.client.username];
			socket.emit('users', [{
				username: socket.client.username,
				isAdmin: user.isAdmin,
				isRegistered: user.isTwoFAClientConfigured
			}]);
		}
	});

	socket.on('password', (username, newPassword, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin && username !== socket.client.username) return;

		const confirmationUsername = (socket.client.isAdmin) ? socket.client.username : username;

		if (passwordHash.verify(confirmationPassword, auth[confirmationUsername].passwordHash)) {
			auth[username].passwordHash = passwordHash.generate(newPassword);
			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});
		}
	});

	socket.on('username', (username, newName, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin && username !== socket.client.username) return;

		const confirmationUsername = (socket.client.isAdmin) ? socket.client.username : username;

		if (passwordHash.verify(confirmationPassword, auth[confirmationUsername].passwordHash)) {
			if (username !== newName && newName in auth) {
				socket.emit('has_err', true);
			} else {
				socket.emit('has_err', false);
				auth[newName] = auth[username];
				delete auth[username];
				fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
					if (err) {
						console.error(err);
					}
				});
			}
		}
	});

	socket.on('delete_user', (username, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin && username !== socket.client.username) return;

		if (passwordHash.verify(confirmationPassword, auth[socket.client.username].passwordHash)) {
			delete auth[username];
			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});
		}
	});

	socket.on('add_user', (username, password, isAdmin) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		if (username in auth) {
			socket.emit('has_err', true);
		} else {
			socket.emit('has_err', false);
			auth[username] = {
				passwordHash: passwordHash.generate(password),
				twoFactorAuthenticationSecret: null,
				isTwoFAClientConfigured: false,
				isAdmin: isAdmin,
			}
			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});
		}
	});

	socket.on('reset2FA', (username, confirmationPassword) => {
		if (!socket.client.twoFactorAuthenticated) return;
		if (!socket.client.isAdmin) return;

		if (passwordHash.verify(confirmationPassword, auth[socket.client.username].passwordHash)) {
			auth[username].twoFactorAuthenticationSecret = null;
			auth[username].isTwoFAClientConfigured = false;
			auth[username].twoFASecret = undefined;
			fs.writeFile(authPath, JSON.stringify(auth, null, '\t'), (err) => {
				if (err) {
					console.error(err);
				}
			});
		}
	});
});

app.use(KoaLogger());

const router = new KoaRouter();

router.use('/api/:name', apiRouter.routes(), apiRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(KoaStatic(path.join(__dirname, '../', 'build'), {maxage: 1}));

server.listen(3001);
