module.exports.adminProject = {
  users: [],
  datasets: [],
  experiments: [],
  labelDefinitions: [],
  labelTypes: [],
  _id: '601687b0c165de0fb00d9336',
  name: 'adminProject',
  admin: {
    _id: '60033e88afb9cb7ccdb4fc43',
    email: 'test@teco.edu'
  }
};

module.exports.userProject = {
  datasets: [],
  experiments: [],
  labelDefinitions: [],
  labelTypes: [],
  _id: '601687b0c165de0fb00d9336',
  name: 'userProject',
  admin: {
    _id: '60033e88afb9cb7ccdb4fc43',
    email: 'test@teco.edu'
  }
};

module.exports.projectWithUser = {
  users: [{ _id: '601687b0c165de0fb00d9336', email: 'test2@teco.edu' }],
  datasets: [],
  experiments: [],
  labelDefinitions: [],
  labelTypes: [],
  _id: '601687b0c165de0fb00d9336',
  name: 'projectWithUser',
  admin: {
    _id: '60033e88afb9cb7ccdb4fc43',
    email: 'test@teco.edu'
  }
};
