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

export const isNumber = val => /^\d+$/.test(val);
