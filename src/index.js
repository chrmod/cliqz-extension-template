import Spanan from "spanan";

const coreWrapper = new Spanan((message) => {
  postMessage(JSON.stringify({
    module: 'core',
    action: message.functionName,
    args: message.args,
    requestId: message.udid,
  }));
});

const core = coreWrapper.createProxy();

core.init();
