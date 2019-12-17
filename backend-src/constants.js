// ACCESS CONSTANTS
const ACCESS_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZWZjYTU3YjJlODExMDAxMmZiMzhlZiIsImlhdCI6MTU3NjQwNzU2NiwiZXhwIjoxNTc2NjY2NzY2fQ.oasaNX4lrHaWFgw8k-_-GiYDPX229EAqSE6N1nHpeCk";
module.exports.ACCESS_TOKEN = ACCESS_TOKEN

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

module.exports.ENDPOINTS = ENDPOINTS


