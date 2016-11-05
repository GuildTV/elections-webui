'use strict';

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.ReactSocket = { Socket: _socket2.default, Listener: _listener2.default };