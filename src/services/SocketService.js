import openSocket from 'socket.io-client';
import Cookies from 'universal-cookie';

const socketUrl = 'http://localhost:3001';
const jwt = require('jsonwebtoken');

const cookies = new Cookies();

let socket;
let authenticated = false;
let verified = false;

export let client_name = '';

/***
 * Authentication
 */
export const login = (username, password, callback, twoFACallback) => {
  if (socket) return;

  socket = openSocket(socketUrl);
  socket.on('connect', function() {
    socket.emit('authentication', { username: username, password: password });

    socket.on('authenticated', function() {
      authenticated = true;
      callback(true);
    });

    socket.on('unauthorized', function() {
      socket.disconnect();
      verified = false;
      socket = undefined;
      authenticated = false;
      callback(false);
    });

    socket.on('2FA', function(qrCode) {
      if (!authenticated) return;

      if (qrCode) {
        twoFACallback(qrCode);
      } else {
        twoFACallback();
      }
    });
  });
};

export const twoFAAuthenticate = (token, callback) => {
  if (!socket && !authenticated) return;

  socket.emit('2FA', token);
};

export const logout = callback => {
  if (socket) {
    socket.disconnect();
    authenticated = false;
    verified = false;
    socket = undefined;
    cookies.set('token', undefined, { path: '/' });
    callback(true);
  } else {
    callback(false);
  }
};

export const subscribeVerified = callback => {
  socket.on('verified', (success, token) => {
    verified = success;
    cookies.set('token', token, { path: '/' });
    callback(success);
  });
};

export const restoreSession = callback => {
  var token = cookies.get('token');
  if (!token) return;

  var decodedToken = jwt.decode(token, { complete: true });
  var dateNow = new Date();

  if (!decodedToken || decodedToken.exp < dateNow.getTime()) {
    cookies.set('token', undefined, { path: '/' });
    return;
  }

  socket = openSocket(socketUrl);

  socket.on('connect', function() {
    socket.emit('authentication', { jwtToken: token });

    socket.on('authenticated', function(success) {
      if (!success) {
        socket.disconnect();
        socket = undefined;
        return;
      } else {
        authenticated = true;
        verified = true;
        callback(true);
      }
    });
  });
};

/***
 * Labelings
 */
export const subscribeLabelings = callback => {
  if (!authenticated || !verified) return;

  socket.on('labelings', timestamp => callback(timestamp));
  socket.emit('labelings');
};

export const updateLabelings = labelings => {
  if (!authenticated || !verified) return;

  socket.emit('labelings', labelings);
};

export const unsubscribeLabelings = callback => {
  if (!authenticated || !verified) return;

  socket.off('labelings');
};

/***
 * Datasets
 */
export const subscribeDatasets = callback => {
  if (!authenticated || !verified) return;

  socket.on(`datasets`, timestamp => callback(timestamp));
  socket.emit(`datasets`);
};

export const unsubscribeDatasets = () => {
  if (!authenticated || !verified) return;

  socket.off(`datasets`);
};

/***
 * Dataset
 */
export const subscribeDataset = (id, callback) => {
  if (!authenticated || !verified) return;

  socket.on(`datasets_${id}`, timestamp => callback(null, timestamp));
};

export const unsubscribeDataset = (id, callback) => {
  if (!authenticated || !verified) return;

  socket.off(`datasets_${id}`);
};

/***
 * Client Name
 */
export const getClientName = async () => {
  return await new Promise(resolve => {
    socket.emit('client_name');
    socket.on('client_name', client_name => {
      socket.off('client_name');
      resolve(client_name);
    });
  });
};

/***
 * plot
 */
export const subscribePlot = callback => {
  socket.on('plot', data => callback(data));
};
