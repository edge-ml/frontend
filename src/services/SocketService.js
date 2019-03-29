import openSocket from 'socket.io-client';

let socket;
let authenticated = false;

/***
 *
 */
export const authenticate = (username, password) => {
  socket = openSocket('http://localhost:8000');
  socket.on('connect', function() {
    socket.emit('authentication', { username: 'John', password: 'secret' });
    socket.on('authenticated', function() {
      authenticated = true;
    });
  });
};

/***
 * Labelings
 */
export const subscribeLabelings = callback => {
  if (!authenticated) return;

  socket.on('labelings', timestamp => callback(null, timestamp));
};

export const unsubscribeLabelings = callback => {
  if (!authenticated) return;

  socket.off('labelings');
};

/***
 * Labeling
 */
export const subscribeLabeling = (id, callback) => {
  if (!authenticated) return;

  socket.on(`labelings_${id}`, timestamp => callback(null, timestamp));
};

export const unsubscribeLabeling = id => {
  if (!authenticated) return;

  socket.off(`labelings_${id}`);
};

/***
 * Datasets
 */
export const subscribeDatasets = callback => {
  if (!authenticated) return;

  socket.on(`datasets`, timestamp => callback(null, timestamp));
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

export const onDatasetLabelingsChanged = dataset => {
  if (!authenticated) return;

  dataset.labelings = dataset.labelings.array.forEach(labeling => {
    labeling.labels = labeling.labels.filter(
      label => label.from !== undefined && label.to !== undefined
    );
  });

  socket.emit(dataset.id, dataset.labelings);
};
