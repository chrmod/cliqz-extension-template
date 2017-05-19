import { expect } from "chai";

describe("Worker", function () {
  let worker;

  beforeEach(function () {
    worker = new Worker("/dist/index.browser.js");
  });

  it("sents init message to core", function (done) {
    worker.addEventListener("message", function (ev) {
      const message = ev.data;
      try {
        expect(message).to.have.property('module').that.equal('core');
        expect(message).to.have.property('action').that.equal('init');
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it("respond to echo call", function (done) {
    const testMessage = "some message";
    worker.addEventListener("message", function (ev) {
      worker.postMessage(testMessage);
      try {
        const message = ev.data;
        if (message.response === testMessage) {
          done();
        }
      } catch(e) {
        done(e);
      }
    });
  });
})
