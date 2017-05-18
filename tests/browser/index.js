import { expect } from "chai";

describe("Worker", function () {
  it("sents init message to core", function (done) {
    const worker = new Worker("/dist/index.browser.js");
    worker.addEventListener("message", function (ev) {
      const message = JSON.parse(ev.data);
      try {
        expect(message).to.have.property('module').that.equal('core');
        expect(message).to.have.property('action').that.equal('init');
        done();
      } catch(e) {
        done(e);
      }
    });
  });
})
