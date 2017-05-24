import Extension from './extension';

Extension.create({
  core: Extension.inject,

  init() {
    this.core.init();
  },

  actions: {
    echo(first, ...rest) {
      return first;
    },
  },

  events: {
    'content:location-change'(url) {

    },
  }
});
