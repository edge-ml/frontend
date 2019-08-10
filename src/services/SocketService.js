import openSocket from 'socket.io-client';
import Cookies from 'universal-cookie';
import { stringify } from 'querystring';

const socketUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://explorer.aura.rest';
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

  if (!decodedToken || decodedToken.payload.exp * 1000 < dateNow.getTime()) {
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
 * LabelingsDefinition
 */
export const subscribeLabelingsDef = callback => {
  if (!authenticated || !verified) return;

  socket.on('labelings_def', labelings => callback(labelings));
  socket.emit('labelings_def');
};

export const updateLabelingsDef = labelings => {
  if (!authenticated || !verified) return;

  socket.emit('labelings_def', labelings);
};

export const unsubscribeLabelingsDef = callback => {
  if (!authenticated || !verified) return;

  socket.off('labelings_def');
};

/***
 * Datasets
 */
export const subscribeDatasets = callback => {
  if (!authenticated || !verified) return;

  socket.on('datasets', datasets => callback(datasets));
  socket.emit('datasets');
};

export const unsubscribeDatasets = () => {
  if (!authenticated || !verified) return;

  socket.off('datasets');
};

/***
 * Dataset
 */
export const subscribeDataset = (id, callback) => {
  if (!authenticated || !verified) return;

  socket.on(`dataset_${id}`, dataset => callback(dataset));
  socket.emit('dataset', id);
};

export const unsubscribeDataset = (id, callback) => {
  if (!authenticated || !verified) return;

  socket.off(`dataset_${id}`);
};

export const deleteDataset = (id, callback) => {
  if (!authenticated || !verified) return;

  socket.emit('delete_dataset', id);
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

/***
 * Labeling
 */
export const addLabeling = (datasetId, labeling) => {
  if (!authenticated || !verified) return;

  socket.emit('add_labeling', datasetId, labeling);
  socket.on('err', err => {
    if (err) {
      console.log(err);
    }
    socket.off('err');
  });
};

/***
 * Label
 */
export const addLabel = (datasetId, labelingId, label) => {
  if (!authenticated || !verified) return;

  socket.emit('add_label', datasetId, labelingId, label);
  socket.on('err', err => {
    if (err) {
      console.log(err);
    }
    socket.off('err');
  });
};

export const updateLabel = (datasetId, labelingId, label) => {
  if (!authenticated || !verified) return;

  socket.emit('update_label', datasetId, labelingId, label);
  socket.on('err', err => {
    if (err) {
      console.log(err);
    }
    socket.off('err');
  });
};

export const deleteLabel = (datasetId, labelingId, labelId) => {
  if (!authenticated || !verified) return;

  socket.emit('delete_label', datasetId, labelingId, labelId);
  socket.on('err', err => {
    if (err) {
      console.log(err);
    }
    socket.off('err');
  });
};

/***
 * Users
 */
export const subscribeUsers = callback => {
  if (!authenticated || !verified) return;

  socket.on('users', users => callback(users));
  socket.emit('users');
};

export const unsubscribeUsers = callback => {
  if (!authenticated || !verified) return;

  socket.off('users');
};

export const getCurrentUser = callback => {
  if (!authenticated || !verified) return;

  socket.emit('user');
  socket.on('user', user => {
    callback(user);
    socket.off('user');
  });
};

export const editUser = (
  username,
  newName,
  newPassword,
  isAdmin,
  confirmationPassword,
  callback
) => {
  if (!authenticated || !verified) return;

  socket.emit(
    'edit_user',
    username,
    newName,
    newPassword,
    isAdmin,
    confirmationPassword
  );
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

export const deleteUser = (username, confirmationPassword, callback) => {
  if (!authenticated || !verified) return;

  socket.emit('delete_user', username, confirmationPassword);
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

export const addUser = (
  username,
  password,
  isAdmin,
  confirmationPassword,
  callback
) => {
  if (!authenticated || !verified) return;

  socket.emit('add_user', username, password, isAdmin, confirmationPassword);
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

export const reset2FA = (username, confirmationPassword, callback) => {
  if (!authenticated || !verified) return;

  socket.emit('reset2FA', username, confirmationPassword);
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

/***
 * Sources
 */
export const subscribeSources = callback => {
  if (!authenticated || !verified) return;

  socket.on('sources', sources => callback(sources));
  socket.emit('sources');
};

export const unsubscribeSources = callback => {
  if (!authenticated || !verified) return;

  socket.off('sources');
};

export const addSource = (name, url, enabled, callback) => {
  if (!authenticated || !verified) return;

  socket.emit('add_source', name, url, enabled);
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

export const editSource = (name, newName, newUrl, enabled, callback) => {
  if (!authenticated || !verified) return;

  socket.emit('edit_source', name, newName, newUrl, enabled);
  socket.on('err', err => {
    if (err) {
      callback(err);
    }
    socket.off('err');
  });
};

export const deleteSource = name => {
  if (!authenticated || !verified) return;

  socket.emit('delete_source', name);
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

export const waitForEvent = async eventName => {
  return await new Promise(resolve => {
    socket.on(eventName, payload => {
      resolve(payload);
    });
  });
};
