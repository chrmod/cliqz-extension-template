import Spanan from './spanan';

export default class {
  constructor(config) {
    this.config = config;

    Spanan.export(this.config.actions,
      (response, request) => postMessage({
        udid: request.udid,
        returnedValue: response,
      }),
      (request) => request.target === 'ext1',
    );

    Spanan.export(this.config.events, null, (request) => {
      if (!request.event) {
        return false;
      }

      return Object.assign({}, request, {
        action: request.event,
      });
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
