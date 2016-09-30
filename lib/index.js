'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = function () {
  var defaultConfig = {
    name: shortID(),
    autoAssign: true
  };

  var config = defaultConfig;
  var actions = arguments.length <= 0 ? undefined : arguments[0];

  if (arguments.length > 1) {
    config = Object.assign(defaultConfig, arguments.length <= 0 ? undefined : arguments[0]);
    actions = arguments.length <= 1 ? undefined : arguments[1];
  }

  if (typeof config === 'string') {
    config = {
      name: config
    };
  }

  if (typeof config.name === 'string' && !config.name.length) {
    throw new Error('Jumpstate requires a name if defined in config');
  }

  var currentState = actions.initial || null;
  delete actions.initial;

  var prefixedActions = {};

  var reducerWithActions = function reducerWithActions() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? currentState : arguments[0];
    var action = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (!action || !prefixedActions[action.type]) {
      return currentState;
    }

    var payload = action._jumpstate.multiPayload ? action.payload : [action.payload];
    var nextState = prefixedActions[action.type].apply(prefixedActions, [state].concat(_toConsumableArray(payload)));
    currentState = config.autoAssign ? Object.assign({}, state, nextState) : nextState;

    return currentState;
  };

  Object.keys(actions).forEach(function (actionName) {
    var prefixedActionName = config.name + '_' + actionName;

    prefixedActions[prefixedActionName] = actions[actionName];

    reducerWithActions[actionName] = function () {
      for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
        payload[_key] = arguments[_key];
      }

      var multiPayload = payload.length > 1;
      var action = {
        _jumpstate: {
          stateName: config.name,
          actionName: actionName,
          multiPayload: multiPayload
        },
        type: prefixedActionName,
        payload: multiPayload ? payload : payload[0]
      };
      if (config.detached) {
        return reducerWithActions(currentState, action);
      } else {
        return reducerWithActions._dispatch(action);
      }
    };

    if (process.env.NODE_ENV === 'testing') {
      reducerWithActions['_' + actionName] = actions[actionName];
    }
  });

  Object.assign(reducerWithActions, {
    _config: config,
    _isJumpstate: true
  });
  reducerWithActions._config = config;

  return reducerWithActions;
};

exports.attachDispatcher = attachDispatcher;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function attachDispatcher(store, input) {
  var jumpstates = [input];

  if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
    if (input.length) {
      jumpstates = input;
    } else {
      jumpstates = [];
      Object.keys(input).forEach(function (key) {
        jumpstates.push(input[key]);
      });
    }
  }

  jumpstates.forEach(function (reducer) {
    if (reducer._isJumpstate) {
      reducer._dispatch = store.dispatch;
    }
  });
}

function shortID() {
  return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}