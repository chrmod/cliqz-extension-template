import Spanan from 'spanan';

const dispatchers = [];

const addDispatcher = (dispatcher) => {
  dispatchers.push(dispatcher);
};

export default class extends Spanan {

  constructor(...args) {
    super(...args);
    addDispatcher(this.dispatch);
  }

  static dispatch(message) {
    dispatchers.some((dispatcher) => {
      try {
        return dispatcher(message);
      } catch(e) {
        return false;
      }
    });
  }

  static export(
    actions,
    respond = (res, req) => {},
    filterAndTransform = () => true
  ) {
    const dispatch = (request) => {
      const msg = filterAndTransform(request);
      const { args, action } = (typeof msg === 'boolean') ? request : msg;

      if (!actions.hasOwnProperty(action)) {
        return false;
      }

      let res = actions[action](...args);

      if (!(res instanceof Promise)) {
        res = Promise.resolve(res);
      }

      res.then((response) => respond(response, request));

      return true;
    };

    addDispatcher(dispatch);
  }
}
