import openSocket from 'socket.io-client';

let socket;
let authenticated = false;
let verified = false;

/***
 * Authentication
 */
export const login = (username, password, callback, twoFACallback) => {
  if (socket) return;

  socket = openSocket('https://edge.ng.aura.rest');
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
    callback(true);
  } else {
    callback(false);
  }
};

export const subscribeVerified = callback => {
  socket.on('verified', success => {
    verified = success;
    callback(success);
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
