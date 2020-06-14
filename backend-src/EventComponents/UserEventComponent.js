var rp = require("request-promise");
var CONSTANTS = require("../constants");
const auth = require("../../config/auth.json");
const path = require("path");
const passwordHash = require("password-hash");
const authPath = path.join(__dirname, "../../", "config", "auth.json");
const fs = require("fs");
var request = require("request");

// TODO: simplify requests ect.

let emitUsers = socket => {
  if (socket.client.isAdmin) {
    socket.emit(
      "users",
      Object.keys(auth).map(identifier => ({
        username: identifier,
        isAdmin: auth[identifier].isAdmin,
        isRegistered: auth[identifier].isTwoFAClientConfigured
      }))
    );
  } else {
    const user = auth[socket.client.username];
    socket.emit("users", [
      {
        username: socket.client.username,
        isAdmin: user.isAdmin,
        isRegistered: user.isTwoFAClientConfigured
      }
    ]);
  }
};

function applyTo(io, socket) {
  /**
   * GET all users
   */
  socket.on("users", () => {
    if (!socket.client.twoFactorAuthenticated) return;

    emitUsers(socket);
  });

  /**
   * GET get user linked to socket
   */
  socket.on("user", () => {
    if (!socket.client.twoFactorAuthenticated) return;

    const user = auth[socket.client.username];
    socket.emit("user", {
      username: socket.client.username,
      isAdmin: user.isAdmin,
      isRegistered: user.isTwoFAClientConfigured
    });
  });

  /**
   * UPDATE existing user
   */
  socket.on(
    "edit_user",
    (
      username,
      newName,
      newEmail,
      newPassword,
      isAdmin,
      confirmationPassword
    ) => {
      if (!socket.client.twoFactorAuthenticated) return;
      if (!socket.client.isAdmin && username !== socket.client.username) return;

      const confirmationUsername = socket.client.isAdmin
        ? socket.client.username
        : username;
      if (
        passwordHash.verify(
          confirmationPassword,
          auth[confirmationUsername].passwordHash
        )
      ) {
        if (username !== newName && newName in auth) {
          socket.emit("err", "This user already exists.");
        } else {
          if (username !== newName) {
            auth[newName] = auth[username];
            delete auth[username];
          }

          auth[newName].isAdmin = isAdmin;
          auth[newName].email = newEmail;

          if (newPassword) {
            auth[newName].passwordHash = passwordHash.generate(newPassword);
          }

          fs.writeFile(authPath, JSON.stringify(auth, null, "\t"), err => {
            if (err) {
              console.error(err);
            }
          });

          socket.emit("err", false);
          for (socketId in io.sockets.sockets) {
            emitUsers(io.sockets.sockets[socketId]);
          }
        }
      } else {
        socket.emit("err", "Current password is wrong.");
      }
    }
  );

  /**
   * DELETE existing user
   */
  socket.on("delete_user", (username, confirmationPassword) => {
    if (!socket.client.twoFactorAuthenticated) return;
    if (!socket.client.isAdmin && username !== socket.client.username) return;

    if (
      passwordHash.verify(
        confirmationPassword,
        auth[socket.client.username].passwordHash
      )
    ) {
      delete auth[username];
      fs.writeFile(authPath, JSON.stringify(auth, null, "\t"), err => {
        if (err) {
          console.error(err);
        }
      });

      socket.emit("err", false);
      for (socketId in io.sockets.sockets) {
        if (io.sockets.sockets[socketId].client.username !== username) {
          emitUsers(io.sockets.sockets[socketId]);
        }
      }
    } else {
      socket.emit("err", "Current password is wrong.");
    }
  });

  /**
   * ADD new user
   */
  socket.on(
    "add_user",
    (username, email, password, isAdmin, confirmationPassword) => {
      console.log("Adding user");
      console.log("Username:" + username);
      console.log("Email: " + email);
      console.log("Password:" + password);
      console.log("IsAdmin:" + isAdmin);
      console.log("ConfimationPAssword:" + confirmationPassword);
      console.log("SocketUsername: " + socket.client.username);
      if (!socket.client.twoFactorAuthenticated) return;
      if (!socket.client.isAdmin) return;

      if (
        passwordHash.verify(
          confirmationPassword,
          auth[socket.client.username].passwordHash
        )
      ) {
        if (username in auth) {
          socket.emit("err", "This user already exists.");
          console.log("User already exists");
        } else {
          auth[username] = {
            passwordHash: passwordHash.generate(password),
            email: email,
            twoFactorAuthenticationSecret: null,
            isTwoFAClientConfigured: false,
            isAdmin: isAdmin
          };

          fs.writeFile(authPath, JSON.stringify(auth, null, "\t"), err => {
            if (err) {
              console.error(err);
            }
          });

          console.log("Generating new User in REST");
          var options = {
            method: "POST",
            url: "http://aura.dmz.teco.edu/auth/register",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            form: {
              email: email,
              password: password
            }
          };
          request(options, function(error, response) {
			console.log(JSON.parse(response.body).message);
            if (error) {
              socket.emit("err", "Error creating new user");
            } else if (
              JSON.parse(response.body).message !== "Successfully created user!"
            ) {
			  console.log("Emitting error")
              socket.emit("err", "Error creating new user");
            } else {
              console.log(response.body);
              console.log("Registered new user on REST API");

              socket.emit("err", false);
              for (socketId in io.sockets.sockets) {
                emitUsers(io.sockets.sockets[socketId]);
              }
            }
          });
        }
      } else {
        socket.emit("err", "Current password is wrong.");
      }
    }
  );
}

module.exports.applyTo = applyTo;
