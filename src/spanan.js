import Spanan from 'spanan';

const dispatchers = [];

export default class extends Spanan {

  constructor(...args) {
    super(...args);
    this.constructor.addDispatcher(this.dispatch);
  }

  static dispatch(message) {
    dispatchers.some(dispatcher => dispatcher(message));
  }

  static addDispatcher(dispatcher) {
    dispatchers.push(dispatcher);
  }

  static createDispatcher(fns, respond, matcher) {
    const dispatch = (msg) => {
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
    };

    this.addDispatcher(dispatch);
  }
}
