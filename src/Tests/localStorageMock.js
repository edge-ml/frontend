const {
  default: LocalStorageService
} = require('../services/LocalStorageService');

let LocalStorageMock = {
  clear() {},

  getItem(key) {
    return undefined;
  },

  setItem(key, value) {},

  removeItem(key) {}
};

exports.LocalStorageMock = LocalStorageService;
