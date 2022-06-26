var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.getProducts = function () {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PRODUCTS
      )
    )
      .then((data) => {
        resolve(data.data);
      })
      .catch((err) => reject(err.response));
  });
};

module.exports.getPrices = function () {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PRICES
      )
    )
      .then((data) => {
        resolve(data.data);
      })
      .catch((err) => reject(err.response));
  });
};

module.exports.checkout = function (priceId, customerId) {
  return new Promise(() => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.CHECKOUT,
        {
          priceId: priceId,
          customerId: customerId,
        }
      )
    )
      .then((res) => {
        window.location.href = res.data.redirectUrl; // TODO use a react router based solution
      })
      .catch((err) => console.log(err));
  });
};

module.exports.accessPortal = function (customerId) {
  return new Promise(() => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PORTAL,
        { customerId: customerId }
      )
    )
      .then((res) => {
        window.location.href = res.data.redirectUrl;
      })
      .catch((err) => console.log(err));
  });
};

module.exports.getCustomerId = function () {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CUSTOMER_ID
      )
    )
      .then((data) => {
        resolve(data.data);
      })
      .catch((err) => reject(err.response));
  });
};
