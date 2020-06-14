// ACCESS CONSTANTS
//const ACCESS_TOKEN = "BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMWM1Y2FmMmExMDc5MDAxOWQ0ODRjNSIsImlhdCI6MTU3ODkxNzA1MSwiZXhwIjoxNTc5MTc2MjUxfQ.10hev08rGQ7cBPaQ2bHPO9ngbrx5arjWoAVFZYqcdls";
//module.exports.ACCESS_TOKEN = ACCESS_TOKEN
module.exports.ACCESS_TOKEN = null

// API CONSTANTS
const API_URI = 'http://aura.dmz.teco.edu/api';
const AUTH_URI = 'http://aura.dmz.teco.edu/auth';
module.exports.API_URI = API_URI
module.exports.AUTH_URI = AUTH_URI

// HTTP METHOD CONSTANTS
let HTTP_METHODS = {}
HTTP_METHODS.GET = 'GET'
HTTP_METHODS.POST = 'POST'
HTTP_METHODS.PUT = 'PUT'
HTTP_METHODS.DELETE = 'DELETE'

module.exports.HTTP_METHODS = HTTP_METHODS

// ENDPOINT CONSTANTS
let ENDPOINTS = {}
ENDPOINTS.DEFAULT = '/'
ENDPOINTS.LABEL_DEFINITIONS = '/labelDefinitions'
ENDPOINTS.LABEL_TYPES = '/labelTypes'
ENDPOINTS.DATASETS = '/datasets'
ENDPOINTS.EXPERIMENTS = '/experiments'

module.exports.ENDPOINTS = ENDPOINTS
