import Spanan from 'spanan';

const actions = {
  echo(first, ...rest) {
    return first;
  },
};

function createDispatcher(fns, respond, matcher) {
  return {
    dispatch(msg) {
      if (matcher && !matcher(msg)) {
        return false;
      }

      if (!actions.hasOwnProperty(msg.action)) {
        return false;
      }

      Promise.resolve(
        fns[msg.action](...msg.args)
      ).then((returnedValue) => {
        respond(msg, returnedValue);
      });

      return true;
    }
  };
}

const actionDispatcher = createDispatcher(actions,
  (message, returnedValue) => postMessage({
    udid: message.udid,
    returnedValue: returnedValue,
  }),
  (message) => message.target === 'ext1',
);

const coreWrapper = new Spanan((message) => postMessage({
  module: 'core',
  action: message.functionName,
  args: message.args,
  requestId: message.udid,
}));

const core = coreWrapper.createProxy();

core.init();

/**
 * messages come in shape
 *
 * {
 *   udid: <number>,
 *   action: <string>,
 *   args: <Array>
 * }
 *
 */
onmessage = function (ev) {
  const message = ev.data;

  if (coreWrapper.dispatch(message)) {
    return;
  }

  if (actionDispatcher.dispatch(message)) {
    return;
  }
};
