import Spanan from 'spanan';

const actions = {
  echo(first, ...rest) {
    return first;
  },
};

const coreWrapper = new Spanan((message) => {
  postMessage({
    module: 'core',
    action: message.functionName,
    args: message.args,
    requestId: message.udid,
  });
});

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

  if (actions.hasOwnProperty(message.action)) {
    Promise.resolve(
      actions[message.action](...message.args)
    ).then((returnedValue) => {
      postMessage({
        udid: message.udid,
        returnedValue,
      });
    });
  }
}

