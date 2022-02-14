export const validateEmail = email => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const getServerTime = () => {
  const ax = require('axios');
  const axios = ax.create();
  return new Promise((resolve, reject) => {
    axios
      .get(window.location.href.toString())
      .then(data => resolve(data.headers.date))
      .catch(err => reject(err));
  });
};

export const isNumber = val => {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(val);
};

export const betterModulo = (x, n) => {
  return ((x % n) + n) % n;
};

export const unixTimeToString = ms => {
  var milliseconds = parseInt((ms % 1000) / 100),
    seconds = parseInt((ms / 1000) % 60),
    minutes = parseInt((ms / (1000 * 60)) % 60),
    hours = parseInt((ms / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  if (milliseconds < 10) {
    milliseconds = '00' + milliseconds;
  } else if (milliseconds < 100) {
    milliseconds = '0' + milliseconds;
  }

  return hours + ':' + minutes + ':' + seconds + ':' + milliseconds;
};

export const toPercentage = p => (p * 100).toFixed(2) + '%';
