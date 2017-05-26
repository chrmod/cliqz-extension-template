import Spanan from 'spanan';

function createDispatcher(fns, respond, matcher) {
  return {
    dispatch(msg) {
      let { args, action } = msg;


      if (matcher) {
        const props = matcher(msg);
        if (!props) {
          return false;
        }

        action = props.action || action;
        args = props.args || args;
      }

      if (!fns.hasOwnProperty(action)) {
        return false;
      }

      Promise.resolve(
        fns[action](...msg.args)
      ).then((returnedValue) => {
        respond && respond(msg, returnedValue);
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

    this.eventsDispatcher = createDispatcher(this.config.events, null, (msg) => {
      if (!msg.event) {
        return false;
      }

      return {
        action: msg.event,
      };
    });

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

    if (this.eventsDispatcher.dispatch(message)) {
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
