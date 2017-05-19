import Spanan from "spanan";

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

onmessage = function (ev) {
  postMessage({
    response: ev.data,
  });
}
