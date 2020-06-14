const SocketIoAuth = require("socketio-auth");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");
var request = require("request");

const tokenIssuer = "AURA";
const tokenAudience = "http://explorer.aura.rest";

// JWT
const privateKeyPath = path.join(
  __dirname,
  "../../",
  "config",
  "keys",
  "private.key"
);
const publicKeyPath = path.join(
  __dirname,
  "../../",
  "config",
  "keys",
  "public.key"
);
const authPath = path.join(__dirname, "../../", "config", "auth.json");
const auth = require(authPath);
const passwordHash = require("password-hash");

const privateKey = fs.readFileSync(privateKeyPath, "utf-8");
const publicKey = fs.readFileSync(publicKeyPath, "utf-8");

const UNAUTHED_EVENT_WHITELIST = ["authentication", "2FA"];

function applyTo(io) {
  SocketIoAuth(io, {
    authenticate: (socket, data, callback) => {
      if (data.jwtToken) {
        jwt.verify(data.jwtToken, publicKey, err => {
          socket.client.twoFactorAuthenticated = true;
          const username = jwt.decode(data.jwtToken).sub;
          socket.client.username = username;
          socket.client.isTwoFAClientConfigured =
            auth[username].isTwoFAClientConfigured;
          socket.client.isAdmin = auth[username].isAdmin;
          if (err === null) callback(null, true);
        });
      } else {
        var options = {
          method: "POST",
          url: "http://aura.dmz.teco.edu/auth/login",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          form: {
            email: auth[data.username].email,
            password: data.password
          }
        };
        request(options, function(error, response) {
          if (error) throw new Error(error);
          socket.client.tmpToken = JSON.parse(response.body).access_token
          callback(
            null,
            auth[data.username] &&
              passwordHash.verify(
                data.password,
                auth[data.username].passwordHash
              )
          );
        });
      }
    },
    postAuthenticate: (socket, data) => {
      if (socket.client.twoFactorAuthenticated) {
        socket.client.authed = true;
        return;
      }

      socket.client.username = data.username;
      socket.client.isTwoFAClientConfigured =
        auth[data.username].isTwoFAClientConfigured;
      socket.client.isAdmin = auth[data.username].isAdmin;

      if (!socket.client.isTwoFAClientConfigured) {
        const secret = speakeasy.generateSecret();
        auth[data.username].twoFASecret = secret.base32;
        socket.client.twoFASecret = secret.base32;

        QRCode.toDataURL(secret.otpauth_url, (error, dataUrl) => {
          if (!error) socket.emit("2FA", dataUrl);
        });
      } else {
        socket.client.isTwoFAClientConfigured = true;
        socket.client.twoFASecret = auth[data.username].twoFASecret;
        socket.emit("2FA");
      }

      socket.client.authed = true;
    }
  });

  // ensures that only authorized calls are possible before authentication is completed
  io.use((socket, next) => {
    let _onevent = socket.onevent;
    socket.onevent = function(packet) {
      if (
        !socket.client.twoFactorAuthenticated &&
        !UNAUTHED_EVENT_WHITELIST.includes(packet.data[0])
      )
        return;
      _onevent.call(socket, packet);
    };

    socket.on("2FA", userToken => {
      const isValid = speakeasy.totp.verify({
        secret: socket.client.twoFASecret,
        encoding: "base32",
        token: userToken
      });

      if (isValid) {
        socket.client.twoFactorAuthenticated = true;
        const signOptions = {
          issuer: tokenIssuer,
          subject: socket.client.username,
          audience: tokenAudience,
          expiresIn: "48h",
          algorithm: "RS256"
        };

        const token = jwt.sign({}, privateKey, signOptions);
        socket.emit("verified", true, token);
        socket.client.access_token = socket.client.tmpToken;
      } else {
        socket.emit("verified", false);
      }

      if (isValid && !socket.twoFAConfigured) {
        auth[socket.client.username].twoFASecret = socket.client.twoFASecret;
        auth[socket.client.username].isTwoFAClientConfigured = true;

        fs.writeFile(authPath, JSON.stringify(auth, null, "\t"), err => {
          if (err) {
            console.error(err);
          }
        });
      }
    });

    socket.on("reset2FA", (username, confirmationPassword) => {
      if (!socket.client.twoFactorAuthenticated) return;
      if (!socket.client.isAdmin) return;

      if (
        passwordHash.verify(
          confirmationPassword,
          auth[socket.client.username].passwordHash
        )
      ) {
        auth[username].twoFactorAuthenticationSecret = null;
        auth[username].isTwoFAClientConfigured = false;
        auth[username].twoFASecret = undefined;

        fs.writeFile(authPath, JSON.stringify(auth, null, "\t"), err => {
          if (err) {
            console.error(err);
          }
        });

        socket.emit("err", false);
        for (socketId in io.sockets.sockets) {
          emitUsers(io.sockets.sockets[socketId]);
        }
      } else {
        socket.emit("err", "Current password is wrong.");
      }
    });

    next();
  });
}

module.exports.applyTo = applyTo;
