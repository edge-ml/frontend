import openSocket from 'socket.io-client';

let socket;
let authenticated = false;

/***
 * Authentication
 */
export const login = (username, password, callback) => {
  if (socket) return;

  socket = openSocket('http://localhost:3001');
  socket.on('connect', function() {
    socket.emit('authentication', { username: username, password: password });
    socket.on('authenticated', function() {
      authenticated = true;
      callback(true);
    });
    socket.on('unauthorized', function() {
      authenticated = false;
      callback(false);
    });
  });
};

export const logout = callback => {
  if (authenticated && socket) {
    socket.disconnect();
    authenticated = false;
    socket = undefined;
    callback(true);
  } else {
    callback(false);
  }
};

/***
 * Labelings
 */
export const subscribeLabelings = callback => {
  if (!authenticated) return;

  socket.on('labelings', timestamp => callback(timestamp));
  socket.emit('labelings');
};

export const updateLabelings = labelings => {
  if (!authenticated) return;

  socket.emit('labelings', labelings);
};

export const unsubscribeLabelings = callback => {
  if (!authenticated) return;

  socket.off('labelings');
};

/***
 * Datasets
 */
export const subscribeDatasets = callback => {
  if (!authenticated) return;

  socket.on(`datasets`, timestamp => callback(timestamp));
  socket.emit(`datasets`);
};

export const unsubscribeDatasets = () => {
  if (!authenticated) return;

  socket.off(`datasets`);
};

/***
 * Dataset
 */
export const subscribeDataset = (id, callback) => {
  if (!authenticated) return;

  socket.on(`datasets_${id}`, timestamp => callback(null, timestamp));
};

export const unsubscribeDataset = (id, callback) => {
  if (!authenticated) return;

  socket.off(`datasets_${id}`);
};
