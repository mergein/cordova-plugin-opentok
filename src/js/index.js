/* globals Cordova, OTHelpers */
import { OTPlugin } from './constants';
import { OTError as TBError } from './error';
import { pdebug, TBUpdateObjects } from './helpers';
import { TBPublisher } from './publisher';
import { TBSession } from './session';

const OT = {
  checkSystemRequirements() {
    return 1;
  },

  initPublisher(targetElement, properties, completionHandler) {
    return new TBPublisher(targetElement, properties, completionHandler);
  },

  initSession(apiKey, sessionId) {
    if (!sessionId) {
      return this.showError('OT.initSession takes 2 parameters, your API Key and Session ID');
    }
    return new TBSession(apiKey, sessionId);
  },

  log(message) {
    return pdebug('TB LOG', message);
  },

  off(/* event, handler */) {
    // TODO
  },

  on(event, handler) {
    // TB object only dispatches one type of event
    if (event === 'exception') {
      console.log('JS: TB Exception Handler added');
      Cordova.exec(handler, TBError, OTPlugin, 'exceptionHandler', []);
    }
  },

  setLogLevel() {
    return console.log('Log Level Set');
  },

  setErrorCallback(callback) {
    this.errorCallback = callback;
  },

  upgradeSystemRequirements() {
    return {};
  },

  updateViews() {
    return TBUpdateObjects();
  },

  // helpers
  getHelper() {
    if (typeof window.jasmine === 'undefined' || !window.jasmine || !window.jasmine.getEnv) {
      window.jasmine = {
        getEnv() { return; }
      };
    }
    this.OTHelper = this.OTHelper || OTHelpers.noConflict();
    return this.OTHelper;
  },

  // deprecating
  showError(a) {
    alert(a);
  },

  addEventListener(event, handler) {
    this.on(event, handler);
  },

  removeEventListener(type, handler) {
    this.off(type, handler);
  }
};

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    OT.updateViews();
    return;
  }, 1000);
}, false);

module.exports.OT = window.TB = window.OT = OT;
