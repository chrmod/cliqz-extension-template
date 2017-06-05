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
    return dispatchers.some((dispatcher) => {
      try {
        return dispatcher(message);
      } catch(e) {
        return false;
      }
    });
  }

  static export(
    actions = {},
    {
      respond = (res, req) => {},
      filter = () => true,
      transform = r => r,
    } = {},
  ) {
    const dispatch = (request) => {

      if (!filter) {
        return false;
      }

      const { args, action } = transform(request);

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
