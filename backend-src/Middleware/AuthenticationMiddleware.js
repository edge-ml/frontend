const SocketIoAuth = require('socketio-auth');
const jwt  = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

// JWT
const privateKeyPath = path.join(__dirname, '../../', 'config', 'keys', 'private.key');
const publicKeyPath = path.join(__dirname, '../../', 'config', 'keys', 'public.key');
const authPath = path.join(__dirname, '../../', 'config', 'auth.json');
const auth = require(authPath);
const passwordHash = require('password-hash');

const privateKey  = fs.readFileSync(privateKeyPath, 'utf-8');
const publicKey  = fs.readFileSync(publicKeyPath, 'utf-8');




function applyTo(io) {
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
            socket.client.isVerified = true

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

    io.use((socket, next) => {
        console.log("test");
        next()
    })
}

module.exports.applyTo = applyTo