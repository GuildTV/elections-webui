'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _socket = require('./socket');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Listener = function (_Component) {
    _inherits(Listener, _Component);

    function Listener() {
        _classCallCheck(this, Listener);

        return _possibleConstructorReturn(this, (Listener.__proto__ || Object.getPrototypeOf(Listener)).apply(this, arguments));
    }

    _createClass(Listener, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                socket = _props.socket,
                event = _props.event,
                callback = _props.callback;


            this.socket = (0, _socket.get)(socket);
            this.socket.on(event, callback);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var _props2 = this.props,
                event = _props2.event,
                callback = _props2.callback;


            this.socket.off(event, callback);
        }
    }, {
        key: 'render',
        value: function render() {

            return false;
        }
    }]);

    return Listener;
}(_react.Component);

Listener.displayName = 'SocketListener';

Listener.propTypes = {
    socket: _react.PropTypes.string,
    event: _react.PropTypes.string.isRequired,
    callback: _react.PropTypes.func.isRequired
};

Listener.defaultProps = {
    socket: _socket.NAME
};

exports.default = Listener;