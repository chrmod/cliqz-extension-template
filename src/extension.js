import Spanan from './spanan';

export default class {
  constructor(config) {
    this.config = config;

    Spanan.createDispatcher(this.config.actions,
      (message, returnedValue) => postMessage({
        udid: message.udid,
        returnedValue: returnedValue,
      }),
      (message) => message.target === 'ext1',
    );

    Spanan.createDispatcher(this.config.events, null, (msg) => {
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

    Spanan.dispatch(message);
  }

  static inject() {
    // this function is just a placeholder to inject module in constructor
  }

  static create(config) {
    const extension = new this(config);
    extension.start();
  }
}
