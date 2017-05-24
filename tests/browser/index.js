import { expect } from 'chai';

describe('Worker', function () {
  let worker;

  beforeEach(function () {
    worker = new Worker('/dist/index.browser.js');
  });

  afterEach(function () {
    //    worker.terminate();
  });

  it('sents init message to core', function (done) {
    worker.addEventListener('message', function (ev) {
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

  it('respond to echo call', function (done) {
    const testMessage = 'some message';
    const udid = Math.random();
    worker.addEventListener('message', function (ev) {

      try {
        const message = ev.data;
        if (message.udid === udid) {
          expect(message).to.have.property('returnedValue').that.equal(testMessage);
          done();
        }
      } catch(e) {
        done(e);
      }
    });

    worker.postMessage({
      udid,
      action: 'echo',
      target: 'ext1',
      args: [testMessage]
    });
  });
})
