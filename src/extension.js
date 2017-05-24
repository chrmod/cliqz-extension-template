import Spanan from 'spanan';

function createDispatcher(fns, respond, matcher) {
  return {
    dispatch(msg) {
      if (matcher && !matcher(msg)) {
        return false;
      }

      if (!fns.hasOwnProperty(msg.action)) {
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

export default class {
  constructor(config) {
    this.config = config;

    this.actionDispatcher = createDispatcher(this.config.actions,
      (message, returnedValue) => postMessage({
        udid: message.udid,
        returnedValue: returnedValue,
      }),
      (message) => message.target === 'ext1',
    );

    const moduleToInject = Object.keys(this.config).filter(
      prop => this.config[prop] === this.constructor.inject
    ).forEach((prop) => {

      const moduleWrapper = new Spanan((message) => postMessage({
        module: prop,
        action: message.functionName,
        args: message.args,
        requestId: message.udid,
      }));

      this[`${prop}Wrapper`] = moduleWrapper;
      this[prop] = moduleWrapper.createProxy();
    });
    console.log(this);
  }

  start() {
    onmessage = this.dispatch.bind(this);
    this.config.init.call(this);
  }

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
  dispatch(ev) {
    const message = ev.data;

    if (this.coreWrapper.dispatch(message)) {
      return;
    }

    if (this.actionDispatcher.dispatch(message)) {
      return;
    }
  }

  static inject() {
    // this function is just a placeholder to inject module in constructor
  }

  static create(config) {
    const extension = new this(config);
    extension.start();
  }
}
