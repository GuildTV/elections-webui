'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = exports.has = exports.NAME = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NAME = exports.NAME = 'default';

var SOCKETS = {};

var has = exports.has = function has(name) {
    return SOCKETS.hasOwnProperty(name);
};

var get = exports.get = function get() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NAME;


    if (!has(name)) {

        throw new Error('There is no "' + name + '" socket mounted.');
    }

    return SOCKETS[name];
};

var Socket = function (_Component) {
    _inherits(Socket, _Component);

    function Socket() {
        _classCallCheck(this, Socket);

        return _possibleConstructorReturn(this, (Socket.__proto__ || Object.getPrototypeOf(Socket)).apply(this, arguments));
    }

    _createClass(Socket, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                name = _props.name,
                url = _props.url,
                options = _props.options;


            if (has(name)) {

                throw new Error('Another "' + name + '" socket is already mounted.');
            }

            SOCKETS[name] = (0, _socket2.default)(url, options);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var name = this.props.name;


            SOCKETS[name].disconnect();
            delete SOCKETS[name];
        }
    }, {
        key: 'render',
        value: function render() {

            return false;
        }
    }]);

    return Socket;
}(_react.Component);

Socket.displayName = 'Socket';

Socket.propTypes = {
    url: _react.PropTypes.string,
    name: _react.PropTypes.string,
    options: _react.PropTypes.object
};

Socket.defaultProps = {
    url: '/',
    name: NAME
};

exports.default = Socket;